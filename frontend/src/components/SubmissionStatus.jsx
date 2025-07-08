"use client"
import { Link } from "react-router-dom"
import Modal from "./Modal"
import Badge from "./ui/Badge"

const SubmissionStatus = ({
  isOpen,
  onClose,
  submitting,
  polling,
  submissionResult,
  submissionError,
  newSubmissionId,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 p-8 rounded-xl border border-cyan-500/20 backdrop-blur-sm relative overflow-hidden">
        {/* Animated background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]"></div>

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${5 + Math.random() * 10}s linear infinite`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            ></div>
          ))}
        </div>

        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h3 className="font-mono text-2xl text-cyan-400 mb-2 flex items-center justify-center gap-2">
              {"SUBMISSION STATUS"}
            </h3>
            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent mx-auto"></div>
          </div>

          {/* Submitting State */}
          {submitting && (
            <div className="text-center space-y-6">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-yellow-500/30 border-t-yellow-400 rounded-full animate-spin mx-auto"></div>
                <div
                  className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-orange-400 rounded-full animate-spin mx-auto"
                  style={{ animationDirection: "reverse" }}
                ></div>
              </div>
              <div className="space-y-2">
                <p className="text-yellow-400 text-lg font-mono font-bold">UPLOADING SOLUTION...</p>
                <div className="flex justify-center space-x-1">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    ></div>
                  ))}
                </div>
                <p className="text-gray-400 font-mono text-sm">{"// Transmitting code to judge servers..."}</p>
              </div>
            </div>
          )}

          {/* Polling State */}
          {polling && (
            <div className="text-center space-y-6">
              <div className="relative">
                <div className="w-16 h-16 bg-cyan-400/20 rounded-full animate-pulse mx-auto flex items-center justify-center">
                  <div className="w-8 h-8 bg-cyan-400 rounded-full animate-ping"></div>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-cyan-400 text-lg font-mono font-bold">JUDGING IN PROGRESS...</p>
                <div className="bg-gray-800/50 p-4 rounded-lg border border-cyan-500/20">
                  <div className="flex items-center justify-center gap-2 text-cyan-300 font-mono text-sm">
                    <span className="animate-pulse">⚡</span>
                    <span>Running test cases</span>
                    <span className="animate-pulse">⚡</span>
                  </div>
                </div>
                <p className="text-gray-400 font-mono text-sm">{"Please wait while we evaluate your solution..."}</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {submissionError && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 text-red-400 mx-auto animate-pulse">
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  <path d="M12 7v6m0 4h.01" />
                </svg>
              </div>
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 space-y-4">
                <div className="text-center">
                  <p className="font-bold text-xl text-red-400 font-mono mb-2">SUBMISSION_ERROR</p>
                  <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-red-400 to-transparent mx-auto mb-4"></div>
                </div>
                <div className="bg-black/50 p-4 rounded border border-red-500/20">
                  <p className="text-red-300 font-mono text-sm leading-relaxed">{submissionError}</p>
                </div>
                <button
                  onClick={onClose}
                  className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-400 hover:to-pink-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-red-500/25 font-mono"
                >
                  <span className="mr-2">✗</span>
                  CLOSE_ERROR
                </button>
              </div>
            </div>
          )}

          {/* Success/Result State */}
          {submissionResult && (
            <div className="space-y-6">
              {/* Verdict Section */}
              <div className="text-center space-y-4">
                <div className="space-y-3">
                  <p className="text-gray-300 font-mono text-lg font-semibold">VERDICT:</p>
                  <Badge
                    className={`px-6 py-3 text-xl font-bold font-mono shadow-lg ${
                      submissionResult.status === "accepted"
                        ? "bg-gradient-to-r from-green-400 to-emerald-500 text-black border border-green-500/50 shadow-green-500/50"
                        : "bg-gradient-to-r from-red-400 to-pink-500 text-black border border-red-500/50 shadow-red-500/50"
                    }`}
                  >
                    {submissionResult.status === "accepted" && <span className="mr-2">✓</span>}
                    {submissionResult.status !== "accepted" && <span className="mr-2">✗</span>}
                    {submissionResult.status.replace("_", " ").toUpperCase()}
                  </Badge>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700/30">
                  <div className="text-center">
                    <p className="text-purple-400 font-mono text-sm font-semibold mb-2">EXECUTION_TIME</p>
                    <p className="text-white font-mono text-2xl font-bold">{submissionResult.executionTime}</p>
                    <p className="text-gray-400 font-mono text-xs">milliseconds</p>
                  </div>
                </div>
                <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700/30">
                  <div className="text-center">
                    <p className="text-yellow-400 font-mono text-sm font-semibold mb-2">MEMORY_USED</p>
                    <p className="text-white font-mono text-2xl font-bold">{submissionResult.memoryUsed}</p>
                    <p className="text-gray-400 font-mono text-xs">kilobytes</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Link
                  to={`/submissions/${newSubmissionId || submissionResult?._id}`}
                  onClick={onClose}
                  className="block w-full text-center bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25 font-mono"
                >
                  <span className="mr-2">👁</span>
                  VIEW_DETAILS
                </Link>

                <button
                  onClick={onClose}
                  className="w-full bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600/50 hover:border-gray-500/50 text-gray-300 hover:text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 font-mono"
                >
                  <span className="mr-2">←</span>
                  CLOSE_MODAL
                </button>
              </div>

              {/* Additional Info */}
              <div className="text-center pt-4 border-t border-gray-800/50">
                <p className="text-gray-500 font-mono text-xs">{"// Submission processed successfully"}</p>
              </div>
            </div>
          )}
        </div>

        <style jsx>{`
          @keyframes float {
            0%, 100% { 
              transform: translateY(0px) rotate(0deg); 
              opacity: 0.3; 
            }
            50% { 
              transform: translateY(-10px) rotate(180deg); 
              opacity: 0.8; 
            }
          }
        `}</style>
      </div>
    </Modal>
  )
}

export default SubmissionStatus
