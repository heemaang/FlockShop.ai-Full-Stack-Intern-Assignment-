import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login({ setIsAuthenticated }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    console.log('Attempting login with:', { email: formData.email, password: formData.password ? '***' : 'empty' });
    
    try {
      console.log('Making request to:', 'http://localhost:5000/api/auth/login');
      const response = await axios.post('http://localhost:5000/api/auth/login', formData);
      console.log('Login response:', response.data);
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Update authentication state in App.jsx
      setIsAuthenticated(true);
      
      console.log('Token stored, navigating to dashboard...');
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      if (err.code === 'ERR_NETWORK') {
        setError('Cannot connect to server. Please make sure the server is running on port 5000.');
      } else if (err.response?.status === 400) {
        setError(err.response.data.message || 'Invalid email or password');
      } else if (err.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else {
        setError(err.response?.data?.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Sign in to your account</h2>
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          <div className="form-group">
            <input
              name="email"
              type="email"
              required
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <input
              name="password"
              type="password"
              required
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <div className="auth-link">
          <a href="/signup">Don't have an account? Sign up</a>
        </div>
      </div>
    </div>
  );
} 