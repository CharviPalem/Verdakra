import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardDescription, CardHeader, CardTitle } from "../components/ui/Card"
import Badge from "../components/ui/Badge"
import Button from "../components/ui/Button"
import Footer from "../components/Footer"
import Navbar from '../components/Navbar';

const Dashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    problemsSolved: 0,
    submissions: 0,
    rank: 0,
    streak: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Fetch user stats from the API
    const fetchUserStats = async () => {
      try {
        // Replace with actual API call
        // const response = await fetch('/api/user/stats');
        // const data = await response.json();
        // setStats(data);

        // Simulated data for now
        setTimeout(() => {
          setStats({
            problemsSolved: 42,
            submissions: 87,
            rank: 567,
            streak: 5
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching user stats:', error);
        setLoading(false);
      }
    };

    fetchUserStats();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Sample problem data
  const recentProblems = [
    { id: 1, title: 'Two Sum', difficulty: 'Easy', status: 'Not Attempted', lastAttempted: '2 days ago' },
    { id: 2, title: 'Add Two Numbers', difficulty: 'Medium', status: 'Not Attempted', lastAttempted: '1 week ago' },
    { id: 3, title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', status: 'Not Attempted', lastAttempted: '3 days ago' },
    { id: 4, title: 'Median of Two Sorted Arrays', difficulty: 'Hard', status: 'Not Attempted', lastAttempted: '-' },
  ];

  // Sample contest data
  const upcomingContests = [
    { id: 1, title: 'Weekly Contest 300', date: '2023-06-10 14:00 UTC', duration: '1.5 hours', registered: true },
    { id: 2, title: 'Biweekly Contest 105', date: '2023-06-17 14:00 UTC', duration: '1.5 hours', registered: false },
  ];

  return (
    <>

      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="relative min-h-screen overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-black z-0"></div>
          <div className="absolute inset-0 z-0">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
          </div>

          <main className="relative z-10 max-w-7xl mx-auto px-4 py-6">
            {/* Dashboard welcome section */}
            <div className="shadow mb-6 px-4 py-6">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 max-w-7xl mx-auto">

                {/* Left: Welcome Message */}
                <div>
                  <h1 className="text-6xl font-bold text-white">Welcome To</h1>
                  <p className="text-4xl text-indigo-300">
                    Verdakra , <span className="font-semibold text-white">{currentUser?.username || 'User'}</span>
                  </p>
                </div>

                {/* Right: Code Preview Block */}
                <div className="w-full lg:w-2/3">
                  <div className="shadow-lg md:rounded-3xl">
                    <div className="bg-indigo-500 [clip-path:inset(0)] md:[clip-path:inset(0_round_theme(borderRadius.3xl))]">
                      <div className="absolute -inset-y-px left-1/2 -z-10 ml-10 w-[200%] skew-x-[-30deg] bg-indigo-100 opacity-20 ring-1 ring-inset ring-white md:ml-20 lg:ml-36"></div>
                      <div className="relative px-6 pt-8 sm:pt-16 md:pl-16 md:pr-0">
                        <div className="mx-auto max-w-2xl md:mx-0 md:max-w-none">
                          <div className="w-full overflow-hidden rounded-tl-xl bg-gray-900">
                            <div className="flex bg-gray-800/40 ring-1 ring-white/5">
                              <div className="-mb-px flex text-sm font-medium leading-6 text-gray-400">
                                <div className="border-b border-r border-b-white/20 border-r-white/10 bg-white/5 px-4 py-2 text-white">
                                  Problem.jsx
                                </div>
                                <div className="border-r border-gray-600/10 px-4 py-2">App.jsx</div>
                              </div>
                            </div>
                            <div className="px-6 pt-6 pb-14 text-white">
                              <pre className="text-sm leading-6 text-gray-300">
                                <code>
                                  <span className="text-indigo-300">function</span>{' '}
                                  <span className="text-yellow-300">solveProblem</span>() {'{'}
                                  <br />
                                  {'  '}<span className="text-indigo-300">const</span> solution = <span className="text-yellow-300">findOptimalSolution</span>();
                                  <br />
                                  {'  '}<span className="text-indigo-300">return</span> solution;
                                  <br />
                                  {'}'}
                                </code>
                              </pre>
                            </div>
                          </div>
                        </div>
                        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/10 md:rounded-3xl"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>


            <main className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-sm font-medium text-gray-500">Problems Solved</h2>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      +3 this week
                    </span>
                  </div>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {loading ? (
                      <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                    ) : (
                      stats.problemsSolved
                    )}
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-sm font-medium text-gray-500">Submissions</h2>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      +7 this week
                    </span>
                  </div>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {loading ? (
                      <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                    ) : (
                      stats.submissions
                    )}
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-sm font-medium text-gray-500">Rank</h2>
                  </div>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {loading ? (
                      <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                    ) : (
                      `#${stats.rank}`
                    )}
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-sm font-medium text-gray-500">Current Streak</h2>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      🔥
                    </span>
                  </div>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {loading ? (
                      <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                    ) : (
                      `${stats.streak} days`
                    )}
                  </p>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('problems')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'problems' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                  >
                    Problems
                  </button>
                  <button
                    onClick={() => setActiveTab('contests')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'contests' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                  >
                    Contests
                  </button>
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'profile' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                  >
                    Profile
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              {activeTab === 'overview' && (
                <div>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Activity */}
                    <div className="lg:col-span-2">
                      <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Problems</h2>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Problem</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Attempted</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {recentProblems.map((problem) => (
                                <tr key={problem.id} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-indigo-600 hover:underline cursor-pointer">{problem.title}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${problem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                      {problem.difficulty}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`text-sm ${problem.status === 'Solved' ? 'text-green-600' : problem.status === 'Attempted' ? 'text-yellow-600' : 'text-gray-500'}`}>
                                      {problem.status}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {problem.lastAttempted}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="mt-4 text-center">
                          <button
                            onClick={() => setActiveTab('problems')}
                            className="text-sm text-indigo-600 hover:text-indigo-900"
                          >
                            View All Problems
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Upcoming Contests */}
                    <div>
                      <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Upcoming Contests</h2>
                        <div className="space-y-4">
                          {upcomingContests.map((contest) => (
                            <div key={contest.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                              <h3 className="text-sm font-medium text-gray-900">{contest.title}</h3>
                              <p className="mt-1 text-xs text-gray-500">
                                {contest.date} • {contest.duration}
                              </p>
                              <div className="mt-2">
                                <button
                                  className={`px-3 py-1 text-xs font-medium rounded ${contest.registered ? 'bg-green-100 text-green-800' : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'}`}
                                >
                                  {contest.registered ? 'Registered' : 'Register'}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 text-center">
                          <button
                            onClick={() => setActiveTab('contests')}
                            className="text-sm text-indigo-600 hover:text-indigo-900"
                          >
                            View All Contests
                          </button>
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="bg-white shadow rounded-lg p-6 mt-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Your Progress</h2>
                        <div>
                          <div className="mb-2 flex justify-between items-center">
                            <span className="text-xs font-medium text-gray-700">Easy</span>
                            <span className="text-xs text-gray-500">25/100</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-green-600 h-2 rounded-full" style={{ width: '25%' }}></div>
                          </div>
                        </div>
                        <div className="mt-4">
                          <div className="mb-2 flex justify-between items-center">
                            <span className="text-xs font-medium text-gray-700">Medium</span>
                            <span className="text-xs text-gray-500">15/100</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '15%' }}></div>
                          </div>
                        </div>
                        <div className="mt-4">
                          <div className="mb-2 flex justify-between items-center">
                            <span className="text-xs font-medium text-gray-700">Hard</span>
                            <span className="text-xs text-gray-500">2/100</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-red-600 h-2 rounded-full" style={{ width: '2%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'problems' && (
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-6">All Problems</h2>
                  <p className="text-gray-700">Problem list component will be implemented here</p>
                </div>
              )}

              {activeTab === 'contests' && (
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-6">All Contests</h2>
                  <p className="text-gray-700">Contest list component will be implemented here</p>
                </div>
              )}

              {activeTab === 'profile' && (
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-6">User Profile</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Account Information</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500">Username</p>
                            <p className="text-sm font-medium">{user?.username || 'Username'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Email</p>
                            <p className="text-sm font-medium">{user?.email || 'email@example.com'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Member Since</p>
                            <p className="text-sm font-medium">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Date'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Last Login</p>
                            <p className="text-sm font-medium">{user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Date'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <button className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        Edit Profile
                      </button>
                      <button className="ml-3 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        Change Password
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </main>
          </main>
        </div>
      </div>
    </>
  );
};

export default Dashboard;