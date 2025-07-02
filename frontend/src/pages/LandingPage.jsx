"use client"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Button from "../components/ui/Button"
import { Card, CardDescription, CardHeader, CardTitle } from "../components/ui/Card"
import Badge from "../components/ui/Badge"
import Footer from "../components/Footer"
import Navbar from "../components/Navbar"

// Icons as simple SVG components
const Code2Icon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
  </svg>
)

const PlayIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
)

const TerminalIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
)

const ZapIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
)

const TrophyIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
    />
  </svg>
)

const BarChart3Icon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  </svg>
)

const TargetIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
    />
  </svg>
)

const UsersIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
)

const ClockIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
)

const CheckCircleIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
)

const ArrowRightIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
)

const GithubIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
)

const TwitterIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
  </svg>
)

const LinkedinIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
)

const LandingPage = () => {
  const { currentUser } = useAuth()

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <Navbar/>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-black"></div>
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                  <ZapIcon className="w-3 h-3 mr-1" />
                  Next-Gen Online Judge
                </Badge>
                <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                  Code.{" "}
                  <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Compete.
                  </span>{" "}
                  Conquer.
                </h1>
                <p className="text-xl text-gray-400 leading-relaxed max-w-lg">
                  Master algorithmic challenges on the most advanced online judge platform. Real-time execution, instant
                  feedback, and competitive programming at its finest.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to={currentUser ? "/dashboard" : "/register"}>
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8"
                  >
                    <PlayIcon className="w-5 h-5 mr-2" />
                    Start Coding
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-gray-700 text-gray-300 hover:bg-gray-800 text-lg px-8 bg-transparent"
                >
                  <TerminalIcon className="w-5 h-5 mr-2" />
                  View Demo
                </Button>
              </div>

              <div className="flex items-center space-x-8 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">50K+</div>
                  <div className="text-sm text-gray-500">Problems Solved</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">10K+</div>
                  <div className="text-sm text-gray-500">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">99.9%</div>
                  <div className="text-sm text-gray-500">Uptime</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">
                <div className="bg-gray-800 px-4 py-3 flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div className="ml-4 text-sm text-gray-400">solution.cpp</div>
                </div>
                <div className="p-6 font-mono text-sm">
                  <div className="space-y-2">
                    <div className="text-gray-500">{"// Two Sum - O(n) solution"}</div>
                    <div>
                      <span className="text-purple-400">vector</span>
                      <span className="text-gray-300">{"<"}</span>
                      <span className="text-blue-400">int</span>
                      <span className="text-gray-300">{">"}</span>
                      <span className="text-yellow-400"> twoSum</span>
                      <span className="text-gray-300">{"("}</span>
                      <span className="text-purple-400">vector</span>
                      <span className="text-gray-300">{"<"}</span>
                      <span className="text-blue-400">int</span>
                      <span className="text-gray-300">{">&"}</span>
                      <span className="text-orange-400"> nums</span>
                      <span className="text-gray-300">{", "}</span>
                      <span className="text-blue-400">int</span>
                      <span className="text-orange-400"> target</span>
                      <span className="text-gray-300">{") {"}</span>
                    </div>
                    <div className="pl-4">
                      <span className="text-purple-400">unordered_map</span>
                      <span className="text-gray-300">{"<"}</span>
                      <span className="text-blue-400">int</span>
                      <span className="text-gray-300">{", "}</span>
                      <span className="text-blue-400">int</span>
                      <span className="text-gray-300">{">"}</span>
                      <span className="text-orange-400"> map</span>
                      <span className="text-gray-300">{";"}</span>
                    </div>
                    <div className="pl-4">
                      <span className="text-purple-400">for</span>
                      <span className="text-gray-300">{"("}</span>
                      <span className="text-blue-400">int</span>
                      <span className="text-orange-400"> i</span>
                      <span className="text-gray-300">{" = "}</span>
                      <span className="text-green-400">0</span>
                      <span className="text-gray-300">{"; i < "}</span>
                      <span className="text-orange-400">nums</span>
                      <span className="text-gray-300">{"."}</span>
                      <span className="text-yellow-400">size</span>
                      <span className="text-gray-300">{"(); ++i) {"}</span>
                    </div>
                    <div className="pl-8">
                      <span className="text-blue-400">int</span>
                      <span className="text-orange-400"> complement</span>
                      <span className="text-gray-300">{" = "}</span>
                      <span className="text-orange-400">target</span>
                      <span className="text-gray-300">{" - "}</span>
                      <span className="text-orange-400">nums</span>
                      <span className="text-gray-300">{"["}</span>
                      <span className="text-orange-400">i</span>
                      <span className="text-gray-300">{"];"}</span>
                    </div>
                    <div className="pl-8">
                      <span className="text-purple-400">if</span>
                      <span className="text-gray-300">{"("}</span>
                      <span className="text-orange-400">map</span>
                      <span className="text-gray-300">{"."}</span>
                      <span className="text-yellow-400">count</span>
                      <span className="text-gray-300">{"("}</span>
                      <span className="text-orange-400">complement</span>
                      <span className="text-gray-300">{")) {"}</span>
                    </div>
                    <div className="pl-12">
                      <span className="text-purple-400">return</span>
                      <span className="text-gray-300">{" {"}</span>
                      <span className="text-orange-400">map</span>
                      <span className="text-gray-300">{"["}</span>
                      <span className="text-orange-400">complement</span>
                      <span className="text-gray-300">{"], "}</span>
                      <span className="text-orange-400">i</span>
                      <span className="text-gray-300">{"};"}</span>
                    </div>
                    <div className="pl-8 text-gray-300">{"}"}</div>
                    <div className="pl-8">
                      <span className="text-orange-400">map</span>
                      <span className="text-gray-300">{"["}</span>
                      <span className="text-orange-400">nums</span>
                      <span className="text-gray-300">{"["}</span>
                      <span className="text-orange-400">i</span>
                      <span className="text-gray-300">{"]] = "}</span>
                      <span className="text-orange-400">i</span>
                      <span className="text-gray-300">{";"}</span>
                    </div>
                    <div className="pl-4 text-gray-300">{"}"}</div>
                    <div className="pl-4">
                      <span className="text-purple-400">return</span>
                      <span className="text-gray-300">{" {};"}</span>
                    </div>
                    <div className="text-gray-300">{"}"}</div>
                  </div>
                </div>
                <div className="bg-green-900/20 border-t border-green-500/20 px-6 py-3">
                  <div className="flex items-center space-x-2 text-green-400">
                    <CheckCircleIcon className="w-4 h-4" />
                    <span className="text-sm">Accepted • Runtime: 8ms • Memory: 10.2MB</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Built for{" "}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Competitive Programmers
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Experience the most advanced online judge platform with cutting-edge features designed to elevate your
              coding skills to the next level.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-gray-800/50 border-gray-700 hover:border-blue-500/50 transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                  <ZapIcon className="w-6 h-6 text-blue-400" />
                </div>
                <CardTitle className="text-white">Lightning Fast Execution</CardTitle>
                <CardDescription className="text-gray-400">
                  Execute code in milliseconds with our optimized judge system supporting 40+ programming languages.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700 hover:border-purple-500/50 transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
                  <TrophyIcon className="w-6 h-6 text-purple-400" />
                </div>
                <CardTitle className="text-white">Live Contests</CardTitle>
                <CardDescription className="text-gray-400">
                  Participate in real-time coding contests with global leaderboards and instant rankings.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700 hover:border-green-500/50 transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-colors">
                  <BarChart3Icon className="w-6 h-6 text-green-400" />
                </div>
                <CardTitle className="text-white">Advanced Analytics</CardTitle>
                <CardDescription className="text-gray-400">
                  Track your progress with detailed performance metrics and personalized insights.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700 hover:border-orange-500/50 transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-500/20 transition-colors">
                  <TargetIcon className="w-6 h-6 text-orange-400" />
                </div>
                <CardTitle className="text-white">Smart Problem Sets</CardTitle>
                <CardDescription className="text-gray-400">
                  AI-curated problem recommendations based on your skill level and learning goals.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700 hover:border-cyan-500/50 transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-cyan-500/20 transition-colors">
                  <UsersIcon className="w-6 h-6 text-cyan-400" />
                </div>
                <CardTitle className="text-white">Community Driven</CardTitle>
                <CardDescription className="text-gray-400">
                  Connect with fellow programmers, share solutions, and learn from the community.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700 hover:border-pink-500/50 transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-pink-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-pink-500/20 transition-colors">
                  <ClockIcon className="w-6 h-6 text-pink-400" />
                </div>
                <CardTitle className="text-white">24/7 Availability</CardTitle>
                <CardDescription className="text-gray-400">
                  Practice anytime with our reliable infrastructure and 99.9% uptime guarantee.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                2M+
              </div>
              <div className="text-gray-400">Code Submissions</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                5K+
              </div>
              <div className="text-gray-400">Problems Available</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-red-400 bg-clip-text text-transparent">
                100+
              </div>
              <div className="text-gray-400">Contests Hosted</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                40+
              </div>
              <div className="text-gray-400">Languages Supported</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <h2 className="text-5xl font-bold">
              Ready to{" "}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Level Up
              </span>{" "}
              Your Skills?
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Join thousands of developers who are already mastering algorithms and preparing for technical interviews
              with Verdakra.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={currentUser ? "/dashboard" : "/register"}>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8"
                >
                  {currentUser ? "Go to Dashboard" : "Start Free Trial"}
                  <ArrowRightIcon className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/problems">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-gray-700 text-gray-300 hover:bg-gray-800 text-lg px-8 bg-transparent"
                >
                  Browse Problems
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer/>
    </div>
  )
}

export default LandingPage
