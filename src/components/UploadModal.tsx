import React, { useState, useRef } from "react";
import { X, Upload, CheckCircle2, AlertCircle, FileText, Database, Plus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Candidate } from "../data/candidateEngine";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (count: number, message: string) => void;
}

export function UploadModal({ isOpen, onClose, onUploadSuccess }: UploadModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsedCandidates, setParsedCandidates] = useState<Candidate[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateCandidates = (json: any): Candidate[] => {
    if (!Array.isArray(json)) {
      throw new Error("Candidates must be formatted as a valid JSON array.");
    }
    if (json.length === 0) {
      throw new Error("Candidate array is empty.");
    }

    // Perform quick structural check on first element to guarantee schema compatibility
    const first = json[0];
    if (!first.candidate_id || !first.profile || !first.skills || !first.redrob_signals) {
      throw new Error("File does not match the Redrob Candidate Profile Schema. Missing key fields (profile, skills, signals).");
    }

    return json as Candidate[];
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    setParsedCandidates(null);

    if (selectedFile.type !== "application/json" && !selectedFile.name.endsWith(".json")) {
      setError("Only JSON files matching the Redrob schema are supported.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        const validated = validateCandidates(parsed);
        setParsedCandidates(validated);
      } catch (err: any) {
        setError(err.message || "Failed to parse candidate JSON file.");
      }
    };
    reader.onerror = () => {
      setError("Failed to read the file.");
    };
    reader.readAsText(selectedFile);
  };

  const executeUpload = async (overwrite: boolean) => {
    if (!parsedCandidates) return;

    setIsUploading(true);
    try {
      const response = await fetch("/api/upload-candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidates: parsedCandidates,
          overwrite,
        }),
      });

      const data = await response.json();
      if (data.success) {
        onUploadSuccess(data.count, data.message);
        onClose();
        // Reset state
        setFile(null);
        setParsedCandidates(null);
      } else {
        setError(data.message || "Upload failed.");
      }
    } catch (err: any) {
      setError(err.message || "Network error. Failed to reach server.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="upload-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
            onClick={onClose}
          />

          <motion.div
            initial={{ scale: 0.95, y: 15 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 15 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-150 p-6">
              <h3 className="font-display text-lg font-bold text-slate-800 flex items-center">
                <Upload size={18} className="mr-2 text-slate-700" />
                Upload Candidate Dataset
              </h3>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 rounded-full p-1.5 hover:bg-slate-50 transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Drag and Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  dragActive
                    ? "border-slate-800 bg-slate-50 scale-[0.99]"
                    : file
                    ? "border-emerald-400 bg-emerald-50/10"
                    : "border-slate-200 hover:border-slate-300 bg-slate-50/30"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleFileChange}
                />

                <div className="flex flex-col items-center space-y-3">
                  <div className={`p-4 rounded-full ${file ? "bg-emerald-50 text-emerald-500" : "bg-slate-100 text-slate-800"}`}>
                    <Upload size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      {file ? file.name : "Drag & Drop Candidate JSON File"}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {file ? `${(file.size / 1024).toFixed(1)} KB` : "Supports Redrob schema candidate list (.json)"}
                    </p>
                  </div>
                  {!file && (
                    <button type="button" className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg shadow-xs hover:bg-slate-50 transition-all">
                      Browse Files
                    </button>
                  )}
                </div>
              </div>

              {/* Status Previews */}
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-3 text-xs text-rose-700"
                  >
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold">Parsing Error</span>
                      <p className="mt-1 font-medium">{error}</p>
                    </div>
                  </motion.div>
                )}

                {parsedCandidates && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="space-y-4"
                  >
                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start space-x-3 text-xs text-emerald-800">
                      <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                      <div>
                        <span className="font-bold">Schema Validated</span>
                        <p className="mt-1 font-medium">Successfully parsed {parsedCandidates.length} candidate profiles matching the schema exactly.</p>
                      </div>
                    </div>

                    {/* Talent Pool Sync Choices */}
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <button
                        type="button"
                        onClick={() => executeUpload(false)}
                        disabled={isUploading}
                        className="p-4 bg-white border border-slate-200 rounded-2xl text-left hover:border-slate-350 hover:bg-slate-50/50 transition-all shadow-xs group flex flex-col justify-between h-28"
                      >
                        <Plus size={20} className="text-slate-400 group-hover:text-slate-600" />
                        <div>
                          <span className="block text-xs font-bold text-slate-700">Merge Candidates</span>
                          <span className="text-[10px] text-slate-400 font-medium">Add new profiles into current database.</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => executeUpload(true)}
                        disabled={isUploading}
                        className="p-4 bg-white border border-slate-200 rounded-2xl text-left hover:border-slate-350 hover:bg-slate-50/50 transition-all shadow-xs group flex flex-col justify-between h-28"
                      >
                        <Database size={20} className="text-slate-400 group-hover:text-slate-800" />
                        <div>
                          <span className="block text-xs font-bold text-slate-700">Replace Active Pool</span>
                          <span className="text-[10px] text-slate-400 font-medium">Fully clear and reload with this dataset.</span>
                        </div>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
