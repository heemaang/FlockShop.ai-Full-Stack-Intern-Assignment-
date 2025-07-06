import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Dashboard({ setIsAuthenticated }) {
  const [wishlists, setWishlists] = useState([]);
  const [newWishlistName, setNewWishlistName] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [stats, setStats] = useState({
    totalWishlists: 0,
    totalProducts: 0,
    totalValue: 0,
    mostExpensive: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchWishlists();
    // Get current user from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(user);
  }, []);

  const fetchWishlists = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token from localStorage:', token ? 'Token exists' : 'No token found');
      
      if (!token) {
        console.error('No token found in localStorage');
        navigate('/login');
        return;
      }
      
      console.log('Making request to fetch wishlists with token');
      const response = await axios.get('http://localhost:5000/api/wishlists', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Wishlists response:', response.data);
      setWishlists(response.data);
      calculateStats(response.data);
    } catch (err) {
      console.error('Error fetching wishlists:', err);
      console.error('Error details:', {
        status: err.response?.status,
        data: err.response?.data,
        headers: err.response?.headers
      });
      
      if (err.response?.status === 401) {
        console.log('Token is invalid, redirecting to login');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (wishlistsData) => {
    let totalProducts = 0;
    let totalValue = 0;
    let mostExpensive = 0;

    wishlistsData.forEach(wishlist => {
      if (wishlist.products) {
        totalProducts += wishlist.products.length;
        wishlist.products.forEach(product => {
          if (product.price) {
            totalValue += product.price;
            if (product.price > mostExpensive) {
              mostExpensive = product.price;
            }
          }
        });
      }
    });

    setStats({
      totalWishlists: wishlistsData.length,
      totalProducts,
      totalValue: Math.round(totalValue * 100) / 100,
      mostExpensive: Math.round(mostExpensive * 100) / 100
    });
  };

  const createWishlist = async (e) => {
    e.preventDefault();
    if (!newWishlistName.trim()) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/wishlists', 
        { name: newWishlistName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewWishlistName('');
      fetchWishlists();
    } catch (err) {
      console.error('Error creating wishlist:', err);
    }
  };

  const deleteWishlist = async (wishlistId) => {
    if (!window.confirm('Are you sure you want to delete this wishlist? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/wishlists/${wishlistId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchWishlists(); // Refresh the list
    } catch (err) {
      console.error('Error deleting wishlist:', err);
      alert('Failed to delete wishlist. Please try again.');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Update authentication state in App.jsx
    setIsAuthenticated(false);
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="loading">
        Loading...
      </div>
    );
  }

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="navbar-content">
          <h1 className="text-gradient">🛍️ My Wishlists</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {currentUser && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                backgroundColor: 'var(--primary-50)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--primary-200)'
              }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>👤</span>
                <span style={{ 
                  fontWeight: '600', 
                  color: 'var(--primary-700)',
                  fontSize: '0.875rem'
                }}>
                  {currentUser.username || currentUser.email}
                </span>
              </div>
            )}
            <button
              onClick={logout}
              className="btn btn-danger"
              style={{ width: 'auto', padding: '0.75rem 1.5rem' }}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="dashboard-content">
        {/* E-commerce Stats */}
        <div className="wishlist-stats">
          <div className="stat-card">
            <div className="stat-number">{stats.totalWishlists}</div>
            <div className="stat-label">Total Wishlists</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.totalProducts}</div>
            <div className="stat-label">Total Items</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">₹{stats.totalValue}</div>
            <div className="stat-label">Total Value</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">₹{stats.mostExpensive}</div>
            <div className="stat-label">Most Expensive Item</div>
          </div>
        </div>

        <div className="create-wishlist">
          <h2>➕ Create New Wishlist</h2>
          <form onSubmit={createWishlist} className="create-form">
            <input
              type="text"
              value={newWishlistName}
              onChange={(e) => setNewWishlistName(e.target.value)}
              placeholder="Enter wishlist name (e.g., Birthday Wishlist, Christmas Gifts)"
            />
            <button type="submit" className="btn btn-primary" style={{ width: 'auto' }}>
              Create Wishlist
            </button>
          </form>
        </div>

        <div>
          <h2 className="text-gradient" style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>
            📋 Your Wishlists
          </h2>
          {wishlists.length === 0 ? (
            <div className="glass-effect" style={{ 
              padding: '3rem', 
              textAlign: 'center', 
              borderRadius: 'var(--radius-xl)',
              color: 'var(--gray-600)',
              fontSize: '1.125rem'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.5 }}>🎁</div>
              <h3 style={{ marginBottom: '1rem', color: 'var(--gray-800)' }}>Start Your First Wishlist!</h3>
              <p>Create a wishlist to keep track of items you'd love to receive as gifts.</p>
            </div>
          ) : (
            <div className="wishlists-grid">
              {wishlists.map((wishlist) => {
                const totalValue = wishlist.products?.reduce((sum, product) => sum + (product.price || 0), 0) || 0;
                const hasExpensiveItems = wishlist.products?.some(product => product.price > 100);
                
                return (
                  <div
                    key={wishlist._id}
                    className="wishlist-card hover-lift"
                  >
                    <div 
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/wishlist/${wishlist._id}`)}
                    >
                      {hasExpensiveItems && (
                        <div className="product-badge" style={{ position: 'absolute', top: '0.75rem', right: '0.75rem' }}>
                          💎 Premium
                        </div>
                      )}
                      <div className="wishlist-card-content">
                        <h3>{wishlist.name}</h3>
                        <p>
                          <span style={{ fontWeight: '600' }}>👤</span>
                          Owner: {wishlist.owner?.username || 'Unknown'}
                        </p>
                        <p>
                          <span style={{ fontWeight: '600' }}>📦</span>
                          Items: {wishlist.products?.length || 0}
                        </p>
                        <p>
                          <span style={{ fontWeight: '600' }}>👥</span>
                          Members: {wishlist.members?.length || 1}
                        </p>
                        {totalValue > 0 && (
                          <p style={{ 
                            color: 'var(--orange-600)', 
                            fontWeight: '600', 
                            fontSize: '1.125rem',
                            marginTop: '0.5rem'
                          }}>
                            💰 Total Value: ₹{Math.round(totalValue * 100) / 100}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Delete Button */}
                    <div style={{ 
                      position: 'absolute', 
                      top: '0.75rem', 
                      right: '0.75rem',
                      zIndex: 10
                    }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteWishlist(wishlist._id);
                        }}
                        style={{
                          background: 'var(--danger-500)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '2rem',
                          height: '2rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1rem',
                          transition: 'var(--transition)',
                          boxShadow: 'var(--shadow-sm)'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'var(--danger-600)';
                          e.target.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'var(--danger-500)';
                          e.target.style.transform = 'scale(1)';
                        }}
                        title="Delete wishlist"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 