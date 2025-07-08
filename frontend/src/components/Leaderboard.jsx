import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from './ui/Table';
import { Card, CardHeader, CardTitle } from './ui/Card';
import Badge from './ui/Badge';

const Leaderboard = ({ type }) => {
  const { slug } = useParams();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        
        let url;
        if (type === 'problem') {
          url = `/api/problems/${slug}/leaderboard`;
        } else if (type === 'contest') {
          url = `/api/contests/${slug}/leaderboard`;
        } else {
          url = '/api/contests/leaderboard/all';
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch leaderboard');
        }
        
        setLeaderboard(data.data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [slug, type]);

  const getLeaderboardTitle = () => {
    if (type === 'problem') {
      return 'Problem Leaderboard';
    } else if (type === 'contest') {
      return 'Contest Leaderboard';
    } else {
      return 'Global Leaderboard';
    }
  };

  if (loading) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">{getLeaderboardTitle()}</CardTitle>
        </CardHeader>
        <div className="p-6 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em]"></div>
          <p className="mt-2 text-gray-300">Loading leaderboard...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">{getLeaderboardTitle()}</CardTitle>
        </CardHeader>
        <div className="p-6 text-center text-red-400">
          <p>Error: {error}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">{getLeaderboardTitle()}</CardTitle>
      </CardHeader>
      <div className="p-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-white">Rank</TableHead>
                <TableHead className="text-white">User</TableHead>
                {type === 'contest' && <TableHead className="text-white">Score</TableHead>}
                {type !== 'problem' && <TableHead className="text-white">Problems Solved</TableHead>}
                {type === 'problem' && <TableHead className="text-white">Time</TableHead>}
                {type === 'problem' && <TableHead className="text-white">Memory</TableHead>}
                {type === 'problem' && <TableHead className="text-white">Language</TableHead>}
                {type === 'problem' && <TableHead className="text-white">Submission Date</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboard.length > 0 ? leaderboard.map((entry, index) => (
                <TableRow key={entry.user._id || index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">{entry.user.name || entry.user.username}</TableCell>
                  
                  {type === 'contest' && <TableCell>{entry.score}</TableCell>}
                  
                  {type !== 'problem' && <TableCell>{entry.problemsSolved}</TableCell>}
                  
                  {type === 'problem' && <TableCell>{entry.executionTime} ms</TableCell>}
                  {type === 'problem' && <TableCell>{entry.memoryUsage} KB</TableCell>}
                  {type === 'problem' && <TableCell className="capitalize">{entry.language}</TableCell>}
                  {type === 'problem' && (
                    <TableCell>
                      {new Date(entry.submittedAt).toLocaleDateString()}
                    </TableCell>
                  )}
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={type === 'problem' ? 6 : 3} className="text-center py-10">
                    No entries found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Card>
  );
};

export default Leaderboard;
