"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { Card, CardHeader, CardTitle, CardDescription } from "../components/ui/Card"
import { FormGroup, FormLabel, FormSelect } from "../components/ui/Form"
import Button from "../components/ui/Button"
import Navbar from "../components/Navbar"
import Badge from "../components/ui/Badge"
import Editor from "@monaco-editor/react"
import defaultStubs from "../defaultStubs"
import SubmissionStatus from "../components/SubmissionStatus"

const BASE_URL = import.meta.env.VITE_API_URL || ""

const ProblemDetail = () => {
  const { slug } = useParams()
  const [problem, setProblem] = useState(null)
  const [problemId, setProblemId] = useState(null) // Stable ID for submissions
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [code, setCode] = useState("")
  const [language, setLanguage] = useState("cpp")

  // When language changes and there is no last submission, show the stub
  useEffect(() => {
    if (!lastSubmission && problem) {
      setCode(defaultStubs[language] || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);
  const [output, setOutput] = useState("")
  const [results, setResults] = useState([])
  const [activeCase, setActiveCase] = useState(0)
  const [running, setRunning] = useState(false)
  const [lastSubmission, setLastSubmission] = useState(null)
  const [customInput, setCustomInput] = useState("")
  const [useCustomInput, setUseCustomInput] = useState(false)

  const [submissionResult, setSubmissionResult] = useState(null);
  const [newSubmissionId, setNewSubmissionId] = useState(null);
  const [pollingId, setPollingId] = useState(null);
  const [polling, setPolling] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  
  useEffect(() => {
    const fetchProblem = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${BASE_URL}/problems/slug/${slug}`)
        const data = await response.json()
        if (!response.ok) throw new Error(data.message || "Failed to fetch problem")
        setProblem(data.data)
        setProblemId(data.data._id) // Set the stable ID here
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProblem()
  }, [slug])

  useEffect(() => {
    const fetchLastSubmission = async () => {
      if (!problem) {
        return;
      }
      try {
        // Always use the default code stub for now
        // The last submission feature has been temporarily disabled
        setLastSubmission(null);
        setCode(defaultStubs[language] || "");
      } catch (error) {
        setLastSubmission(null);
        setCode(defaultStubs[language] || "");
        console.error("Error fetching last submission:", error);
      }
    };

    fetchLastSubmission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problem]);

  // Poll for submission result after submit
  useEffect(() => {
    if (!pollingId) return;
    setSubmissionResult(null);

    const token = localStorage.getItem("token");
    let interval = setInterval(async () => {
      const response = await fetch(`${BASE_URL}/submissions/${pollingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.data && !["pending", "judging"].includes(data.data.status)) {
        setSubmissionResult(data.data);
        setPolling(false);
        clearInterval(interval);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [pollingId]);

  const handleRun = async () => {
    if (!code.trim()) {
      alert("Please enter your code");
      return;
    }

    setRunning(true);
    // Always clear previous output before a new run
    setOutput(null);

    try {
      const token = localStorage.getItem("token");
      const body = {
        problemId: problem._id,
        language,
        code,
        customInput: useCustomInput ? customInput : null,
      };

      const res = await fetch(`${BASE_URL}/run`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error running code");
      }

      if (useCustomInput) {
        // For a custom run, set the output and clear any previous test results
        setOutput(data.output || "// Execution finished with no output.");
        setResults([]);
      } else {
        // For a standard run, set the test results and ensure output is cleared
        setResults(data.results || []);
        setOutput(null);
      }
      setActiveCase(0);

    } catch (err) {
      // If the whole run fails, show error in the output area only for custom input
      if (useCustomInput) {
        setOutput(err.message);
      }
      setResults([]);
    } finally {
      setRunning(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Do NOT reset submissionResult here, as it's needed for the 'View Details' link
    // and to show the final status on the page.
    setSubmissionError(null);
    setPolling(false);
    // We can keep pollingId if we want, or clear it. Let's clear it to be safe.
    setPollingId(null);
    setNewSubmissionId(null); // CRITICAL: Reset the ID for the next submission
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      alert("Please enter your code.");
      return;
    }

    // Start loading indicator immediately
    setSubmitting(true);
    setSubmissionError(null);
    setNewSubmissionId(null); // Clear old ID

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("You must be logged in to submit a solution.");
      }

      // Create the submission first
      const response = await fetch(`${BASE_URL}/submissions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          problem: problemId, // Use the stable problem ID
          language,
          code,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to submit solution");
      }

      const newSubmission = data.data;

      // NOW that we have a valid submission, set all states and open the modal
      setSubmissionResult(newSubmission);
      setNewSubmissionId(newSubmission._id);
      setPollingId(newSubmission._id);
      setPolling(true);
      setIsModalOpen(true); // Open modal only on success

    } catch (error) {
      // If anything fails, show the error in the modal
      setSubmissionError(error.message);
      setIsModalOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  const difficultyConfig = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return {
          color: "from-green-400 to-emerald-500",
          glow: "shadow-green-500/50",
          border: "border-green-500/50",
        }
      case "medium":
        return {
          color: "from-yellow-400 to-orange-500",
          glow: "shadow-yellow-500/50",
          border: "border-yellow-500/50",
        }
      case "hard":
        return {
          color: "from-red-400 to-pink-500",
          glow: "shadow-red-500/50",
          border: "border-red-500/50",
        }
      default:
        return {
          color: "from-blue-400 to-cyan-500",
          glow: "shadow-blue-500/50",
          border: "border-blue-500/50",
        }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        {/* Animated background grid */}
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
              <p className="text-cyan-400 text-lg font-mono animate-pulse">{"> LOADING PROBLEM..."}</p>
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

  if (error || !problem) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="fixed inset-0 bg-[linear-gradient(rgba(255,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,0,0,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

        <Navbar />
        <div className="relative z-10 container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 text-red-400 mx-auto animate-pulse">
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2 3h20l-2 18H4L2 3zm2.5 2l1.5 14h12l1.5-14H4.5zM12 6v8m0 2v2" />
                </svg>
              </div>
              <p className="text-red-400 text-xl font-mono">{"> ERROR: " + (error || "Problem not found")}</p>
              <Link to="/problems">
                <Button className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25 bg-transparent">
                  <span className="mr-2">←</span>
                  Back to Problems
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const diffConfig = difficultyConfig(problem.difficulty)

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

      <div className="relative z-10 mx-auto px-4 py-8">
        {/* Back Navigation */}
        <div className="mb-8">
          <Link
            to="/problems"
            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors duration-300 group font-mono"
          >
            <span className="group-hover:-translate-x-1 transition-transform duration-300">←</span>
            {"< BACK_TO_PROBLEMS"}
          </Link>
        </div>

        {/* Main Content Grid */}
        <div className="xl:flex xl:gap-8 xl:h-[calc(100vh-12rem)]">
          {/* LEFT: Problem Description */}
          <div className="space-y-6 xl:w-1/2 xl:overflow-y-auto pr-4">
            <Card className="bg-gray-900/50 border border-cyan-500/20 backdrop-blur-sm hover:border-cyan-500/40 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/10">
              <CardHeader className="border-b border-gray-800/50">
                <div className="flex items-center gap-3 mb-4">
                  <Badge
                    className={`bg-gradient-to-r ${diffConfig.color} text-black font-bold px-3 py-1 shadow-lg ${diffConfig.glow} border ${diffConfig.border} capitalize`}
                  >
                    {problem.difficulty}
                  </Badge>
                  <div className="flex items-center gap-2 text-gray-400 font-mono text-sm">
                    <span>⚡</span>
                    <span>PROBLEM_ID: {problem._id?.slice(-6)}</span>
                  </div>
                </div>

                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  {problem.title}
                </CardTitle>

                <div className="flex flex-wrap gap-2 mt-4">
                  {problem.tags?.map((tag) => (
                    <Badge
                      key={tag}
                      className="bg-gray-700/50 border-gray-600/50 text-gray-300 hover:border-cyan-500/50 hover:text-cyan-400 transition-all duration-300 font-mono text-xs"
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </CardHeader>

              <div className="p-6 space-y-6">
                <div className="prose prose-invert max-w-none">
                  <div className="space-y-6">
                    <section>
                      <h3 className="text-lg font-bold text-cyan-400 mb-3 font-mono flex items-center gap-2">
                        {"DESCRIPTION"}
                      </h3>
                      <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50 whitespace-pre-wrap text-gray-300 leading-relaxed">
                        {problem.description}
                      </div>
                    </section>

                    <section>
                      <h3 className="text-lg font-bold text-purple-100 mb-3 font-mono">{"INPUT FORMAT"}</h3>
                      <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50 whitespace-pre-wrap text-gray-300 font-mono text-sm">
                        {problem.inputFormat}
                      </div>
                    </section>

                    <section>
                      <h3 className="text-lg font-bold text-purple-100 mb-3 font-mono">{"OUTPUT FORMAT"}</h3>
                      <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50 whitespace-pre-wrap text-gray-300 font-mono text-sm">
                        {problem.outputFormat}
                      </div>
                    </section>

                    <section>
                      <h3 className="text-lg font-bold text-yellow-400 mb-3 font-mono">{"CONSTRAINTS"}</h3>
                      <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50 whitespace-pre-wrap text-gray-300 font-mono text-sm">
                        {problem.constraints}
                      </div>
                    </section>

                    <section>
                      <h3 className="text-lg font-bold text-pink-400 mb-3 font-mono">{"EXAMPLES"}</h3>
                      <div className="space-y-4">
                        {problem.sampleTestCases?.map((testCase, index) => (
                          <div key={index} className="bg-gray-800/30 p-4 rounded-lg border border-gray-700/30">
                            <p className="font-bold text-cyan-400 mb-3 font-mono">EXAMPLE_{index + 1}</p>

                            <div className="space-y-3">
                              <div>
                                <p className="font-semibold text-green-400 mb-2 font-mono text-sm">INPUT:</p>
                                <pre className="bg-black/50 p-3 rounded border border-green-500/20 text-green-300 font-mono text-sm overflow-x-auto">
                                  {testCase.input}
                                </pre>
                              </div>

                              <div>
                                <p className="font-semibold text-blue-400 mb-2 font-mono text-sm">OUTPUT:</p>
                                <pre className="bg-black/50 p-3 rounded border border-blue-500/20 text-blue-300 font-mono text-sm overflow-x-auto">
                                  {testCase.output}
                                </pre>
                              </div>

                              {testCase.explanation && (
                                <div>
                                  <p className="font-semibold text-purple-400 mb-2 font-mono text-sm">EXPLANATION:</p>
                                  <p className="text-gray-300 text-sm leading-relaxed">{testCase.explanation}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* RIGHT: Code Editor & Submission */}
          <div className="space-y-6 xl:w-1/2 flex flex-col xl:h-full">
            <div className="xl:overflow-y-auto pr-4 space-y-6">
              <Card className="bg-gray-900/50 border border-purple-500/20 backdrop-blur-sm hover:border-purple-500/40 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/10">
                <CardHeader className="border-b border-gray-800/50">
                  <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-2">
                    <span>⚡</span>
                    CODE_TERMINAL
                  </CardTitle>
                </CardHeader>

                <div className="p-6 space-y-6">
                  {/* Language Selector */}
                  <FormGroup>
                    <FormLabel className="text-sm font-mono text-cyan-400">{'> SELECT_LANGUAGE:'}</FormLabel>
                    <FormSelect
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="bg-gray-800/50 border-gray-600/50 text-white hover:border-cyan-500/50 transition-colors duration-300 font-mono"
                    >
                      <option value="cpp">C++</option>
                      <option value="java">Java</option>
                      <option value="python">Python</option>
                    </FormSelect>
                  </FormGroup>

                  {/* Code Editor */}
                  <div className="space-y-2">
                    <FormLabel className="text-sm font-mono text-green-400">{'> CODE_EDITOR:'}</FormLabel>
                    <div className="border border-gray-700/50 rounded-lg overflow-hidden hover:border-green-500/30 transition-colors duration-300">
                      <Editor
                        height="400px"
                        theme="vs-dark"
                        language={language === "cpp" ? "cpp" : language}
                        value={code}
                        onChange={(val) => setCode(val || "")}
                        options={{
                          minimap: { enabled: false },
                          fontSize: 14,
                          fontFamily: "JetBrains Mono, Consolas, monospace",
                          lineNumbers: "on",
                          roundedSelection: false,
                          scrollBeyondLastLine: false,
                          automaticLayout: true,
                        }}
                      />
                    </div>
                  </div>

                  {/* Custom Input Section */}
                  <div className="space-y-4 my-4">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => setUseCustomInput(!useCustomInput)}>
                      <input
                        type="checkbox"
                        id="custom-input-checkbox"
                        checked={useCustomInput}
                        onChange={(e) => setUseCustomInput(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-cyan-500 focus:ring-cyan-600 cursor-pointer"
                      />
                      <label htmlFor="custom-input-checkbox" className="text-sm font-mono text-cyan-400 select-none cursor-pointer">
                        {'> USE_CUSTOM_INPUT'}
                      </label>
                    </div>
                    {useCustomInput && (
                      <div className="space-y-2">
                        <FormLabel className="text-sm font-mono text-yellow-400">{'> CUSTOM_INPUT:'}</FormLabel>
                        <textarea
                          value={customInput}
                          onChange={(e) => setCustomInput(e.target.value)}
                          className="w-full h-28 bg-black/70 border border-yellow-500/20 rounded-lg p-3 font-mono text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all duration-300"
                          placeholder="Enter your custom input here..."
                        />
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <Button
                      onClick={handleRun}
                      disabled={running || submitting}
                      variant="outline"
                      className="flex-1 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25 font-mono bg-transparent"
                    >
                      <span className="mr-2">▶</span>
                      {running ? "EXECUTING..." : "RUN_CODE"}
                    </Button>

                    <Button
                      onClick={handleSubmit}
                      disabled={submitting || polling}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25 font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="mr-2">↗</span>
                      {submitting || polling ? "SUBMITTING..." : "SUBMIT"}
                    </Button>
                  </div>

                  {/* Output Section */}
                  {useCustomInput && output && (
                    <div className="space-y-2">
                      <FormLabel className="text-sm font-mono text-yellow-400">{'> TERMINAL_OUTPUT:'}</FormLabel>
                      <div className="bg-black/70 border border-yellow-500/20 rounded-lg p-4 min-h-[120px] font-mono text-sm">
                        <div className="text-yellow-400 mb-2">{"./solution"}</div>
                        {output.includes('Time Limit Exceeded') ? (
                          <div className="text-yellow-400 font-bold">Time Limit Exceeded</div>
                        ) : (
                          <pre className="text-gray-300 whitespace-pre-wrap">{output}</pre>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Test Results */}
                  {results.length > 0 && (
                    <div className="space-y-4">
                      <FormLabel className="text-sm font-mono text-pink-400">{'> TEST_RESULTS:'}</FormLabel>

                      {/* Test Case Tabs */}
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {results.map((r, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActiveCase(idx)}
                            className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap border font-mono transition-all duration-300 ${
                              idx === activeCase
                                ? "bg-gray-700/50 border-gray-500"
                                : "bg-gray-800/30 border-gray-700/30 hover:bg-gray-700/30"
                            } ${
                              r.passed
                                ? "text-green-400 hover:border-green-500/50"
                                : "text-red-400 hover:border-red-500/50"
                            }`}
                          >
                            TEST_{idx + 1}
                          </button>
                        ))}
                      </div>

                      {/* Active Test Case Details */}
                      {results[activeCase] && (
                        <div className="bg-gray-800/30 border border-gray-700/30 rounded-lg p-4 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <span className="font-semibold text-cyan-400 font-mono text-sm">INPUT:</span>
                              <pre className="bg-black/50 p-3 rounded mt-2 text-cyan-300 font-mono text-sm border border-cyan-500/20 overflow-x-auto">
                                {results[activeCase].input}
                              </pre>
                            </div>

                            <div>
                              <span className="font-semibold text-blue-400 font-mono text-sm">EXPECTED:</span>
                              <pre className="bg-black/50 p-3 rounded mt-2 text-blue-300 font-mono text-sm border border-blue-500/20 overflow-x-auto">
                                {results[activeCase].expected}
                              </pre>
                            </div>
                          </div>

                          <div>
                            <span className="font-semibold text-purple-400 font-mono text-sm">YOUR_OUTPUT:</span>
                            <pre className="bg-black/50 p-3 rounded mt-2 text-purple-300 font-mono text-sm border border-purple-500/20 overflow-x-auto">
                              {results[activeCase].actual}
                            </pre>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-gray-400 font-mono text-sm">STATUS:</span>
                            {results[activeCase].status === 'TLE' ? (
                              <Badge className="font-mono bg-yellow-500/20 text-yellow-400 border-yellow-500/50">TIME_LIMIT_EXCEEDED</Badge>
                            ) : results[activeCase].passed ? (
                              <Badge className="font-mono bg-green-500/20 text-green-400 border-green-500/50">✓ ACCEPTED</Badge>
                            ) : (
                              <Badge className="font-mono bg-red-500/20 text-red-400 border-red-500/50">✗ WRONG_ANSWER</Badge>
                            )}
                            {results[activeCase].status === 'TLE' && (
                              <div className="text-yellow-400 font-bold mt-2">Your code exceeded the time limit for this test case.</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Submissions Link */}
                  <div className="pt-4 border-t border-gray-800/50">
                    <Link
                      to={`/problems/${slug}/submissions`}
                      className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors duration-300 font-mono text-sm group"
                    >
                      <span className="group-hover:scale-110 transition-transform duration-300">👁</span>
                      {"> VIEW_SUBMISSIONS"}
                    </Link>
                  </div>
                </div>
              </Card>

              {/* Submission Status Display */}
              <SubmissionStatus
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                submitting={submitting}
                polling={polling}
                submissionResult={submissionResult}
        newSubmissionId={newSubmissionId}
                submissionError={submissionError}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProblemDetail
