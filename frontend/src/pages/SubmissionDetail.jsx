"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { Card, CardHeader, CardTitle, CardDescription } from "../components/ui/Card"
import Button from "../components/ui/Button"
import Badge from "../components/ui/Badge"
import Navbar from "../components/Navbar"
import { useAuth } from "../context/AuthContext"

const BASE_URL = import.meta.env.VITE_API_URL || ""

const SubmissionDetail = () => {
  const { submissionId } = useParams()
  const [submission, setSubmission] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { currentUser } = useAuth()

  useEffect(() => {
    const fetchSubmission = async () => {
      if (!currentUser) {
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        const response = await fetch(`${BASE_URL}/submissions/${submissionId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch submission")
        }
        // Handle cases where data is nested under a 'data' key or is the root object
        setSubmission(data.data || data)
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchSubmission()
  }, [currentUser, submissionId])

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
          text: "TIME_LIMIT_EXCEEDED",
          icon: "⏱",
        }
      case "memory_limit_exceeded":
        return {
          color: "from-yellow-400 to-orange-500",
          glow: "shadow-yellow-500/50",
          border: "border-yellow-500/50",
          text: "MEMORY_LIMIT_EXCEEDED",
          icon: "💾",
        }
      case "runtime_error":
        return {
          color: "from-orange-400 to-red-500",
          glow: "shadow-orange-500/50",
          border: "border-orange-500/50",
          text: "RUNTIME_ERROR",
          icon: "⚠",
        }
      case "compilation_error":
        return {
          color: "from-purple-400 to-pink-500",
          glow: "shadow-purple-500/50",
          border: "border-purple-500/50",
          text: "COMPILATION_ERROR",
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
        className={`bg-gradient-to-r ${config.color} text-black font-bold px-4 py-2 shadow-lg ${config.glow} border ${config.border} font-mono`}
      >
        <span className="mr-2">{config.icon}</span>
        {config.text}
      </Badge>
    )
  }

  const renderTestCaseResult = (testCase, index) => {
    return (
      <div
        key={index}
        className="bg-gray-800/30 border border-gray-700/30 rounded-lg p-4 mb-3 hover:border-gray-600/50 transition-colors duration-300"
      >
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-cyan-400 font-mono flex items-center gap-2">
            <span>⚡</span>
            TEST_CASE_{index + 1}
          </h3>
          <div className="flex items-center gap-4">
            <div className="text-purple-400 font-mono text-sm">
              <span className="text-gray-400">TIME:</span> {testCase.executionTime}ms
            </div>
            {testCase.passed ? (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/50 font-mono">
                <span className="mr-1">✓</span>
                PASSED
              </Badge>
            ) : (
              <Badge className="bg-red-500/20 text-red-400 border-red-500/50 font-mono">
                <span className="mr-1">✗</span>
                FAILED
              </Badge>
            )}
          </div>
        </div>
      </div>
    )
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
                  LOGIN_REQUIRED
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="fixed inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] animate-pulse"></div>

        <Navbar />
        <div className="relative z-10 container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin"></div>
              <div
                className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-pink-400 rounded-full animate-spin"
                style={{ animationDirection: "reverse" }}
              ></div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-cyan-400 text-lg font-mono animate-pulse">{"> LOADING SUBMISSION..."}</p>
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
        </div>
      </div>
    )
  }

  if (error || !submission) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="fixed inset-0 bg-[linear-gradient(rgba(255,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,0,0,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

        <Navbar />
        <div className="relative z-10 container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 text-red-400 mx-auto animate-pulse">
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z" />
                  <path d="M12 8v4m0 4h.01" />
                </svg>
              </div>
              <p className="text-red-400 text-xl font-mono">{" ERROR: " + (error || "Submission not found")}</p>
              <Link to="/submissions">
                <Button className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25 bg-transparent">
                  {/* <span className="mr-2">←</span> */}
                  Back to Submissions
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
        {[...Array(15)].map((_, i) => (
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
        {/* Back Navigation */}
        <div className="mb-8">
          {submission?.problem?.slug && (
            <Link
              to={`/problems/${submission.problem.slug}`}
              className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors duration-300 group font-mono"
            >
              <span className="group-hover:-translate-x-1 transition-transform duration-300">←</span>
              {"BACK_TO_PROBLEM"}
            </Link>
          )}
        </div>

        {/* Main Submission Card */}
        <Card className="bg-gray-900/50 border border-purple-500/20 backdrop-blur-sm hover:border-purple-500/40 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/10 mb-8">
          <CardHeader className="border-b border-gray-800/50">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  {getStatusBadge(submission.status)}
                  <div className="text-gray-400 font-mono text-sm">
                    <span>SUBMISSION_ID: {submissionId?.slice(-6)}</span>
                  </div>
                </div>

                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
                  {submission.problem.title}
                </CardTitle>

                <CardDescription className="text-gray-400 font-mono">
                  <span className="text-cyan-400">SUBMITTED:</span> {formatDate(submission.submittedAt)}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <div className="p-8 space-y-8">
            {/* Submission Details Grid */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Performance Metrics */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-cyan-400 mb-4 font-mono flex items-center gap-2">
                  {"EXECUTION METRICS"}
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700/30">
                    <div className="text-center">
                      <p className="text-purple-400 font-mono text-sm font-semibold mb-2">LANGUAGE</p>
                      <p className="text-white font-mono text-lg font-bold uppercase">{submission.language}</p>
                    </div>
                  </div>
                  <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700/30">
                    <div className="text-center">
                      <p className="text-green-400 font-mono text-sm font-semibold mb-2">STATUS</p>
                      <p className="text-white font-mono text-lg font-bold uppercase">
                        {submission.status.replace("_", " ")}
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700/30">
                    <div className="text-center">
                      <p className="text-yellow-400 font-mono text-sm font-semibold mb-2">EXEC_TIME</p>
                      <p className="text-white font-mono text-lg font-bold">{submission.executionTime}ms</p>
                    </div>
                  </div>
                  <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700/30">
                    <div className="text-center">
                      <p className="text-pink-400 font-mono text-sm font-semibold mb-2">MEMORY</p>
                      <p className="text-white font-mono text-lg font-bold">{submission.memoryUsage}KB</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-pink-400 mb-4 font-mono flex items-center gap-2">
                  {"QUICK ACTIONS"}
                </h3>

                <div className="space-y-4">
                  <div className="bg-gray-800/30 p-4 rounded-lg border border-cyan-500/30 hover:border-cyan-500/50 transition-colors duration-300">
                    <Link
                      to={`/problems/${submission.problem.slug}`}
                      className="block text-cyan-400 hover:text-cyan-300 transition-colors duration-300 font-mono"
                    >
                      VIEW_PROBLEM
                    </Link>
                  </div>

                  <div className="bg-gray-800/30 p-4 rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-colors duration-300">
                    <Link
                      to={`/problems/${submission.problem.slug}/submissions`}
                      className="block text-purple-400 hover:text-purple-300 transition-colors duration-300 font-mono"
                    >
                      ALL_SUBMISSIONS
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Code Section */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-green-400 mb-4 font-mono flex items-center gap-2">
                {"SOURCE CODE"}
              </h3>

              <div className="bg-black/70 border border-green-500/20 rounded-lg overflow-hidden">
                <div className="bg-gray-800/50 px-4 py-2 border-b border-gray-700/50 flex items-center justify-between">
                  <span className="text-green-400 font-mono text-sm">
                    { submission.language.toUpperCase() + "_CODE"}
                  </span>
                  <span className="text-gray-400 font-mono text-xs">{submission.code?.length || 0} characters</span>
                </div>
                <pre className="p-6 overflow-auto max-h-96 font-mono text-sm text-green-300 leading-relaxed">
                  {submission.code}
                </pre>
              </div>
            </div>

            {/* Test Case Results */}
            {submission.testCaseResults && submission.testCaseResults.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-yellow-400 mb-4 font-mono flex items-center gap-2">
                  {"TESTCASE RESULTS"}
                </h3>

                <div className="space-y-3">
                  {submission.testCaseResults.map((testCase, index) => renderTestCaseResult(testCase, index))}
                </div>

                <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700/30 text-center">
                  <p className="text-gray-400 font-mono text-sm">
                    { submission.testCaseResults.filter((tc) => tc.passed).length +
                      "/" +
                      submission.testCaseResults.length +
                      " test cases passed"}
                  </p>
                </div>
              </div>
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

export default SubmissionDetail
