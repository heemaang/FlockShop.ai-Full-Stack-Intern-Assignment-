require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

const authRoutes = require('./routes/auth');
const wishlistRoutes = require('./routes/wishlist');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  // Join a wishlist room
  socket.on('join-wishlist', (wishlistId) => {
    socket.join(`wishlist-${wishlistId}`);
    console.log(`👥 User ${socket.id} joined wishlist ${wishlistId}`);
  });

  // Leave a wishlist room
  socket.on('leave-wishlist', (wishlistId) => {
    socket.leave(`wishlist-${wishlistId}`);
    console.log(`👋 User ${socket.id} left wishlist ${wishlistId}`);
  });

  // Handle product updates
  socket.on('product-updated', (data) => {
    console.log('🔄 Product updated:', data.productId);
    socket.to(`wishlist-${data.wishlistId}`).emit('product-updated', data);
  });

  // Handle product added
  socket.on('product-added', (data) => {
    console.log('➕ Product added:', data.productId);
    socket.to(`wishlist-${data.wishlistId}`).emit('product-added', data);
  });

  // Handle product deleted
  socket.on('product-deleted', (data) => {
    console.log('🗑️ Product deleted:', data.productId);
    socket.to(`wishlist-${data.wishlistId}`).emit('product-deleted', data);
  });

  // Handle comment added
  socket.on('comment-added', (data) => {
    console.log('💬 Comment added to product:', data.productId);
    socket.to(`wishlist-${data.wishlistId}`).emit('comment-added', data);
  });

  // Handle reaction added
  socket.on('reaction-added', (data) => {
    console.log('😀 Reaction added to product:', data.productId);
    socket.to(`wishlist-${data.wishlistId}`).emit('reaction-added', data);
  });

  // Handle member invited
  socket.on('member-invited', (data) => {
    console.log('👤 Member invited to wishlist:', data.wishlistId);
    socket.to(`wishlist-${data.wishlistId}`).emit('member-invited', data);
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ User disconnected:', socket.id, 'Reason:', reason);
  });
});

// Make io available to routes
app.set('io', io);

// Set JWT secret if not provided
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'your-secret-key-change-in-production';
  console.log('Warning: Using default JWT_SECRET. Set JWT_SECRET in .env for production.');
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/wishlists', wishlistRoutes);

// Test endpoint to check if server is running
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Server is running!', 
    mongoConnected: mongoose.connection.readyState === 1,
    jwtSecret: process.env.JWT_SECRET ? 'Set' : 'Not set',
    timestamp: new Date().toISOString(),
    socketConnections: io.engine.clientsCount
  });
});

// Test endpoint for reactions
app.get('/api/test/reactions', (req, res) => {
  res.json({
    message: 'Reaction API is accessible',
    routes: {
      addReaction: 'POST /api/wishlists/:id/products/:productId/reactions',
      addComment: 'POST /api/wishlists/:id/products/:productId/comments'
    }
  });
});

const PORT = process.env.PORT || 5000;

// Try to connect to MongoDB, but don't fail if it's not available
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sharedwishlist', { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
.then(() => {
  console.log('Connected to MongoDB');
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})
.catch(err => {
  console.log('MongoDB connection failed, but server will start with mock data');
  console.log('To use real database, install MongoDB or use MongoDB Atlas');
  
  // Start server anyway for demo purposes
  server.listen(PORT, () => console.log(`Server running on port ${PORT} (mock mode)`));
}); 