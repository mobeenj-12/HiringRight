import { AnimatePresence, motion } from "motion/react";
import { X, Briefcase, GraduationCap, Code, Award, Globe, CheckCircle, Activity, Github, Linkedin, DollarSign, Calendar, Mail, Phone, Eye, MessageSquare } from "lucide-react";
import { Candidate } from "../data/candidateEngine";

interface CandidateModalProps {
  candidate: Candidate | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CandidateModal({ candidate, isOpen, onClose }: CandidateModalProps) {
  if (!candidate) return null;

  const { profile, career_history, education, skills, certifications, languages, redrob_signals } = candidate;

  // Custom styling utilities based on value
  const getProficiencyColor = (prof: string) => {
    switch (prof) {
      case "expert": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "advanced": return "bg-teal-50 text-teal-700 border-teal-200";
      case "intermediate": return "bg-blue-50 text-blue-700 border-blue-200";
      default: return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "tier_1": return "bg-slate-900 text-white border-slate-950 font-bold";
      case "tier_2": return "bg-slate-200 text-slate-800 border-slate-350";
      case "tier_3": return "bg-slate-100 text-slate-600 border-slate-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="candidate-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-end overflow-hidden bg-slate-900/40 backdrop-blur-xs">
          {/* Backdrop Closer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
            onClick={onClose}
          />

          {/* Slide-out Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative z-10 h-full w-full max-w-2xl bg-white shadow-2xl flex flex-col border-l border-slate-150"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 bg-slate-50/50 p-6">
              <div>
                <span className="font-mono text-xs font-semibold tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded-sm border border-slate-200/60">
                  {candidate.candidate_id}
                </span>
                <h2 className="mt-2 font-display text-2xl font-bold text-slate-900">
                  {profile.anonymized_name}
                </h2>
                <p className="text-sm font-medium text-slate-600 mt-1">{profile.headline}</p>
              </div>
              <button
                id="close-candidate-modal"
                onClick={onClose}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Profile Overview Section */}
              <div className="space-y-3">
                <h3 className="flex items-center text-xs font-bold uppercase tracking-wider text-slate-400">
                  <Activity size={14} className="mr-1.5" /> Profile Overview
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {profile.summary}
                </p>
                <div className="grid grid-cols-2 gap-4 text-xs font-medium text-slate-600">
                  <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-xs">
                    <span className="block text-slate-400 font-semibold mb-0.5">Location & Country</span>
                    {profile.location}, {profile.country}
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-xs">
                    <span className="block text-slate-400 font-semibold mb-0.5">Total Experience</span>
                    {profile.years_of_experience} Years
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-xs">
                    <span className="block text-slate-400 font-semibold mb-0.5">Current Role</span>
                    {profile.current_title} @ {profile.current_company}
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-xs">
                    <span className="block text-slate-400 font-semibold mb-0.5">Industry & Size</span>
                    {profile.current_industry} ({profile.current_company_size} emp)
                  </div>
                </div>
              </div>

              {/* Engagement Signals Bento Grid */}
              <div className="space-y-4">
                <h3 className="flex items-center text-xs font-bold uppercase tracking-wider text-slate-400">
                  <Activity size={14} className="mr-1.5" /> Redrob Platform Signals
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 text-center">
                    <span className="block text-2xl font-bold text-slate-800">
                      {redrob_signals.profile_completeness_score}%
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completeness</span>
                  </div>
                  <div className="bg-slate-50/50 p-3 rounded-xl text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${redrob_signals.open_to_work_flag ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                      {redrob_signals.open_to_work_flag ? "Active" : "Passive"}
                    </span>
                    <span className="block text-[10px] text-slate-400 mt-1">Open To Work</span>
                  </div>
                  <div className="bg-slate-50/50 p-3 rounded-xl text-center">
                    <span className="block text-2xl font-bold text-slate-800">
                      {redrob_signals.notice_period_days}d
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Notice Period</span>
                  </div>

                  <div className="bg-slate-50/50 p-3 rounded-xl text-center col-span-1">
                    <span className="block text-lg font-bold text-slate-800">
                      {(redrob_signals.recruiter_response_rate * 100).toFixed(0)}%
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block leading-tight mt-0.5">Response Rate</span>
                  </div>
                  <div className="bg-slate-50/50 p-3 rounded-xl text-center col-span-1">
                    <span className="block text-lg font-bold text-slate-800">
                      {redrob_signals.avg_response_time_hours}h
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block leading-tight mt-0.5">Response Time</span>
                  </div>
                  <div className="bg-slate-50/50 p-3 rounded-xl text-center col-span-1">
                    <span className="block text-lg font-bold text-slate-800">
                      {redrob_signals.github_activity_score !== -1 ? `${redrob_signals.github_activity_score}/100` : "N/A"}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block leading-tight mt-0.5">GitHub Score</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-700">
                  <div className="flex items-center space-x-2">
                    <DollarSign size={16} className="text-slate-500" />
                    <span>Expected Salary LPA:</span>
                  </div>
                  <span className="text-slate-950 font-bold">
                    INR {redrob_signals.expected_salary_range_inr_lpa.min} - {redrob_signals.expected_salary_range_inr_lpa.max} Lakhs
                  </span>
                </div>
              </div>

              {/* Skills Tag List */}
              <div className="space-y-3">
                <h3 className="flex items-center text-xs font-bold uppercase tracking-wider text-slate-400">
                  <Code size={14} className="mr-1.5" /> Skills & Proficiencies
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <span
                      key={index}
                      className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-medium ${getProficiencyColor(skill.proficiency)}`}
                    >
                      {skill.name}
                      <span className="ml-1.5 text-[10px] opacity-75 font-semibold uppercase">{skill.proficiency}</span>
                      {skill.endorsements > 0 && (
                        <span className="ml-1 bg-white/50 px-1 rounded-sm text-[10px] font-bold">+{skill.endorsements}</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>

              {/* Career History Timeline */}
              <div className="space-y-4">
                <h3 className="flex items-center text-xs font-bold uppercase tracking-wider text-slate-400">
                  <Briefcase size={14} className="mr-1.5" /> Career History
                </h3>
                <div className="relative border-l border-slate-100 pl-4 ml-2 space-y-6">
                  {career_history.map((job, index) => (
                    <div key={index} className="relative">
                      {/* Timeline dot */}
                      <span className={`absolute -left-[21px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white ${job.is_current ? "bg-slate-900 ring-4 ring-slate-100" : "bg-slate-300"}`} />

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                          <span className="flex items-center font-mono">
                            <Calendar size={12} className="mr-1" />
                            {job.start_date} to {job.is_current ? "Present" : job.end_date}
                          </span>
                          <span>{job.duration_months} Months</span>
                        </div>
                        <h4 className="font-semibold text-sm text-slate-800">{job.title}</h4>
                        <p className="text-xs font-medium text-slate-500">
                          {job.company} • {job.industry}
                        </p>
                        <p className="text-xs text-slate-600 leading-relaxed mt-1.5">
                          {job.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education Section */}
              <div className="space-y-4">
                <h3 className="flex items-center text-xs font-bold uppercase tracking-wider text-slate-400">
                  <GraduationCap size={14} className="mr-1.5" /> Education
                </h3>
                <div className="space-y-4">
                  {education.map((edu, index) => (
                    <div key={index} className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-1.5">
                      <div className="flex items-start justify-between">
                        <h4 className="font-semibold text-sm text-slate-800">{edu.institution}</h4>
                        <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${getTierColor(edu.tier)}`}>
                          {edu.tier.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-600">
                        {edu.degree} in {edu.field_of_study}
                      </p>
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Class of {edu.end_year}</span>
                        {edu.grade && <span className="font-medium text-slate-500">Grade: {edu.grade}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certifications and Languages */}
              <div className="grid grid-cols-2 gap-6">
                {/* Languages */}
                <div className="space-y-3">
                  <h3 className="flex items-center text-xs font-bold uppercase tracking-wider text-slate-400">
                    <Globe size={14} className="mr-1.5" /> Languages
                  </h3>
                  <div className="space-y-2">
                    {languages.map((lang, index) => (
                      <div key={index} className="flex items-center justify-between text-xs font-medium p-2 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-slate-700">{lang.language}</span>
                        <span className="text-slate-400 font-semibold uppercase text-[9px] tracking-wider">{lang.proficiency}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Certifications */}
                <div className="space-y-3">
                  <h3 className="flex items-center text-xs font-bold uppercase tracking-wider text-slate-400">
                    <Award size={14} className="mr-1.5" /> Certifications
                  </h3>
                  <div className="space-y-2">
                    {certifications.length > 0 ? (
                      certifications.map((cert, index) => (
                        <div key={index} className="flex items-start space-x-2 text-xs p-2 bg-slate-50 rounded-lg border border-slate-100">
                          <CheckCircle size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-semibold text-slate-700 block leading-tight">{cert.name}</span>
                            <span className="text-[10px] text-slate-400">{cert.issuer} • {cert.year}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-slate-400 italic p-3 text-center border border-dashed border-slate-200 rounded-lg">
                        No certifications listed
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Background Verification Badges */}
              <div className="pt-4 border-t border-slate-100 flex justify-between text-[11px] font-bold text-slate-400">
                <span className="flex items-center">
                  <span className={`inline-block h-2 w-2 rounded-full mr-1.5 ${redrob_signals.verified_email ? "bg-green-500" : "bg-slate-300"}`} />
                  Verified Email
                </span>
                <span className="flex items-center">
                  <span className={`inline-block h-2 w-2 rounded-full mr-1.5 ${redrob_signals.verified_phone ? "bg-green-500" : "bg-slate-300"}`} />
                  Verified Phone
                </span>
                <span className="flex items-center">
                  <span className={`inline-block h-2 w-2 rounded-full mr-1.5 ${redrob_signals.linkedin_connected ? "bg-green-500" : "bg-slate-300"}`} />
                  LinkedIn Connected
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
