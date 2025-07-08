import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowLeft, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Button from '../components/ui/Button';

const BASE_URL = import.meta.env.VITE_API_URL || '';

const Problems = ({ isEmbedded = false }) => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    difficulty: '',
    tag: '',
    page: 1
  });

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams();
        if (filters.difficulty) queryParams.append('difficulty', filters.difficulty);
        if (filters.tag) queryParams.append('tags', filters.tag);
        queryParams.append('page', filters.page);

        const response = await fetch(`${BASE_URL}/problems?${queryParams.toString()}`);
        const data = await response.json();

        if (!response.ok) throw new Error(data.message || 'Failed to fetch problems');
        setProblems(data.data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, [filters]);

const difficultyBadge = (difficulty) => {
  const base = 'inline-block font-mono uppercase text-xs tracking-wide rounded-full border transition-all duration-300';
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return `${base} px-4 py-[3px] bg-[#0f1c16] text-[#00ff9f] border-[#00ff9f66] shadow-[0_0_10px_#00ff9f55]`;
    case 'medium':
      return `${base} px-4 py-[3px] bg-[#1f1a0e] text-[#ffb300] border-[#ffb30066] shadow-[0_0_10px_#ffb30055]`;
    case 'hard':
      return `${base} px-4 py-[3px] bg-[#1e0f13] text-[#ff005c] border-[#ff005c66] shadow-[0_0_10px_#ff005c55]`;
    default:
      return `${base} px-4 py-[3px] bg-slate-800 text-gray-300 border border-slate-500`;
  }
};




  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value,
    }));
  };

  const problemsContent = (
        <div className="w-full bg-white/5 backdrop-blur-md border border-[#2e2f41] rounded-2xl shadow-2xl p-10">

          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#60a5fa] to-[#c084fc] mb-6 tracking-wide flex items-center gap-2">
            <Sparkles className="text-cyan-400" size={24} /> Explore Challenges
          </h1>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <label className="text-sm text-slate-400">Difficulty:</label>
            <select
              className="bg-[#1f1f2e] text-white border border-[#444457] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
              value={filters.difficulty}
              onChange={(e) => handleFilterChange('difficulty', e.target.value)}
            >
              <option value="">All</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          {/* Content */}
          {loading ? (
            <div className="text-center py-10 animate-pulse">
              <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-cyan-400 border-r-transparent"></div>
              <p className="mt-4 text-cyan-300">Loading problems...</p>
            </div>
          ) : error ? (
            <div className="text-center py-10 text-red-400">
              <p>Error: {error}</p>
              <Button
                variant="outline"
                className="mt-2 border border-red-400 text-red-300 hover:bg-red-700/20"
                onClick={() => handleFilterChange('page', filters.page)}
              >
                Retry
              </Button>
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="overflow-x-auto border border-[#3b3c4e] rounded-xl shadow-md">
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-gradient-to-r from-[#2e2f41] to-[#202134] text-cyan-300">
                    <tr>
                      <th className="px-6 py-3 font-semibold">Title</th>
                      <th className="px-6 py-3 font-semibold">Difficulty</th>
                      <th className="px-6 py-3 font-semibold">Acceptance</th>
                      <th className="px-6 py-3 font-semibold">Tags</th>
                    </tr>
                  </thead>
                  <tbody>
                    {problems.length > 0 ? (
                      problems.map((problem) => (
                        <tr key={problem._id} className="hover:bg-[#1e1f2c] transition">
                          <td className="px-6 py-4 text-blue-400 hover:underline">
                            <Link to={`/problems/${problem.slug}`}>{problem.title}</Link>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 text-xs font-semibold rounded-full ${difficultyBadge(
                                problem.difficulty
                              )}`}
                            >
                              {problem.difficulty}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-white/80">
                            {problem.acceptedCount}/{problem.submissionCount}{' '}
                            ({problem.submissionCount > 0
                              ? Math.round((problem.acceptedCount / problem.submissionCount) * 100)
                              : 0}
                            %)
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-2">
                              {problem.tags?.map((tag) => (
                                <span
                                  key={tag}
                                  className="text-xs px-3 py-1 rounded-full bg-[#2a2b3d] text-white/80 border border-[#3f3f56]"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="text-center px-6 py-10 text-gray-400">
                          No problems found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex justify-between items-center mt-6">
                <Button
                  onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
                  disabled={filters.page <= 1}
                  className="px-4 py-2 rounded-lg bg-transparent border border-cyan-400 text-cyan-300 hover:bg-cyan-600/20"
                >
                  <ArrowLeft size={16} className="mr-1" /> Prev
                </Button>
                <span className="text-white font-semibold">Page {filters.page}</span>
                <Button
                  onClick={() => handleFilterChange('page', filters.page + 1)}
                  className="px-4 py-2 rounded-lg bg-transparent border border-cyan-400 text-cyan-300 hover:bg-cyan-600/20"
                >
                  Next <ArrowRight size={16} className="ml-1" />
                </Button>
              </div>
            </>
          )}
        </div>
  );

  if (isEmbedded) {
    return problemsContent;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f1b] via-[#14162b] to-[#0a0a15] text-white font-['Fira_Code',_monospace]">
      <Navbar />
      <div className="max-w-8xl w-full mx-auto px-8 py-10">
        {problemsContent}
      </div>
    </div>
  );
};

export default Problems;
