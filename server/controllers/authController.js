const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User created' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    console.log('Login attempt for email:', req.body.email);
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
    
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    console.log('User found:', user.username);
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      console.log('Password mismatch for user:', user.username);
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    console.log('Password verified for user:', user.username);
    const token = jwt.sign(
      { userId: user._id, username: user.username, email: user.email }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );
    
    console.log('Token generated successfully');
    console.log('Token length:', token.length);
    
    res.json({ 
      token, 
      user: { id: user._id, username: user.username, email: user.email } 
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: err.message });
  }
}; 