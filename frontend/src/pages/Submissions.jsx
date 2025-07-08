"use client"

import { useState, useEffect } from "react"
import { Link, useParams } from "react-router-dom"
import { Card, CardHeader, CardTitle } from "../components/ui/Card"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../components/ui/Table"
import Button from "../components/ui/Button"
import Badge from "../components/ui/Badge"
import Navbar from "../components/Navbar"
import { useAuth } from "../context/AuthContext"

const BASE_URL = import.meta.env.VITE_API_URL || ""

const Submissions = () => {
  const { problemSlug } = useParams()
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const { currentUser } = useAuth()

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!currentUser) {
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        const queryParams = new URLSearchParams({ page })
        if (problemSlug) {
          // Get problem ID first
          const problemResponse = await fetch(`${BASE_URL}/problems/slug/${problemSlug}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          })
          if (!problemResponse.ok) {
            throw new Error("Failed to fetch problem")
          }
          const problemData = await problemResponse.json()
          queryParams.append("problem", problemData.data._id)
        }
        const response = await fetch(`${BASE_URL}/submissions/me?${queryParams.toString()}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch submissions")
        }
        setSubmissions(data.data)
        setTotalPages(data.totalPages || 1)
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchSubmissions()
  }, [currentUser, problemSlug, page])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  const getStatusConfig = (status) => {
    switch (status) {
      case "accepted":
        return {
          color: "from-green-400 to-emerald-500",
          glow: "shadow-green-500/50",
          border: "border-green-500/50",
          text: "ACCEPTED",
          icon: "✓",
        }
      case "wrong_answer":
        return {
          color: "from-red-400 to-pink-500",
          glow: "shadow-red-500/50",
          border: "border-red-500/50",
          text: "WRONG_ANSWER",
          icon: "✗",
        }
      case "time_limit_exceeded":
        return {
          color: "from-yellow-400 to-orange-500",
          glow: "shadow-yellow-500/50",
          border: "border-yellow-500/50",
          text: "TLE",
          icon: "⏱",
        }
      case "memory_limit_exceeded":
        return {
          color: "from-yellow-400 to-orange-500",
          glow: "shadow-yellow-500/50",
          border: "border-yellow-500/50",
          text: "MLE",
          icon: "💾",
        }
      case "runtime_error":
        return {
          color: "from-orange-400 to-red-500",
          glow: "shadow-orange-500/50",
          border: "border-orange-500/50",
          text: "RTE",
          icon: "⚠",
        }
      case "compilation_error":
        return {
          color: "from-purple-400 to-pink-500",
          glow: "shadow-purple-500/50",
          border: "border-purple-500/50",
          text: "CE",
          icon: "🔧",
        }
      case "pending":
        return {
          color: "from-blue-400 to-cyan-500",
          glow: "shadow-blue-500/50",
          border: "border-blue-500/50",
          text: "PENDING",
          icon: "⏳",
        }
      case "judging":
        return {
          color: "from-cyan-400 to-blue-500",
          glow: "shadow-cyan-500/50",
          border: "border-cyan-500/50",
          text: "JUDGING",
          icon: "⚡",
        }
      default:
        return {
          color: "from-gray-400 to-gray-500",
          glow: "shadow-gray-500/50",
          border: "border-gray-500/50",
          text: status?.toUpperCase() || "UNKNOWN",
          icon: "?",
        }
    }
  }

  const getStatusBadge = (status) => {
    const config = getStatusConfig(status)
    return (
      <Badge
        className={`bg-gradient-to-r ${config.color} text-black font-bold px-3 py-1 shadow-lg ${config.glow} border ${config.border} font-mono text-xs`}
      >
        <span className="mr-1">{config.icon}</span>
        {config.text}
      </Badge>
    )
  }

  const getLanguageColor = (language) => {
    switch (language?.toLowerCase()) {
      case "cpp":
      case "c++":
        return "text-blue-400"
      case "java":
        return "text-orange-400"
      case "python":
        return "text-green-400"
      case "javascript":
        return "text-yellow-400"
      default:
        return "text-gray-400"
    }
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="fixed inset-0 bg-[linear-gradient(rgba(255,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,0,0,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

        <Navbar />
        <div className="relative z-10 container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 text-red-400 mx-auto animate-pulse">
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
                </svg>
              </div>
              <p className="text-red-400 text-xl font-mono">{"> ACCESS_DENIED: Authentication required"}</p>
              <Link to="/login">
                <Button className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25 font-mono">
                  <span className="mr-2">🔐</span>
                  LOGIN_REQUIRED
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Animated background grid */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(0,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

      {/* Floating particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${10 + Math.random() * 20}s linear infinite`,
              animationDelay: `${Math.random() * 10}s`,
            }}
          ></div>
        ))}
      </div>

      <Navbar />

      <div className="relative z-10 container mx-auto px-4 py-8">
        <Card className="bg-gray-900/50 border border-cyan-500/20 backdrop-blur-sm hover:border-cyan-500/40 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/10">
          <CardHeader className="border-b border-gray-800/50">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
              {problemSlug ? `SUBMISSIONS FOR ${problemSlug.toUpperCase()}` : "MY SUBMISSIONS"}
            </CardTitle>
          </CardHeader>

          <div className="p-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-6">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin"></div>
                  <div
                    className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-pink-400 rounded-full animate-spin"
                    style={{ animationDirection: "reverse" }}
                  ></div>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-cyan-400 text-lg font-mono animate-pulse">{"> LOADING SUBMISSIONS..."}</p>
                  <div className="flex space-x-1">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.2}s` }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-16 space-y-6">
                <div className="w-16 h-16 text-red-400 mx-auto animate-pulse">
                  <svg fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z" />
                    <path d="M12 8v4m0 4h.01" />
                  </svg>
                </div>
                <p className="text-red-400 text-xl font-mono">{"> ERROR: " + error}</p>
                <Button
                  onClick={() => setPage(page)}
                  className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25 bg-transparent font-mono"
                >
                  <span className="mr-2">🔄</span>
                  RETRY_LOADING
                </Button>
              </div>
            ) : (
              <>
                <div className="bg-gray-800/30 rounded-lg border border-gray-700/30 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-gray-700/50 hover:bg-gray-800/50">
                        <TableHead className="text-cyan-400 font-mono font-bold">PROBLEM</TableHead>
                        <TableHead className="text-cyan-400 font-mono font-bold">STATUS</TableHead>
                        <TableHead className="text-cyan-400 font-mono font-bold">LANGUAGE</TableHead>
                        <TableHead className="text-cyan-400 font-mono font-bold">TIME</TableHead>
                        <TableHead className="text-cyan-400 font-mono font-bold">MEMORY</TableHead>
                        <TableHead className="text-cyan-400 font-mono font-bold">SUBMITTED</TableHead>
                        <TableHead className="text-cyan-400 font-mono font-bold">ACTION</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {submissions.length > 0 ? (
                        submissions.map((submission, index) => (
                          <TableRow
                            key={submission._id}
                            className="border-b border-gray-700/30 hover:bg-gray-800/30 transition-colors duration-300"
                          >
                            <TableCell className="font-medium">
                              <Link
                                to={`/problems/${submission.problem.slug}`}
                                className="text-blue-400 hover:text-blue-300 hover:underline transition-colors duration-300 font-medium"
                              >
                                {submission.problem.title}
                              </Link>
                            </TableCell>
                            <TableCell>{getStatusBadge(submission.status)}</TableCell>
                            <TableCell>
                              <span
                                className={`font-mono font-bold uppercase ${getLanguageColor(submission.language)}`}
                              >
                                {submission.language}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="text-purple-400 font-mono">{submission.executionTime}ms</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-yellow-400 font-mono">{submission.memoryUsage}KB</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-gray-400 font-mono text-sm">
                                {formatDate(submission.submittedAt)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Link to={`/submissions/${submission._id}`}>
                                <Button
                                  size="sm"
                                  className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25 font-mono text-xs text-white"
                                >
                                  <span className="text-sm">👁</span>
                                  VIEW
                                </Button>

                              </Link>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-16">
                            <div className="space-y-4">
                              <div className="w-16 h-16 text-gray-500 mx-auto">
                                <svg fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                  <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z" />
                                </svg>
                              </div>
                              <p className="text-gray-400 font-mono text-lg">{"> NO_SUBMISSIONS_FOUND"}</p>
                              <p className="text-gray-500 font-mono text-sm">
                                {"// Start solving problems to see your submissions here"}
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-between items-center mt-8 bg-gray-800/30 p-4 rounded-lg border border-gray-700/30">
                    <Button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page <= 1}
                      className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25 bg-transparent font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="mr-2">←</span>
                      PREV
                    </Button>

                    <div className="flex items-center gap-4">
                      <span className="text-gray-400 font-mono text-sm">PAGE</span>
                      <span className="text-cyan-400 font-mono font-bold text-lg">{page}</span>
                      <span className="text-gray-400 font-mono text-sm">OF</span>
                      <span className="text-purple-400 font-mono font-bold text-lg">{totalPages}</span>
                    </div>

                    <Button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page >= totalPages}
                      className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25 bg-transparent font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      NEXT
                      <span className="ml-2">→</span>
                    </Button>
                  </div>
                )}

                {/* Stats Footer */}
                <div className="mt-6 text-center">
                  <p className="text-gray-500 font-mono text-sm">
                    {"// Showing " + submissions.length + " submissions on page " + page}
                  </p>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg); 
            opacity: 0.3; 
          }
          50% { 
            transform: translateY(-20px) rotate(180deg); 
            opacity: 0.8; 
          }
        }
      `}</style>
    </div>
  )
}

export default Submissions
