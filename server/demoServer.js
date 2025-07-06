const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

// In-memory storage for demo
let users = [];
let wishlists = [];
let products = [];

// Demo endpoints
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      _id: Date.now().toString(),
      username,
      email,
      password: hashedPassword
    };
    
    users.push(user);
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { userId: user._id, username: user.username, email: user.email },
      'demo_secret_key',
      { expiresIn: '1d' }
    );
    
    res.json({
      token,
      user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mock auth middleware
const mockAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, 'demo_secret_key');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Wishlist endpoints
app.post('/api/wishlists', mockAuth, (req, res) => {
  const { name } = req.body;
  const wishlist = {
    _id: Date.now().toString(),
    name,
    owner: req.user.userId,
    members: [req.user.userId],
    products: []
  };
  wishlists.push(wishlist);
  res.status(201).json(wishlist);
});

app.get('/api/wishlists', mockAuth, (req, res) => {
  const userWishlists = wishlists.filter(w => w.members.includes(req.user.userId));
  res.json(userWishlists);
});

app.get('/api/wishlists/:id', mockAuth, (req, res) => {
  const wishlist = wishlists.find(w => w._id === req.params.id);
  if (!wishlist) {
    return res.status(404).json({ message: 'Wishlist not found' });
  }
  res.json(wishlist);
});

// Product endpoints
app.post('/api/wishlists/:id/products', mockAuth, (req, res) => {
  const { name, imageUrl, price } = req.body;
  const product = {
    _id: Date.now().toString(),
    name,
    imageUrl,
    price: parseFloat(price) || 0,
    addedBy: req.user.userId
  };
  products.push(product);
  
  const wishlist = wishlists.find(w => w._id === req.params.id);
  if (wishlist) {
    wishlist.products.push(product._id);
  }
  
  res.status(201).json(product);
});

app.put('/api/wishlists/:id/products/:productId', mockAuth, (req, res) => {
  const { name, imageUrl, price } = req.body;
  const product = products.find(p => p._id === req.params.productId);
  
  if (product) {
    product.name = name;
    product.imageUrl = imageUrl;
    product.price = parseFloat(price) || 0;
    product.editedBy = req.user.userId;
  }
  
  res.json(product);
});

app.delete('/api/wishlists/:id/products/:productId', mockAuth, (req, res) => {
  const productIndex = products.findIndex(p => p._id === req.params.productId);
  if (productIndex !== -1) {
    products.splice(productIndex, 1);
  }
  
  const wishlist = wishlists.find(w => w._id === req.params.id);
  if (wishlist) {
    wishlist.products = wishlist.products.filter(p => p !== req.params.productId);
  }
  
  res.json({ message: 'Product deleted' });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Demo server is running!', users: users.length, wishlists: wishlists.length });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Demo server running on port ${PORT}`);
  console.log('This is a demo version that works without MongoDB');
}); 