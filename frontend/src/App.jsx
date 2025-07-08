import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import LandingPage from './pages/LandingPage';
import Problems from './pages/Problems';
import ProblemDetail from './pages/ProblemDetail';
import Contests from './pages/Contests';
import ContestDetail from './pages/ContestDetail';
import Submissions from './pages/Submissions';
import SubmissionDetail from './pages/SubmissionDetail';
import ProblemLeaderboard from './pages/ProblemLeaderboard';
import ContestLeaderboard from './pages/ContestLeaderboard';
import Navbar from './components/Navbar';
import './App.css';

// Private Route component
const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-900">
          
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/problems" element={<Problems />} />
              <Route path="/problems/:slug" element={<ProblemDetail />} />
              <Route path="/contests" element={<Contests />} />
              <Route path="/contests/:slug" element={<ContestDetail />} />
              
              {/* Protected routes */}
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/submissions"
                element={
                  <PrivateRoute>
                    <Submissions />
                  </PrivateRoute>
                }
              />
              <Route
                path="/submissions/:submissionId"
                element={
                  <PrivateRoute>
                    <SubmissionDetail />
                  </PrivateRoute>
                }
              />
              <Route
                path="/problems/:problemSlug/submissions"
                element={
                  <PrivateRoute>
                    <Submissions />
                  </PrivateRoute>
                }
              />
              <Route
                path="/contests/:contestSlug/problems/:problemSlug"
                element={
                  <PrivateRoute>
                    <ProblemDetail />
                  </PrivateRoute>
                }
              />
              <Route
                path="/contests/:slug/leaderboard"
                element={
                  <PrivateRoute>
                    <ContestLeaderboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/problems/:slug/leaderboard"
                element={
                  <PrivateRoute>
                    <ProblemLeaderboard />
                  </PrivateRoute>
                }
              />
              
              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App
