import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Navbar from '../components/Navbar';
import Leaderboard from '../components/Leaderboard';

const ContestLeaderboard = () => {
  const { slug } = useParams();
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContest = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/contests/${slug}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch contest');
        }
        
        setContest(data.data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchContest();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em]"></div>
          <p className="mt-2">Loading contest...</p>
        </div>
      </div>
    );
  }

  if (error || !contest) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-red-400">Error: {error || 'Contest not found'}</p>
          <Link to="/contests">
            <Button variant="outline" className="mt-4">
              Back to Contests
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to={`/contests/${slug}`} className="text-blue-400 hover:underline flex items-center gap-1">
            <span>&larr;</span> Back to Contest
          </Link>
        </div>
        
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white">{contest.title} - Leaderboard</CardTitle>
          </CardHeader>
          <div className="p-6">
            <p className="mb-6 text-gray-300">
              View the standings for this contest. The rankings are based on points scored and submission time.
            </p>
            
            <Leaderboard type="contest" />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ContestLeaderboard;
