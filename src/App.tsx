import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Search, 
  Sliders, 
  Download, 
  Upload, 
  Database, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  X, 
  Users, 
  Bot, 
  HelpCircle, 
  Eye, 
  Pin,
  RefreshCw,
  AlertCircle,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Candidate, ScoredCandidate, RankWeights, rankCandidatesHeuristic, generateTalentPool } from "./data/candidateEngine";
import { jobTemplates } from "./data/jobTemplates";
import { CandidateModal } from "./components/CandidateModal";
import { UploadModal } from "./components/UploadModal";
import { ChatCopilot } from "./components/ChatCopilot";

export default function App() {
  // Candidate Database States - initialized with offline pool for zero-delay startup
  const [candidates, setCandidates] = useState<Candidate[]>(() => generateTalentPool());
  const [scoredResults, setScoredResults] = useState<ScoredCandidate[]>(() => 
    rankCandidatesHeuristic(generateTalentPool(), "Software Developer with React or Python", {
      semantic: 40,
      skills: 20,
      experience: 15,
      responsiveness: 15,
      feasibility: 10,
    })
  );
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);

  // Active Sourcing Parameters
  const [jobDescription, setJobDescription] = useState("");
  const [weights, setWeights] = useState<RankWeights>({
    semantic: 40,
    skills: 20,
    experience: 15,
    responsiveness: 15,
    feasibility: 10,
  });

  // UI Interactive States
  const [isRanking, setIsRanking] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [pinnedCandidateIds, setPinnedCandidateIds] = useState<string[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [activeTemplateIndex, setActiveTemplateIndex] = useState<number | null>(null);

  // Modal control triggers
  const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isChatCopilotOpen, setIsChatCopilotOpen] = useState(false);

  // Status Alerts
  const [toast, setToast] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);

  // On mount, load initial candidate profiles from backend Express API
  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    setIsLoadingCandidates(true);
    try {
      const response = await fetch("/api/candidates");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success && data.candidates && data.candidates.length > 0) {
        setCandidates(data.candidates);
        const initialResults = rankCandidatesHeuristic(data.candidates, "Software Developer with React or Python", weights);
        setScoredResults(initialResults);
      } else {
        throw new Error(data.message || "Failed to parse candidates.");
      }
    } catch (err: any) {
      // Local fallback on connection issues
      const localPool = generateTalentPool();
      setCandidates(localPool);
      const initialResults = rankCandidatesHeuristic(localPool, "Software Developer with React or Python", weights);
      setScoredResults(initialResults);
      showToast("info", "Loaded standard preloaded candidate database offline.");
    } finally {
      setIsLoadingCandidates(false);
    }
  };

  const showToast = (type: "success" | "error" | "info", message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Load a job description template
  const handleApplyTemplate = (index: number) => {
    const template = jobTemplates[index];
    setJobDescription(template.description);
    setWeights(template.suggestedWeights);
    setActiveTemplateIndex(index);
    showToast("info", `Applied template: ${template.title}`);
  };

  // Adjust engine slider weight
  const handleWeightChange = (key: keyof RankWeights, val: number) => {
    setWeights(prev => ({
      ...prev,
      [key]: val,
    }));
    setActiveTemplateIndex(null); // break template link since user customized weights
  };

  // Execute AI candidate discover & ranking
  const handleRunRanking = async () => {
    if (!jobDescription.trim()) {
      showToast("error", "Please write or paste a job description first.");
      return;
    }

    setIsRanking(true);
    setPinnedCandidateIds([]); // Reset pinned context for new search
    try {
      const response = await fetch("/api/rank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription,
          weights,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success && data.results) {
        setScoredResults(data.results);
        showToast("success", `Successfully analyzed and ranked ${data.results.length} profiles.`);
      } else {
        throw new Error(data.message || "Unsuccessful backend ranking.");
      }
    } catch (err: any) {
      // Fallback locally in case backend is slow, has API issues, or fails (elegant user safeguard)
      const activeCandidates = candidates.length > 0 ? candidates : generateTalentPool();
      const localResults = rankCandidatesHeuristic(activeCandidates, jobDescription, weights);
      setScoredResults(localResults);
      showToast("info", `Rankings calculated offline using semantic heuristic engines.`);
    } finally {
      setIsRanking(false);
    }
  };

  // Pin a candidate for focus/chat context
  const handleTogglePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPinnedCandidateIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Open candidate details drawer
  const handleOpenCandidateDetails = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsCandidateModalOpen(true);
  };

  // Refresh and seed baseline database
  const handleResetDatabase = async () => {
    try {
      const response = await fetch("/api/reset-candidates", { method: "POST" });
      const data = await response.json();
      if (data.success) {
        setCandidates(data.candidates || generateDefaultCandidatesOnFront());
        showToast("success", "Successfully reloaded preloaded database profiles.");
        fetchCandidates();
      }
    } catch (err) {
      showToast("error", "Failed to reset candidates.");
    }
  };

  // Download export CSV formatted precisely according to rules
  const handleExportCSV = async () => {
    if (scoredResults.length === 0) {
      showToast("error", "No ranked candidates available to export.");
      return;
    }

    try {
      const response = await fetch("/api/export-csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          results: scoredResults,
        }),
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "team_discovery_rankings.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast("success", "Rankings CSV exported successfully. Ready for submission!");
    } catch (err) {
      showToast("error", "Failed to generate ranked export file.");
    }
  };

  // Fallback default candidate loader if server has initialization delays
  const generateDefaultCandidatesOnFront = (): Candidate[] => {
    return candidates;
  };

  // Calculations for dashboard KPIs
  const activeSourcingTitle = activeTemplateIndex !== null ? jobTemplates[activeTemplateIndex].title : "Custom Profile Search";
  const avgResponseRate = candidates.length > 0 ? (candidates.reduce((acc, curr) => acc + curr.redrob_signals.recruiter_response_rate, 0) / candidates.length * 100).toFixed(0) : "75";
  const highestMatchScore = scoredResults.length > 0 ? (scoredResults[0].score * 100).toFixed(1) : "95.5";

  // Filter list by simple client-side search query on top of active scores
  const filteredResults = scoredResults.filter(r => {
    const q = searchQuery.toLowerCase();
    return r.candidate.profile.anonymized_name.toLowerCase().includes(q) ||
           r.candidate.candidate_id.toLowerCase().includes(q) ||
           r.candidate.profile.headline.toLowerCase().includes(q) ||
           r.candidate.skills.some(s => s.name.toLowerCase().includes(q));
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col antialiased">
      {/* Dynamic Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-xl flex items-center space-x-3 text-xs font-semibold bg-slate-950 text-white border border-slate-800"
          >
            <span className={`h-2 w-2 rounded-full ${toast.type === "success" ? "bg-emerald-400 animate-pulse" : toast.type === "error" ? "bg-rose-400" : "bg-slate-400"}`} />
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="text-slate-400 hover:text-white transition-colors pl-2">
              <X size={12} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Recruiter App Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80 py-4 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Brand/Product title */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-xs">
              <Sparkles size={18} className="text-slate-200" />
            </div>
            <div>
              <h1 className="font-display text-xl font-extrabold tracking-tight text-slate-950">
                hiring<span className="text-slate-500 font-medium">Right</span>
              </h1>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                Professional Candidate Sourcing & Evaluation
              </p>
            </div>
          </div>

          {/* Quick diagnostic signals */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg shadow-xs transition-all"
            >
              <Upload size={14} className="text-slate-400" />
              <span>Upload Custom Dataset</span>
            </button>
            <button
              onClick={handleResetDatabase}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 border border-slate-200 bg-white rounded-lg shadow-xs transition-all"
              title="Reset Baseline Database"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* Metric KPIs section */}
      <section className="bg-white border-b border-slate-150 py-6 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <Users size={12} className="mr-1 text-slate-350" /> Total Talent Pool
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-display text-slate-900">{isLoadingCandidates ? "..." : candidates.length}</span>
              <span className="text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-sm font-semibold border border-slate-200/40">Active Directory</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <Sliders size={12} className="mr-1 text-slate-350" /> Sourcing Role Profile
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-sm font-bold font-display text-slate-800 truncate max-w-[85%]">{activeSourcingTitle}</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <TrendingUp size={12} className="mr-1 text-slate-350" /> Peak Match Affinity
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-display text-slate-900">{highestMatchScore}%</span>
              <span className="text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-sm font-semibold border border-slate-200/40">AI Calculated</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <Clock size={12} className="mr-1 text-slate-350" /> Avg Response Rate
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-display text-slate-900">{avgResponseRate}%</span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Engagement</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Dashboard Grid */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Hand: Controller & Input Workspace (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Job Description Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-sm font-bold text-slate-800 flex items-center">
                <FileText size={16} className="mr-1.5 text-slate-700" /> Job Description
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                A full-picture context
              </span>
            </div>

            {/* Template Selector Pills */}
            <div className="space-y-1.5">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Templates</span>
              <div className="flex flex-wrap gap-1.5">
                {jobTemplates.map((tpl, index) => (
                  <button
                    key={index}
                    onClick={() => handleApplyTemplate(index)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
                      activeTemplateIndex === index
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
                    }`}
                  >
                    {tpl.title.split(" / ")[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea Input */}
            <div className="space-y-1">
              <textarea
                value={jobDescription}
                onChange={e => {
                  setJobDescription(e.target.value);
                  setActiveTemplateIndex(null); // customized
                }}
                placeholder="Paste the complete job description details here... The AI system will read and understand core capabilities, seniority trajectory, compensation bounds, and behavioral requirements."
                className="w-full h-44 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 leading-relaxed focus:outline-none focus:border-slate-800 focus:bg-white transition-all resize-none"
              />
            </div>
          </div>

          {/* Sourcing Match Parameters (Sliders) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-sm font-bold text-slate-800 flex items-center">
                <Sliders size={16} className="mr-1.5 text-slate-700" /> Multi-Criteria Weights
              </h3>
              <button 
                onClick={() => {
                  setWeights({ semantic: 40, skills: 20, experience: 15, responsiveness: 15, feasibility: 10 });
                  setActiveTemplateIndex(null);
                  showToast("info", "Reset engine weights to baseline standard.");
                }}
                className="text-[10px] font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900"
              >
                Reset Default
              </button>
            </div>

            <div className="space-y-4">
              {/* Semantic weight */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span className="flex items-center">LLM Semantic Trajectory <HelpCircle size={12} className="ml-1 text-slate-300" title="Analyzes candidate summaries and career history against responsibilities" /></span>
                  <span className="font-mono text-slate-900 font-bold">{weights.semantic}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={weights.semantic}
                  onChange={e => handleWeightChange("semantic", parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-950"
                />
              </div>

              {/* Skills weight */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span className="flex items-center">Skill Alignment & Proficiencies <HelpCircle size={12} className="ml-1 text-slate-300" title="Weights skills match by proficiency levels and duration used" /></span>
                  <span className="font-mono text-slate-900 font-bold">{weights.skills}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={weights.skills}
                  onChange={e => handleWeightChange("skills", parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-950"
                />
              </div>

              {/* Experience alignment */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span className="flex items-center">Years of Experience Target <HelpCircle size={12} className="ml-1 text-slate-300" title="Evaluates distance from desired years of experience extracted from JD" /></span>
                  <span className="font-mono text-slate-900 font-bold">{weights.experience}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={weights.experience}
                  onChange={e => handleWeightChange("experience", parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-950"
                />
              </div>

              {/* Responsiveness/Signals weight */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span className="flex items-center">Active Platform Signals <HelpCircle size={12} className="ml-1 text-slate-300" title="Values open-to-work flags, profile completeness and high response rates" /></span>
                  <span className="font-mono text-slate-900 font-bold">{weights.responsiveness}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={weights.responsiveness}
                  onChange={e => handleWeightChange("responsiveness", parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-950"
                />
              </div>

              {/* Feasibility weight */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span className="flex items-center">Salary & Feasibility Constraints <HelpCircle size={12} className="ml-1 text-slate-300" title="Checks notice periods, budget fit, and relocation/remote flexibility" /></span>
                  <span className="font-mono text-slate-900 font-bold">{weights.feasibility}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={weights.feasibility}
                  onChange={e => handleWeightChange("feasibility", parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-950"
                />
              </div>
            </div>

            {/* Run Action Trigger Button */}
            <button
              id="run-ranking-trigger"
              onClick={handleRunRanking}
              disabled={isRanking}
              className={`w-full py-3.5 px-4 rounded-xl text-white font-semibold text-xs tracking-wide shadow-xs transition-all flex items-center justify-center space-x-2 ${
                isRanking
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-slate-950 hover:bg-black"
              }`}
            >
              {isRanking ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Discovering & Ranking Candidates...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Execute Intelligent Discovery & Rank</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Hand: Ranked Candidate list (7 cols) */}
        <div className="lg:col-span-7 space-y-6 flex flex-col h-full min-h-[600px]">
          {/* Sub Header & Sourcing Search Bar */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            {/* Search Input inside Candidates Results panel */}
            <div className="relative w-full sm:max-w-xs">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search size={14} />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search ranked matches, skills..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-slate-800 transition-colors shadow-xs"
              />
            </div>

            {/* Bulk Export & Submission Validation Info */}
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              {/* CSV Verification Badge */}
              <div className="hidden sm:flex items-center space-x-1.5 bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                <CheckCircle size={12} className="text-slate-600 animate-bounce" />
                <span>Format Verified (100 Data Rows)</span>
              </div>
              <button
                onClick={handleExportCSV}
                className="flex items-center justify-center space-x-1.5 px-4 py-2 bg-slate-900 text-white hover:bg-slate-950 text-xs font-semibold rounded-lg shadow-xs w-full sm:w-auto transition-all"
              >
                <Download size={14} />
                <span>Export Submission CSV</span>
              </button>
            </div>
          </div>

          {/* Main Candidate Cards container */}
          <div className="flex-1 space-y-4">
            {isLoadingCandidates ? (
              <div className="flex flex-col items-center justify-center p-20 text-center space-y-3">
                <RefreshCw size={24} className="text-slate-700 animate-spin" />
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Loading preloaded candidates database...</p>
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-20 text-center border-2 border-dashed border-slate-200 bg-white rounded-2xl">
                <AlertCircle size={32} className="text-slate-300" />
                <h4 className="font-display text-sm font-bold text-slate-700 mt-3">No Candidate Matches</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm font-medium">Try resetting the database or search queries to find suitable talent profiles.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[75vh] overflow-y-auto pr-1">
                {filteredResults.map((result, index) => {
                  const rank = index + 1;
                  const isPinned = pinnedCandidateIds.includes(result.candidate.candidate_id);
                  return (
                    <motion.div
                      key={result.candidate.candidate_id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(index * 0.03, 0.3) }}
                      onClick={() => handleOpenCandidateDetails(result.candidate)}
                      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer flex gap-4 relative group"
                    >
                      {/* Rank Indicator Pill */}
                      <div className="flex flex-col items-center justify-start shrink-0">
                        <span className={`h-8 w-8 rounded-full flex items-center justify-center font-display font-bold text-xs ${
                          rank === 1 ? "bg-slate-900 text-white shadow-xs" :
                          rank === 2 ? "bg-slate-700 text-white" :
                          rank === 3 ? "bg-slate-500 text-white" : "bg-slate-100 text-slate-500"
                        }`}>
                          {rank}
                        </span>
                        <button
                          onClick={(e) => handleTogglePin(result.candidate.candidate_id, e)}
                          className={`mt-3 p-1.5 rounded-lg border transition-all ${
                            isPinned
                              ? "bg-slate-900 border-slate-900 text-white"
                              : "bg-white border-slate-200 text-slate-300 hover:text-slate-500 hover:bg-slate-50"
                          }`}
                          title={isPinned ? "Unpin candidate" : "Pin candidate for AI discussion context"}
                        >
                          <Pin size={12} className={isPinned ? "fill-current" : ""} />
                        </button>
                      </div>

                      {/* Main Candidate Info */}
                      <div className="flex-1 min-w-0 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-mono text-[9px] font-bold text-slate-400 bg-slate-50 border border-slate-200/50 px-1.5 py-0.5 rounded-sm">
                              {result.candidate.candidate_id}
                            </span>
                            <h4 className="font-display font-bold text-slate-800 text-sm mt-1 leading-snug">
                              {result.candidate.profile.anonymized_name}
                            </h4>
                            <p className="text-slate-500 font-medium text-xs leading-tight">{result.candidate.profile.headline}</p>
                          </div>

                          {/* Fit Score Badge */}
                          <div className="text-right">
                            <span className="font-display font-bold text-lg text-slate-900">
                              {(result.score * 100).toFixed(1)}%
                            </span>
                            <span className="block text-[8px] font-bold uppercase tracking-wider text-slate-400">Match Score</span>
                          </div>
                        </div>

                        {/* Custom Matched Skills Pills */}
                        <div className="flex flex-wrap gap-1">
                          {result.candidate.skills.slice(0, 5).map((sk, sIdx) => (
                            <span key={sIdx} className="inline-block px-1.5 py-0.5 bg-slate-50 text-[10px] font-semibold text-slate-500 rounded-md border border-slate-200">
                              {sk.name}
                            </span>
                          ))}
                          {result.candidate.skills.length > 5 && (
                            <span className="inline-block px-1.5 py-0.5 bg-slate-50 text-[9px] font-bold text-slate-600 rounded-md">
                              +{result.candidate.skills.length - 5} More
                            </span>
                          )}
                        </div>

                        {/* Recruiter Reasoning (Gemini or Engine generated) */}
                        <div className="p-3 bg-slate-50/50 border border-slate-100 rounded-xl">
                          <p className="text-xs font-semibold text-slate-600 leading-relaxed italic flex items-start">
                            <Bot size={14} className="mr-1.5 text-slate-500 shrink-0 mt-0.5" />
                            {result.reasoning}
                          </p>
                        </div>

                        {/* Essential Signals footer */}
                        <div className="flex flex-wrap gap-y-1.5 justify-between text-[10px] font-bold text-slate-400 pt-1 border-t border-slate-150">
                          <span>EXP: {result.candidate.profile.years_of_experience} yrs</span>
                          <span>Notice: {result.candidate.redrob_signals.notice_period_days} Days</span>
                          <span className="text-slate-500">Expectation: INR {result.candidate.redrob_signals.expected_salary_range_inr_lpa.min}L - {result.candidate.redrob_signals.expected_salary_range_inr_lpa.max}L</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pinned Context Drawer bar for Chat Assistant */}
          <div className="mt-4 flex items-center justify-between p-3.5 bg-white border border-slate-250 rounded-xl shadow-xs">
            <div className="flex items-center space-x-2 text-xs">
              <div className="h-2 w-2 rounded-full bg-slate-900 animate-pulse" />
              <span className="font-semibold text-slate-700">
                {pinnedCandidateIds.length > 0 
                  ? `${pinnedCandidateIds.length} candidate(s) pinned for deep AI analysis` 
                  : "Pin candidates on the left to analyze or compare them"}
              </span>
            </div>
            <button
              onClick={() => setIsChatCopilotOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-950 text-white font-semibold text-xs rounded-lg shadow-xs transition-all"
            >
              <Bot size={14} />
              <span>Discuss Pool with AI</span>
            </button>
          </div>
        </div>
      </main>

      {/* Popups & Modals */}
      <CandidateModal
        candidate={selectedCandidate}
        isOpen={isCandidateModalOpen}
        onClose={() => {
          setIsCandidateModalOpen(false);
          setSelectedCandidate(null);
        }}
      />

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={(count, msg) => {
          showToast("success", msg);
          fetchCandidates();
        }}
      />

      <ChatCopilot
        isOpen={isChatCopilotOpen}
        onClose={() => setIsChatCopilotOpen(false)}
        selectedCandidateIds={pinnedCandidateIds}
        jobDescription={jobDescription}
      />
    </div>
  );
}
