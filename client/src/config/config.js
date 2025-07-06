// Configuration file for switching between local and hosted environments
// Uses environment variables for flexible configuration

const config = {
  // Backend API URL - uses environment variable with fallback
  // Set REACT_APP_API_URL in .env file
  // For production (hosted): https://flockshop-ai-full-stack-intern-assignment.onrender.com
  // For local development: http://localhost:5000
  API_BASE_URL: import.meta.env.VITE_API_URL || 'https://flockshop-ai-full-stack-intern-assignment.onrender.com',
  
  // WebSocket URL (automatically derived from API_BASE_URL)
  get WEBSOCKET_URL() {
    return this.API_BASE_URL.replace('https://', 'wss://').replace('http://', 'ws://');
  }
};

export default config; 