import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/Table';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Navbar from '../components/Navbar';

const Contests = () => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, upcoming, ongoing, completed

  useEffect(() => {
    const fetchContests = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams();
        if (filter !== 'all') queryParams.append('status', filter);
        
        const response = await fetch(`/api/contests?${queryParams.toString()}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch contests');
        }
        
        setContests(data.data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchContests();
  }, [filter]);

  const getContestStatus = (startTime, endTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    if (now < start) return 'upcoming';
    if (now >= start && now <= end) return 'ongoing';
    return 'completed';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'upcoming':
        return <Badge className="bg-blue-500 text-white">Upcoming</Badge>;
      case 'ongoing':
        return <Badge className="bg-green-500 text-white">Ongoing</Badge>;
      case 'completed':
        return <Badge className="bg-gray-500 text-white">Completed</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Contests</CardTitle>
          </CardHeader>
          <div className="p-6">
            <div className="flex flex-wrap gap-4 mb-6">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
              >
                All
              </Button>
              <Button
                variant={filter === 'upcoming' ? 'default' : 'outline'}
                onClick={() => setFilter('upcoming')}
              >
                Upcoming
              </Button>
              <Button
                variant={filter === 'ongoing' ? 'default' : 'outline'}
                onClick={() => setFilter('ongoing')}
              >
                Ongoing
              </Button>
              <Button
                variant={filter === 'completed' ? 'default' : 'outline'}
                onClick={() => setFilter('completed')}
              >
                Completed
              </Button>
            </div>
            
            {loading ? (
              <div className="text-center py-10">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em]"></div>
                <p className="mt-2">Loading contests...</p>
              </div>
            ) : error ? (
              <div className="text-center py-10 text-red-400">
                <p>Error: {error}</p>
                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => setFilter(filter)}
                >
                  Try Again
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-white">Contest</TableHead>
                      <TableHead className="text-white">Status</TableHead>
                      <TableHead className="text-white">Start Time</TableHead>
                      <TableHead className="text-white">End Time</TableHead>
                      <TableHead className="text-white">Duration</TableHead>
                      <TableHead className="text-white">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contests.length > 0 ? contests.map((contest) => {
                      const status = getContestStatus(contest.startTime, contest.endTime);
                      const durationMinutes = Math.round((new Date(contest.endTime) - new Date(contest.startTime)) / (1000 * 60));
                      const hours = Math.floor(durationMinutes / 60);
                      const minutes = durationMinutes % 60;
                      
                      return (
                        <TableRow key={contest._id}>
                          <TableCell>
                            <Link 
                              to={`/contests/${contest.slug}`}
                              className="text-blue-400 hover:text-blue-300 hover:underline"
                            >
                              {contest.title}
                            </Link>
                            {contest.visibility !== 'public' && (
                              <span className="ml-2">
                                <Badge className="bg-purple-500 text-white">
                                  {contest.visibility}
                                </Badge>
                              </span>
                            )}
                          </TableCell>
                          <TableCell>{getStatusBadge(status)}</TableCell>
                          <TableCell>{formatDate(contest.startTime)}</TableCell>
                          <TableCell>{formatDate(contest.endTime)}</TableCell>
                          <TableCell>{hours}h {minutes}m</TableCell>
                          <TableCell>
                            <Link to={`/contests/${contest.slug}`}>
                              <Button size="sm">
                                {status === 'upcoming' ? 'Register' : status === 'ongoing' ? 'Participate' : 'View Results'}
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      );
                    }) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10">
                          No contests found
                        </TableCell>
                      </TableRow>
                    )}
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

export default Contests;
