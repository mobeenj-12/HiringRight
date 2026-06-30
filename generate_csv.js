import { writeFileSync } from "fs";
import { generateTalentPool, rankCandidatesHeuristic } from "./src/data/candidateEngine.js";

const jobDescription = `We are seeking a Senior AI/ML Engineer to lead the design, development, and scaling of our next-generation generative AI products.

Key Responsibilities:
- Lead fine-tuning and optimization of Large Language Models (LLMs) using modern PEFT and LoRA techniques.
- Design high-performance semantic search, vector embeddings retrieval, and recommendation systems.
- Build and implement robust data pipelines, training workflows, and MLOps structures.
- Collaborate with product and engineering leads to prototype, validate, and deploy models to production.

Required Experience & Skills:
- 5+ years of active experience shipping production ML features.
- Deep expertise in PyTorch, NLP, Transformers, sentence-transformers, and vector databases (e.g., Pinecone, FAISS, Milvus).
- Solid coding practices in Python, and familiarity with MLOps (MLflow, Weights & Biases).
- Proven track record of evaluating and optimizing retrieval and ranking architectures.`;

const weights = {
  semantic: 40,
  skills: 20,
  experience: 15,
  responsiveness: 15,
  feasibility: 10,
};

const candidates = generateTalentPool();
const results = rankCandidatesHeuristic(candidates, jobDescription, weights);

// We need exactly 100 data rows (ranks 1 to 100)
const top100 = results.slice(0, 100);

let csvContent = "candidate_id,rank,score,reasoning\n";
top100.forEach((r, idx) => {
  const cid = r.candidate.candidate_id;
  const rank = idx + 1;
  const score = r.score.toFixed(4);
  const cleanReasoning = r.reasoning.replace(/"/g, '""').replace(/\n/g, " ");
  csvContent += `${cid},${rank},${score},"${cleanReasoning}"\n`;
});

writeFileSync("./team_discovery_rankings.csv", csvContent);
console.log("Successfully generated team_discovery_rankings.csv with exactly 100 candidates.");
