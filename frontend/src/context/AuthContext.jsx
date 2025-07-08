import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Set up axios defaults
  axios.defaults.baseURL = 'http://localhost:5000/api';

  // Set the auth token for requests if it exists
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Fetch user data
      axios.get('/auth/me')
        .then(response => {
          setCurrentUser(response.data.user);
        })
        .catch(error => {
          console.error('Error fetching user data:', error);
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Register function
  const register = async (userData) => {
    try {
      setError('');
      const response = await axios.post('/auth/register', userData);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setCurrentUser(user);
      return { success: true };
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
      return { success: false, error: error.response?.data?.message || 'Registration failed' };
    }
  };

  // Login function
  const login = async (credentials) => {
    try {
      setError('');
      const response = await axios.post('/auth/login', credentials);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setCurrentUser(user);
      return { success: true };
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setCurrentUser(null);
  };

  const resetPassword = async (email) => {
    // Validate email format
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      throw new Error('Please enter a valid email address');
    }
    
    // Make actual API call to backend
    const response = await axios.post('/auth/reset-password', { email });
    
    // Return the actual API response
    return response.data;
  };

  const value = {
    currentUser,
    error,
    login,
    register,
    logout,
    resetPassword,
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
