import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/Table';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const ContestDetail = () => {
  const { slug } = useParams();
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registered, setRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [password, setPassword] = useState('');
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchContest = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/contests/${slug}`, {
          headers: currentUser ? {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          } : {}
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch contest');
        }
        
        setContest(data.data);
        
        // Check if user is registered
        if (currentUser && data.data.registeredUsers) {
          setRegistered(data.data.registeredUsers.includes(currentUser.id));
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchContest();
  }, [slug, currentUser]);

  const getContestStatus = () => {
    if (!contest) return '';
    
    const now = new Date();
    const start = new Date(contest.startTime);
    const end = new Date(contest.endTime);
    
    if (now < start) return 'upcoming';
    if (now >= start && now <= end) return 'ongoing';
    return 'completed';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const handleRegister = async () => {
    if (!currentUser) {
      alert('You must be logged in to register for contests');
      return;
    }
    
    try {
      setRegistering(true);
      
      const response = await fetch(`/api/contests/${contest._id}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: contest.visibility === 'password-protected' ? JSON.stringify({ password }) : '{}'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to register for contest');
      }
      
      setRegistered(true);
      alert('Successfully registered for contest!');
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setRegistering(false);
    }
  };

  const contestStatus = getContestStatus();

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
          <Link to="/contests" className="text-blue-400 hover:underline flex items-center gap-1">
            <span>&larr;</span> Back to Contests
          </Link>
        </div>
        
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white text-2xl">{contest.title}</CardTitle>
                <CardDescription className="text-gray-300 mt-2">{contest.description}</CardDescription>
              </div>
              <Badge 
                className={
                  `text-white ${
                    contestStatus === 'upcoming' ? 'bg-blue-500' : 
                    contestStatus === 'ongoing' ? 'bg-green-500' : 
                    'bg-gray-500'
                  }`
                }
              >
                {contestStatus === 'upcoming' ? 'Upcoming' : 
                 contestStatus === 'ongoing' ? 'Ongoing' : 
                 'Completed'}
              </Badge>
            </div>
          </CardHeader>
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-medium">Contest Details</h3>
                <div className="mt-2 space-y-2">
                  <p><span className="text-gray-400">Start Time:</span> {formatDate(contest.startTime)}</p>
                  <p><span className="text-gray-400">End Time:</span> {formatDate(contest.endTime)}</p>
                  <p>
                    <span className="text-gray-400">Duration:</span> 
                    {Math.floor((new Date(contest.endTime) - new Date(contest.startTime)) / (1000 * 60 * 60))}h 
                    {Math.floor((new Date(contest.endTime) - new Date(contest.startTime)) / (1000 * 60) % 60)}m
                  </p>
                  <p>
                    <span className="text-gray-400">Registration:</span> 
                    {registered ? (
                      <span className="text-green-400 ml-1">Registered</span>
                    ) : contestStatus === 'completed' ? (
                      <span className="text-gray-400 ml-1">Closed</span>
                    ) : (
                      <Button 
                        size="sm" 
                        className="ml-2" 
                        onClick={handleRegister}
                        disabled={registering || !currentUser}
                      >
                        {registering ? 'Registering...' : 'Register Now'}
                      </Button>
                    )}
                  </p>
                  {contest.visibility === 'password-protected' && !registered && contestStatus !== 'completed' && (
                    <div className="mt-2">
                      <input
                        type="password"
                        placeholder="Contest Password"
                        className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm w-full"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium">Contest Actions</h3>
                <div className="mt-2 space-y-4">
                  {contestStatus === 'ongoing' && registered && (
                    <div>
                      <Button className="w-full">
                        Enter Contest
                      </Button>
                      <p className="text-sm text-gray-400 mt-2">Access the contest problems and submit your solutions.</p>
                    </div>
                  )}
                  
                  {(contestStatus === 'completed' || (contestStatus === 'ongoing' && registered)) && (
                    <Link to={`/contests/${slug}/leaderboard`}>
                      <Button variant="outline" className="w-full">
                        View Leaderboard
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
            
            {/* Problems section - only visible if contest has started and user is registered */}
            {contestStatus !== 'upcoming' && registered && contest.problems && contest.problems.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-medium mb-4">Contest Problems</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-white">Problem</TableHead>
                      <TableHead className="text-white">Difficulty</TableHead>
                      <TableHead className="text-white">Points</TableHead>
                      <TableHead className="text-white">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contest.problems.map((problem) => (
                      <TableRow key={problem.problem._id}>
                        <TableCell>{problem.problem.title}</TableCell>
                        <TableCell>
                          <Badge className={
                            `text-white ${
                              problem.problem.difficulty === 'easy' ? 'bg-green-500' : 
                              problem.problem.difficulty === 'medium' ? 'bg-yellow-500' : 
                              'bg-red-500'
                            }`
                          }>
                            {problem.problem.difficulty}
                          </Badge>
                        </TableCell>
                        <TableCell>{problem.points}</TableCell>
                        <TableCell>
                          <Link to={`/contests/${slug}/problems/${problem.problem.slug}`}>
                            <Button size="sm">Solve</Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ContestDetail;
