import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URLS } from '../config/api';
import { useSocket } from '../contexts/SocketContext';

export default function WishlistPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { socket, joinWishlist, leaveWishlist } = useSocket();
  const [wishlist, setWishlist] = useState(null);
  const [newProduct, setNewProduct] = useState({ name: '', imageUrl: '', price: '', category: '' });
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('name');
  const [filterCategory, setFilterCategory] = useState('all');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteMessage, setInviteMessage] = useState('');
  const [newComment, setNewComment] = useState('');
  const [commentingProduct, setCommentingProduct] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchWishlist();
    // Get current user from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(user);
  }, [id]);

  // Real-time updates
  useEffect(() => {
    if (socket && id) {
      setIsConnected(socket.connected);
      joinWishlist(id);

      // Listen for real-time updates
      socket.on('product-added', (data) => {
        if (data.wishlistId === id) {
          setWishlist(prev => ({
            ...prev,
            products: [...(prev?.products || []), data.product]
          }));
        }
      });

      socket.on('product-updated', (data) => {
        if (data.wishlistId === id) {
          setWishlist(prev => ({
            ...prev,
            products: prev?.products?.map(p => 
              p._id === data.product._id ? data.product : p
            ) || []
          }));
        }
      });

      socket.on('product-deleted', (data) => {
        if (data.wishlistId === id) {
          setWishlist(prev => ({
            ...prev,
            products: prev?.products?.filter(p => p._id !== data.productId) || []
          }));
        }
      });

      socket.on('comment-added', (data) => {
        if (data.wishlistId === id) {
          setWishlist(prev => ({
            ...prev,
            products: prev?.products?.map(p => 
              p._id === data.product._id ? data.product : p
            ) || []
          }));
        }
      });

      socket.on('reaction-added', (data) => {
        if (data.wishlistId === id) {
          setWishlist(prev => ({
            ...prev,
            products: prev?.products?.map(p => 
              p._id === data.product._id ? data.product : p
            ) || []
          }));
        }
      });

      socket.on('member-invited', (data) => {
        if (data.wishlistId === id) {
          fetchWishlist(); // Refresh to get updated member list
        }
      });

      // Connection status events
      socket.on('connect', () => {
        setIsConnected(true);
      });

      socket.on('disconnect', () => {
        setIsConnected(false);
      });

      return () => {
        leaveWishlist(id);
        socket.off('product-added');
        socket.off('product-updated');
        socket.off('product-deleted');
        socket.off('comment-added');
        socket.off('reaction-added');
        socket.off('member-invited');
        socket.off('connect');
        socket.off('disconnect');
      };
    }
  }, [socket, id, joinWishlist, leaveWishlist]);

  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(API_URLS.WISHLIST_BY_ID(id), {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlist(response.data);
    } catch (err) {
      console.error('Error fetching wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name.trim()) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(API_URLS.WISHLIST_PRODUCTS(id), 
        { 
          name: newProduct.name, 
          imageUrl: newProduct.imageUrl, 
          price: parseFloat(newProduct.price) || 0,
          category: newProduct.category || 'General'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewProduct({ name: '', imageUrl: '', price: '', category: '' });
      fetchWishlist();
    } catch (err) {
      console.error('Error adding product:', err);
    }
  };

  const updateProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct.name.trim()) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(API_URLS.WISHLIST_PRODUCT(id, editingProduct._id), 
        { 
          name: editingProduct.name, 
          imageUrl: editingProduct.imageUrl, 
          price: parseFloat(editingProduct.price) || 0,
          category: editingProduct.category || 'General'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingProduct(null);
      fetchWishlist();
    } catch (err) {
      console.error('Error updating product:', err);
    }
  };

  const deleteProduct = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(API_URLS.WISHLIST_PRODUCT(id, productId), {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchWishlist();
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  const inviteToWishlist = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setInviteLoading(true);
    setInviteMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(API_URLS.WISHLIST_INVITES(id), 
        { email: inviteEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setInviteMessage(response.data.message);
      setInviteEmail('');
      fetchWishlist(); // Refresh to show new member
    } catch (err) {
      console.error('Error inviting user:', err);
      setInviteMessage(err.response?.data?.message || 'Failed to invite user');
    } finally {
      setInviteLoading(false);
    }
  };

  const removeMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URLS.WISHLIST_BY_ID(id)}/members/${memberId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchWishlist(); // Refresh to show updated members
    } catch (err) {
      console.error('Error removing member:', err);
    }
  };

  const addComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !commentingProduct) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(API_URLS.PRODUCT_COMMENTS(id, commentingProduct), 
        { text: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewComment('');
      setCommentingProduct(null);
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const addReaction = async (productId, emoji) => {
    try {
      console.log('Adding reaction:', { productId, emoji, userId: currentUser?._id });
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found');
        alert('Please log in again');
        return;
      }

      const response = await axios.post(API_URLS.PRODUCT_REACTIONS(id, productId), 
        { emoji },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('Reaction response:', response.data);
      
      // Update the local state immediately for better UX
      setWishlist(prev => ({
        ...prev,
        products: prev?.products?.map(p => 
          p._id === productId ? response.data : p
        ) || []
      }));
      
    } catch (err) {
      console.error('Error adding reaction:', err);
      console.error('Error details:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      
      // Show user feedback for errors
      alert(`Failed to add reaction: ${err.response?.data?.message || err.message}`);
    }
  };

  const getReactionCount = (product, emoji) => {
    const count = product.reactions?.filter(r => r.emoji === emoji).length || 0;
    console.log(`Reaction count for ${emoji}:`, count, 'Product reactions:', product.reactions);
    return count;
  };

  const hasUserReacted = (product, emoji) => {
    if (!currentUser) {
      console.log('No current user found');
      return false;
    }
    
    const hasReacted = product.reactions?.some(r => r.emoji === emoji && r.user._id === currentUser._id);
    console.log(`User ${currentUser.username} has reacted with ${emoji}:`, hasReacted);
    return hasReacted;
  };

  const handleReactionClick = (productId, emoji) => {
    console.log('Reaction clicked:', { productId, emoji, currentUser: currentUser?.username });
    
    // Add visual feedback immediately
    const button = document.querySelector(`[data-reaction="${productId}-${emoji}"]`);
    if (button) {
      button.style.transform = 'scale(1.2)';
      setTimeout(() => {
        button.style.transform = 'scale(1)';
      }, 150);
    }
    
    // Call the API
    addReaction(productId, emoji);
  };

  const startEdit = (product) => {
    setEditingProduct({ ...product });
  };

  const cancelEdit = () => {
    setEditingProduct(null);
  };

  const getSortedAndFilteredProducts = () => {
    if (!wishlist?.products) return [];
    
    let filtered = wishlist.products;
    
    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(product => product.category === filterCategory);
    }
    
    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return (a.price || 0) - (b.price || 0);
        case 'price-high':
          return (b.price || 0) - (a.price || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        default:
          return 0;
      }
    });
    
    return filtered;
  };

  const getCategories = () => {
    if (!wishlist?.products) return [];
    const categories = [...new Set(wishlist.products.map(p => p.category || 'General'))];
    return categories.sort();
  };

  const getWishlistStats = () => {
    if (!wishlist?.products) return { totalItems: 0, totalValue: 0, avgPrice: 0 };
    
    const totalItems = wishlist.products.length;
    const totalValue = wishlist.products.reduce((sum, p) => sum + (p.price || 0), 0);
    const avgPrice = totalItems > 0 ? totalValue / totalItems : 0;
    
    return {
      totalItems,
      totalValue: Math.round(totalValue * 100) / 100,
      avgPrice: Math.round(avgPrice * 100) / 100
    };
  };

  const getProductBadge = (product) => {
    if (product.price > 500) return { text: '💎 Luxury', color: 'var(--primary-600)' };
    if (product.price > 100) return { text: '⭐ Premium', color: 'var(--orange-600)' };
    if (product.price > 50) return { text: '🎯 Mid-Range', color: 'var(--success-600)' };
    return { text: '💰 Budget', color: 'var(--gray-600)' };
  };

  if (loading) {
    return (
      <div className="loading">
        Loading...
      </div>
    );
  }

  if (!wishlist) {
    return (
      <div className="loading">
        Wishlist not found
      </div>
    );
  }

  const stats = getWishlistStats();
  const categories = getCategories();
  const sortedProducts = getSortedAndFilteredProducts();

  return (
    <div className="wishlist-page">
      <nav className="wishlist-nav">
        <div className="navbar-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => navigate('/dashboard')}
              className="back-btn"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-gradient">{wishlist.name}</h1>
          </div>
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
            <div style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>
              Owner: {wishlist.owner?.username || 'Unknown'}
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              fontSize: '0.875rem',
              color: isConnected ? 'var(--success-600)' : 'var(--danger-600)'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: isConnected ? 'var(--success-500)' : 'var(--danger-500)',
                animation: isConnected ? 'pulse 2s infinite' : 'none'
              }}></div>
              {isConnected ? 'Live' : 'Offline'}
              {!isConnected && (
                <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                  (Reconnecting...)
                </span>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="dashboard-content">
        {/* Wishlist Stats */}
        <div className="wishlist-stats">
          <div className="stat-card">
            <div className="stat-number">{stats.totalItems}</div>
            <div className="stat-label">Total Items</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">₹{stats.totalValue}</div>
            <div className="stat-label">Total Value</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">₹{stats.avgPrice}</div>
            <div className="stat-label">Average Price</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{categories.length}</div>
            <div className="stat-label">Categories</div>
          </div>
        </div>

        <div className="add-product">
          <h2>➕ Add New Item</h2>
          <form onSubmit={addProduct} className="add-product-form">
            <input
              type="text"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              placeholder="Item name"
              required
            />
            <input
              type="url"
              value={newProduct.imageUrl}
              onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
              placeholder="Image URL (optional)"
            />
            <input
              type="number"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              placeholder="Price (optional)"
              step="0.01"
              min="0"
            />
            <select
              value={newProduct.category}
              onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
              style={{
                flex: 1,
                minWidth: '150px',
                padding: '1rem 1.25rem',
                border: '2px solid var(--gray-200)',
                borderRadius: 'var(--radius-md)',
                fontSize: '1rem',
                fontWeight: '500',
                transition: 'var(--transition)',
                background: 'white'
              }}
            >
              <option value="">Select Category</option>
              <option value="Electronics">Electronics</option>
              <option value="Clothing">Clothing</option>
              <option value="Books">Books</option>
              <option value="Home & Garden">Home & Garden</option>
              <option value="Sports">Sports</option>
              <option value="Beauty">Beauty</option>
              <option value="Toys">Toys</option>
              <option value="General">General</option>
            </select>
            <button type="submit" className="btn btn-primary" style={{ width: 'auto' }}>
              Add Item
            </button>
          </form>
        </div>

        {/* Invite Members Section */}
        <div className="invite-members" style={{
          marginBottom: '2.5rem',
          padding: '2rem',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <h2 style={{ 
            marginBottom: '1.5rem', 
            fontSize: '1.75rem', 
            fontWeight: '700', 
            color: 'var(--gray-800)' 
          }}>
            👥 Invite Members
          </h2>
          
          <form onSubmit={inviteToWishlist} style={{ 
            display: 'flex', 
            gap: '1rem', 
            alignItems: 'center', 
            flexWrap: 'wrap',
            marginBottom: '1rem'
          }}>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Enter email address to invite"
              required
              style={{
                flex: 1,
                minWidth: '250px',
                padding: '1rem 1.25rem',
                border: '2px solid var(--gray-200)',
                borderRadius: 'var(--radius-md)',
                fontSize: '1rem',
                fontWeight: '500',
                transition: 'var(--transition)'
              }}
            />
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={inviteLoading}
              style={{ width: 'auto' }}
            >
              {inviteLoading ? 'Inviting...' : 'Invite'}
            </button>
          </form>

          {inviteMessage && (
            <div style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1rem',
              backgroundColor: inviteMessage.includes('Successfully') ? 'var(--success-50)' : 'var(--danger-50)',
              color: inviteMessage.includes('Successfully') ? 'var(--success-700)' : 'var(--danger-700)',
              border: `1px solid ${inviteMessage.includes('Successfully') ? 'var(--success-200)' : 'var(--danger-200)'}`
            }}>
              {inviteMessage}
            </div>
          )}

          {/* Current Members */}
          <div>
            <h3 style={{ 
              marginBottom: '1rem', 
              fontSize: '1.25rem', 
              fontWeight: '600', 
              color: 'var(--gray-700)' 
            }}>
              Current Members ({wishlist.members?.length || 0})
            </h3>
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '0.75rem' 
            }}>
              {wishlist.members?.map((member) => (
                <div key={member._id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: 'var(--gray-100)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--gray-200)'
                }}>
                  <span style={{ fontWeight: '500', color: 'var(--gray-700)' }}>
                    {member.username || member.email}
                  </span>
                  {member._id === wishlist.owner?._id && (
                    <span style={{
                      fontSize: '0.75rem',
                      padding: '0.25rem 0.5rem',
                      backgroundColor: 'var(--primary-100)',
                      color: 'var(--primary-700)',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: '500'
                    }}>
                      Owner
                    </span>
                  )}
                  {member._id !== wishlist.owner?._id && (
                    <button
                      onClick={() => removeMember(member._id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--danger-500)',
                        cursor: 'pointer',
                        fontSize: '1.25rem',
                        padding: '0',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title="Remove member"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filters and Sorting */}
        <div className="glass-effect" style={{ 
          padding: '1.5rem', 
          marginBottom: '2rem',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontWeight: '500', color: 'var(--gray-700)' }}>Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '0.5rem 1rem',
                border: '2px solid var(--gray-200)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                background: 'white'
              }}
            >
              <option value="name">Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="date">Date Added</option>
            </select>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontWeight: '500', color: 'var(--gray-700)' }}>Category:</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{
                padding: '0.5rem 1rem',
                border: '2px solid var(--gray-200)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                background: 'white'
              }}
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <h2 className="text-gradient" style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>
            🛍️ Items ({sortedProducts.length})
          </h2>
          {sortedProducts.length === 0 ? (
            <div className="glass-effect" style={{ 
              padding: '3rem', 
              textAlign: 'center', 
              borderRadius: 'var(--radius-xl)',
              color: 'var(--gray-600)',
              fontSize: '1.125rem'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.5 }}>📦</div>
              <h3 style={{ marginBottom: '1rem', color: 'var(--gray-800)' }}>No items yet!</h3>
              <p>Add your first item to this wishlist to get started.</p>
            </div>
          ) : (
            <div className="products-grid">
              {sortedProducts.map((product) => {
                const badge = getProductBadge(product);
                
                return (
                  <div key={product._id} className="product-card hover-lift">
                    {product.imageUrl ? (
                      <div className="product-image">
                        <img 
                          src={product.imageUrl} 
                          alt={product.name}
                          style={{ objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                        <div className="product-badge" style={{ backgroundColor: badge.color }}>
                          {badge.text}
                        </div>
                      </div>
                    ) : (
                      <div className="product-image">
                        <div style={{ fontSize: '3rem', opacity: 0.5 }}>📦</div>
                        <div className="product-badge" style={{ backgroundColor: badge.color }}>
                          {badge.text}
                        </div>
                      </div>
                    )}
                    <div className="product-content">
                      {editingProduct?._id === product._id ? (
                        <form onSubmit={updateProduct} className="edit-form">
                          <input
                            type="text"
                            value={editingProduct.name}
                            onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                            required
                          />
                          <input
                            type="url"
                            value={editingProduct.imageUrl}
                            onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })}
                            placeholder="Image URL"
                          />
                          <input
                            type="number"
                            value={editingProduct.price}
                            onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                            placeholder="Price"
                            step="0.01"
                            min="0"
                          />
                          <select
                            value={editingProduct.category || ''}
                            onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                            style={{
                              width: '100%',
                              padding: '0.75rem 1rem',
                              border: '2px solid var(--gray-200)',
                              borderRadius: 'var(--radius-md)',
                              fontSize: '0.875rem',
                              marginBottom: '1rem',
                              background: 'white'
                            }}
                          >
                            <option value="">Select Category</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Clothing">Clothing</option>
                            <option value="Books">Books</option>
                            <option value="Home & Garden">Home & Garden</option>
                            <option value="Sports">Sports</option>
                            <option value="Beauty">Beauty</option>
                            <option value="Toys">Toys</option>
                            <option value="General">General</option>
                          </select>
                          <div className="edit-actions">
                            <button type="submit" className="btn btn-success">
                              Save
                            </button>
                            <button type="button" onClick={cancelEdit} className="btn" style={{ 
                              background: 'var(--gray-500)', 
                              color: 'white' 
                            }}>
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <h3 className="product-name">{product.name}</h3>
                          {product.price > 0 && (
                            <p className="product-price">{product.price}</p>
                          )}
                          {product.category && (
                            <p className="product-meta">
                              <span style={{ fontWeight: '600' }}>🏷️</span>
                              {product.category}
                            </p>
                          )}
                          <p className="product-meta">
                            <span style={{ fontWeight: '600' }}>👤</span>
                            Added by: {product.addedBy?.username || 'Unknown'}
                          </p>
                          {product.editedBy && (
                            <p className="product-meta">
                              <span style={{ fontWeight: '600' }}>✏️</span>
                              Edited by: {product.editedBy?.username || 'Unknown'}
                            </p>
                          )}
                          {/* Reactions */}
                          <div className="product-reactions" style={{ 
                            marginTop: '1rem', 
                            paddingTop: '1rem', 
                            borderTop: '1px solid var(--gray-200)' 
                          }}>
                            <div style={{ 
                              display: 'flex', 
                              gap: '0.5rem', 
                              marginBottom: '0.75rem',
                              flexWrap: 'wrap'
                            }}>
                              {['❤️', '👍', '🎉', '🔥', '💯'].map((emoji) => (
                                <button
                                  key={emoji}
                                  onClick={() => handleReactionClick(product._id, emoji)}
                                  data-reaction={`${product._id}-${emoji}`}
                                  style={{
                                    background: hasUserReacted(product, emoji) ? 'var(--primary-100)' : 'var(--gray-100)',
                                    border: `1px solid ${hasUserReacted(product, emoji) ? 'var(--primary-300)' : 'var(--gray-200)'}`,
                                    borderRadius: 'var(--radius-md)',
                                    padding: '0.5rem',
                                    cursor: 'pointer',
                                    fontSize: '1.25rem',
                                    transition: 'var(--transition)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    boxShadow: 'var(--shadow-sm)'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.target.style.transform = 'scale(1.1)';
                                    e.target.style.boxShadow = 'var(--shadow-md)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.target.style.transform = 'scale(1)';
                                    e.target.style.boxShadow = 'var(--shadow-sm)';
                                  }}
                                  title={`${emoji} ${getReactionCount(product, emoji)}`}
                                >
                                  {emoji}
                                  {getReactionCount(product, emoji) > 0 && (
                                    <span style={{ 
                                      fontSize: '0.75rem', 
                                      fontWeight: '600',
                                      color: hasUserReacted(product, emoji) ? 'var(--primary-700)' : 'var(--gray-600)'
                                    }}>
                                      {getReactionCount(product, emoji)}
                                    </span>
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Comments */}
                          <div className="product-comments" style={{ 
                            marginTop: '1rem', 
                            paddingTop: '1rem', 
                            borderTop: '1px solid var(--gray-200)' 
                          }}>
                            <div style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center',
                              marginBottom: '0.75rem'
                            }}>
                              <h4 style={{ 
                                fontSize: '1rem', 
                                fontWeight: '600', 
                                color: 'var(--gray-700)',
                                margin: 0
                              }}>
                                💬 Comments ({product.comments?.length || 0})
                              </h4>
                              <button
                                onClick={() => setCommentingProduct(commentingProduct === product._id ? null : product._id)}
                                className="btn"
                                style={{ 
                                  fontSize: '0.875rem', 
                                  padding: '0.5rem 1rem',
                                  background: 'var(--gray-100)',
                                  color: 'var(--gray-700)',
                                  border: '1px solid var(--gray-200)'
                                }}
                              >
                                {commentingProduct === product._id ? 'Cancel' : 'Add Comment'}
                              </button>
                            </div>

                                                         {/* Add Comment Form */}
                             {commentingProduct === product._id && (
                               <form onSubmit={addComment} style={{ marginBottom: '1rem' }}>
                                 {currentUser && (
                                   <div style={{ 
                                     marginBottom: '0.5rem', 
                                     fontSize: '0.875rem', 
                                     color: 'var(--gray-600)' 
                                   }}>
                                     Commenting as: <strong>{currentUser.username || currentUser.email}</strong>
                                   </div>
                                 )}
                                 <textarea
                                   value={newComment}
                                   onChange={(e) => setNewComment(e.target.value)}
                                   placeholder="Write a comment..."
                                   required
                                  style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '2px solid var(--gray-200)',
                                    borderRadius: 'var(--radius-md)',
                                    fontSize: '0.875rem',
                                    resize: 'vertical',
                                    minHeight: '80px',
                                    fontFamily: 'inherit'
                                  }}
                                />
                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                  <button type="submit" className="btn btn-primary" style={{ fontSize: '0.875rem' }}>
                                    Post Comment
                                  </button>
                                  <button 
                                    type="button" 
                                    onClick={() => {
                                      setCommentingProduct(null);
                                      setNewComment('');
                                    }}
                                    className="btn"
                                    style={{ 
                                      fontSize: '0.875rem',
                                      background: 'var(--gray-100)',
                                      color: 'var(--gray-700)',
                                      border: '1px solid var(--gray-200)'
                                    }}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </form>
                            )}

                            {/* Comments List */}
                            {product.comments && product.comments.length > 0 && (
                              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                {product.comments.map((comment, index) => (
                                  <div key={index} style={{
                                    padding: '0.75rem',
                                    backgroundColor: 'var(--gray-50)',
                                    borderRadius: 'var(--radius-md)',
                                    marginBottom: '0.5rem',
                                    border: '1px solid var(--gray-200)'
                                  }}>
                                    <div style={{ 
                                      display: 'flex', 
                                      justifyContent: 'space-between', 
                                      alignItems: 'flex-start',
                                      marginBottom: '0.25rem'
                                    }}>
                                      <span style={{ 
                                        fontWeight: '600', 
                                        fontSize: '0.875rem',
                                        color: 'var(--gray-700)'
                                      }}>
                                        {comment.user?.username || 'Unknown'}
                                      </span>
                                      <span style={{ 
                                        fontSize: '0.75rem', 
                                        color: 'var(--gray-500)'
                                      }}>
                                        {new Date(comment.createdAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <p style={{ 
                                      margin: 0, 
                                      fontSize: '0.875rem',
                                      color: 'var(--gray-600)',
                                      lineHeight: '1.4'
                                    }}>
                                      {comment.text}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="product-actions" style={{ marginTop: '1rem' }}>
                            <button
                              onClick={() => startEdit(product)}
                              className="btn btn-primary"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteProduct(product._id)}
                              className="btn btn-danger"
                            >
                              Remove
                            </button>
                          </div>
                        </>
                      )}
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