const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  console.log('Auth middleware called for:', req.method, req.path);
  console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
  
  const authHeader = req.headers.authorization;
  console.log('Auth header:', authHeader ? 'Present' : 'Missing');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('No valid auth header found');
    return res.status(401).json({ message: 'No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  console.log('Token extracted:', token ? 'Token exists' : 'No token');
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verified successfully for user:', decoded.username);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    res.status(401).json({ message: 'Invalid token' });
  }
}; 