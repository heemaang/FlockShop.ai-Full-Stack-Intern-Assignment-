const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Wishlist Server...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file with default settings...');
  const envContent = `JWT_SECRET=your-secret-key-change-in-production
MONGO_URI=mongodb://localhost:27017/sharedwishlist
PORT=5000`;
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created');
}

// Check if MongoDB is available
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/sharedwishlist', { 
  useNewUrlParser: true, 
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000
})
.then(() => {
  console.log('✅ MongoDB connected - Starting main server');
  mongoose.connection.close();
  startMainServer();
})
.catch(() => {
  console.log('⚠️  MongoDB not available - Starting demo server');
  startDemoServer();
});

function startMainServer() {
  const server = spawn('node', ['server.js'], {
    stdio: 'inherit',
    cwd: __dirname
  });
  
  server.on('error', (err) => {
    console.error('❌ Failed to start main server:', err);
  });
}

function startDemoServer() {
  const server = spawn('node', ['demoServer.js'], {
    stdio: 'inherit',
    cwd: __dirname
  });
  
  server.on('error', (err) => {
    console.error('❌ Failed to start demo server:', err);
  });
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down server...');
  process.exit(0);
}); 