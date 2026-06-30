import express from "express";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { generateTalentPool, rankCandidatesHeuristic, Candidate } from "./src/data/candidateEngine.js";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: "50mb" }));

// State store in memory (initialized with synthetic + preloaded candidates)
let candidateDatabase: Candidate[] = generateTalentPool();

// Lazy initialize Gemini API client to prevent crashing on startup
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY") {
    try {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    } catch (err) {
      console.error("Failed to initialize GoogleGenAI client:", err);
    }
  }
  return aiClient;
}

// REST API Endpoints

// 1. Get all candidate profiles
app.get("/api/candidates", (req, res) => {
  res.json({
    success: true,
    count: candidateDatabase.length,
    candidates: candidateDatabase,
  });
});

// 2. Upload custom candidate profiles
app.post("/api/upload-candidates", (req, res) => {
  try {
    const { candidates, overwrite } = req.body;
    if (!Array.isArray(candidates)) {
      return res.status(400).json({ success: false, message: "Invalid candidate format. Expected a JSON array." });
    }

    if (overwrite) {
      candidateDatabase = candidates as Candidate[];
    } else {
      // Merge by candidate_id, keeping unique ones
      const existingIds = new Set(candidateDatabase.map(c => c.candidate_id));
      candidates.forEach((cand: any) => {
        if (cand.candidate_id && !existingIds.has(cand.candidate_id)) {
          candidateDatabase.push(cand as Candidate);
        }
      });
    }

    res.json({
      success: true,
      count: candidateDatabase.length,
      message: `Successfully uploaded ${candidates.length} profiles. Total database size is now ${candidateDatabase.length}.`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. Reset database to default
app.post("/api/reset-candidates", (req, res) => {
  candidateDatabase = generateTalentPool();
  res.json({
    success: true,
    count: candidateDatabase.length,
    message: "Successfully reset database to preloaded profiles.",
  });
});

// 4. Multi-Criteria candidate ranking & AI reasoning proxy
app.post("/api/rank", async (req, res) => {
  try {
    const { jobDescription, weights } = req.body;

    if (!jobDescription) {
      return res.status(400).json({ success: false, message: "Job description is required." });
    }

    const currentWeights = weights || {
      semantic: 40,
      skills: 20,
      experience: 15,
      responsiveness: 15,
      feasibility: 10,
    };

    // Calculate baseline rank and breakdown scores using candidate engine
    const heuristicResults = rankCandidatesHeuristic(candidateDatabase, jobDescription, currentWeights);

    const ai = getAIClient();
    if (ai) {
      // To deliver extreme quality without hitting API timeouts,
      // we take the top 12 matches and enrich them with full-stack server-side Gemini semantic analysis!
      // This is a beautiful hybrid architecture.
      const topCount = Math.min(12, heuristicResults.length);
      const topCandidates = heuristicResults.slice(0, topCount);

      const prompt = `
        You are a stellar executive recruiter. Analyze the following top candidates against the Job Description.
        For each candidate, write a concise, scannable recruiter reasoning (exactly 1-2 sentences) summarizing:
        1. Their actual fit for the role (skills and career trajectory).
        2. Notable platform engagement/behavioral signals or expected salary constraints.

        Job Description:
        "${jobDescription}"

        Candidates to Analyze:
        ${topCandidates.map(r => `
          - ID: ${r.candidate.candidate_id}
            Name: ${r.candidate.profile.anonymized_name}
            Headline: ${r.candidate.profile.headline}
            Summary: ${r.candidate.profile.summary}
            Years of Experience: ${r.candidate.profile.years_of_experience}
            Current Title: ${r.candidate.profile.current_title}
            Skills: ${r.candidate.skills.map(s => `${s.name} (${s.proficiency})`).join(", ")}
            Open to Work: ${r.candidate.redrob_signals.open_to_work_flag}
            Expected Salary: INR ${r.candidate.redrob_signals.expected_salary_range_inr_lpa.min} - ${r.candidate.redrob_signals.expected_salary_range_inr_lpa.max} LPA
            Notice Period: ${r.candidate.redrob_signals.notice_period_days} days
        `).join("\n")}

        Respond ONLY with a valid JSON array of objects structured exactly like this:
        [
          {
            "candidate_id": "CAND_XXXXXXX",
            "recruiter_reasoning": "...",
            "semantic_fit_rating_0_to_100": 85
          }
        ]
      `;

      try {
        const aiResponse = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          },
        });

        let rawText = aiResponse.text ? aiResponse.text.trim() : "";
        if (rawText) {
          // Robust cleaning of markdown tags (e.g. ```json ... ```)
          if (rawText.startsWith("```")) {
            rawText = rawText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
          }
          
          let aiAnalysis: any = null;
          try {
            aiAnalysis = JSON.parse(rawText);
          } catch (jsonErr) {
            // Attempt to extract array from any wrapper object if it failed
            const arrayMatch = rawText.match(/\[[\s\S]*\]/);
            if (arrayMatch) {
              try {
                aiAnalysis = JSON.parse(arrayMatch[0]);
              } catch (innerJsonErr) {
                console.error("Could not extract JSON array from text:", innerJsonErr);
              }
            }
          }

          if (aiAnalysis) {
            // If the model wrapped the array in a parent object, extract it
            let analysisList: any[] = [];
            if (Array.isArray(aiAnalysis)) {
              analysisList = aiAnalysis;
            } else if (typeof aiAnalysis === "object" && aiAnalysis !== null) {
              const possibleArray = Object.values(aiAnalysis).find(val => Array.isArray(val));
              if (possibleArray) {
                analysisList = possibleArray as any[];
              }
            }

            const aiAnalysisMap = new Map<string, { recruiter_reasoning: string; semantic_fit_rating_0_to_100: number }>();
            analysisList.forEach((item: any) => {
              if (item && item.candidate_id) {
                aiAnalysisMap.set(item.candidate_id, item);
              }
            });

            // Blend AI scores and reasonings into top results
            heuristicResults.forEach((resItem) => {
              const aiData = aiAnalysisMap.get(resItem.candidate.candidate_id);
              if (aiData) {
                resItem.reasoning = aiData.recruiter_reasoning || resItem.reasoning;
                // Adjust score slightly based on deep LLM semantic rating
                const oldScore = resItem.score;
                const normalizedLLM = (aiData.semantic_fit_rating_0_to_100 || 50) / 100;
                // Blend the baseline heuristics score with Gemini's reasoning
                resItem.score = parseFloat(((oldScore * 0.7) + (normalizedLLM * 0.3)).toFixed(4));
                resItem.breakdown.semantic = aiData.semantic_fit_rating_0_to_100 || resItem.breakdown.semantic;
              }
            });

            // Re-sort to maintain tie-break compliance
            heuristicResults.sort((a, b) => {
              if (Math.abs(a.score - b.score) > 0.00001) {
                return b.score - a.score;
              }
              return a.candidate.candidate_id.localeCompare(b.candidate.candidate_id);
            });
          }
        }
      } catch (geminiError) {
        console.error("Gemini enrichment failed. Falling back to baseline calculations:", geminiError);
      }
    }

    res.json({
      success: true,
      jobDescription,
      weights: currentWeights,
      results: heuristicResults,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 5. Interactive candidate Q&A / Comparative analysis
app.post("/api/chat", async (req, res) => {
  try {
    const { message, candidateIds, jobDescription } = req.body;
    const ai = getAIClient();

    if (!ai) {
      return res.json({
        success: true,
        reply: "System running in local diagnostic mode (Missing or unconfigured GEMINI_API_KEY). Set up your API key in **Settings > Secrets** to enable interactive recruiter chats!",
      });
    }

    const selectedCandidates = candidateDatabase.filter(c => candidateIds?.includes(c.candidate_id));

    const prompt = `
      You are an elite talent acquisition partner. Answer the recruiter's inquiry with professional poise, clear insights, and scannable bullet points.
      Do not output any markdown headers or clinical developer paths. Speak strictly in business recruitment contexts.

      Job Description:
      "${jobDescription || "Not provided"}"

      Candidates under focus:
      ${selectedCandidates.map(c => `
        - ID: ${c.candidate_id} (${c.profile.anonymized_name})
          Title: ${c.profile.current_title} at ${c.profile.current_company} (${c.profile.years_of_experience} yrs exp)
          Summary: ${c.profile.summary}
          Skills: ${c.skills.map(s => s.name).join(", ")}
          Expected Salary: INR ${c.redrob_signals.expected_salary_range_inr_lpa.min} - ${c.redrob_signals.expected_salary_range_inr_lpa.max} LPA
          Response Rate: ${(c.redrob_signals.recruiter_response_rate * 100).toFixed(0)}%
          Notice Period: ${c.redrob_signals.notice_period_days} days
      `).join("\n")}

      Recruiter Query:
      "${message}"
    `;

    const chatResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({
      success: true,
      reply: chatResponse.text,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 6. Bulk Export CSV in exact required schema
app.post("/api/export-csv", (req, res) => {
  try {
    const { results } = req.body;
    if (!Array.isArray(results)) {
      return res.status(400).json({ success: false, message: "No ranking results provided for CSV generation." });
    }

    // Row 1 = header: candidate_id,rank,score,reasoning
    let csvContent = "candidate_id,rank,score,reasoning\n";
    results.forEach((r: any, index: number) => {
      const cid = r.candidate.candidate_id;
      const rank = index + 1;
      const score = r.score.toFixed(4);
      // Clean and escape reasoning for CSV compatibility
      const cleanReasoning = (r.reasoning || "")
        .replace(/"/g, '""')
        .replace(/\n/g, " ");
      csvContent += `${cid},${rank},${score},"${cleanReasoning}"\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="ranked_candidates.csv"');
    res.send(csvContent);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Integration with Vite development middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
