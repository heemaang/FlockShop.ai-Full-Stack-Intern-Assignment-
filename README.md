# 🛍️ Shared Wishlist App

A collaborative product wishlist application built with the MERN stack (MongoDB, Express, React, Node.js) where multiple users can create, manage, and interact with wishlists in real-time. Perfect for group shopping, gift planning, and collaborative wishlist management.

## 🌐 Live Demo

**🔗 [View Live Application](https://flock-shop-ai-full-stack-intern-ass.vercel.app/)**

*Experience the full application with real-time collaboration features!*

## 📋 Assignment Overview

This project demonstrates a full-stack web application that simulates a real-world collaborative shopping experience. Users can create shared wishlists, add products, invite others, and interact in real-time with features like comments and emoji reactions.

**Deadline:** Submit by 4th May 2025

## ✨ Features Implemented

### ✅ Core Requirements (All Implemented)

#### Frontend Features
- **User Authentication**: Complete signup/login system with JWT
- **Wishlist Management**: Create, view, edit, and delete wishlists
- **Product Management**: Add, edit, and remove products with name, image URL, and price
- **User Tracking**: Shows who added/edited each item with timestamps
- **Invite System**: Invite users to join wishlists by email
- **Responsive Design**: Mobile-friendly UI that works on all devices

#### Backend Features
- **RESTful APIs**: Complete CRUD operations for users, wishlists, and products
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **Database Integration**: MongoDB with Mongoose ODM
- **User Management**: Track who created/edited each item
- **Data Validation**: Input validation and error handling

### 🚀 Bonus Features (All Implemented)

#### Real-time Collaboration
- **WebSocket Integration**: Real-time updates using Socket.IO
- **Live Sync**: Products, comments, and reactions update instantly across all users
- **Connection Status**: Visual indicators for online/offline status
- **Auto-reconnection**: Robust connection handling with retry logic

#### Social Features
- **Comments System**: Users can comment on products with real-time updates
- **Emoji Reactions**: 5 different emoji reactions (❤️, 👍, 🎉, 🔥, 💯) with toggle functionality
- **User Activity Tracking**: Shows who added, edited, or reacted to items
- **Member Management**: Invite and remove members from wishlists

#### Advanced UI/UX
- **Modern Design**: Clean, intuitive interface with glass morphism effects
- **Responsive Layout**: Optimized for desktop, tablet, and mobile
- **Interactive Elements**: Hover effects, animations, and visual feedback
- **Accessibility**: High contrast support and reduced motion preferences
- **Currency Display**: Prices shown in Indian Rupees (₹)

#### Additional Features
- **Product Categories**: Organize products by categories
- **Sorting & Filtering**: Sort by name, price, date; filter by category
- **Statistics Dashboard**: Total items, value, average price, and category count
- **Delete Confirmation**: Safe deletion with confirmation dialogs
- **Error Handling**: Comprehensive error messages and user feedback

## 📸 Screenshots

### 🔐 Authentication
![Login Page](./Photos/Login.png)

### 🏠 Dashboard
![Dashboard](./Photos/dashboard.png)

### 📋 Wishlist Management
![Wishlist View](./Photos/wishlistview.png)
![Wishlist Preview](./Photos/wishlistPreview.png)
![Wishlist Item](./Photos/wishlistItem.png)


## 🛠️ Tech Stack

### Frontend
- **React 19.1.0** - Modern React with hooks and functional components
- **Vite 4.5.0** - Fast build tool and development server
- **React Router 7.6.3** - Client-side routing
- **Socket.IO Client 4.8.1** - Real-time WebSocket communication
- **Axios 1.10.0** - HTTP client for API calls
- **CSS3** - Custom CSS with modern features (Grid, Flexbox, CSS Variables)

### Backend
- **Node.js** - JavaScript runtime
- **Express 5.1.0** - Web framework
- **MongoDB 8.16.1** - NoSQL database
- **Mongoose 8.16.1** - MongoDB object modeling
- **Socket.IO 4.8.1** - Real-time bidirectional communication
- **JWT 9.0.2** - JSON Web Token authentication
- **bcryptjs 3.0.2** - Password hashing
- **CORS 2.8.5** - Cross-origin resource sharing
- **dotenv 17.0.1** - Environment variable management

### Development Tools
- **ESLint** - Code linting
- **Nodemon** - Auto-restart server during development

## 📁 Project Structure

```
shared-wishlist-app/
├── client/                          # React Frontend
│   ├── src/
│   │   ├── config/
│   │   │   ├── api.js               # API endpoint configuration
│   │   │   └── config.js            # Environment configuration
│   │   ├── contexts/
│   │   │   └── SocketContext.jsx    # WebSocket connection management
│   │   ├── pages/
│   │   │   ├── Login.jsx            # User authentication
│   │   │   ├── Signup.jsx           # User registration
│   │   │   ├── Dashboard.jsx        # Main dashboard with wishlists
│   │   │   └── WishlistPage.jsx     # Individual wishlist view
│   │   ├── App.jsx                  # Main app component with routing
│   │   ├── App.css                  # App-specific styles
│   │   ├── main.jsx                 # Entry point
│   │   └── index.css                # Global styles
│   ├── .gitignore                   # Git ignore rules
│   ├── index.html                   # HTML template
│   ├── package.json                 # Frontend dependencies
│   ├── vite.config.js               # Vite configuration
│   └── eslint.config.js             # ESLint configuration
├── server/                          # Node.js Backend
│   ├── models/
│   │   ├── User.js                  # User schema
│   │   ├── Wishlist.js              # Wishlist schema
│   │   └── Product.js               # Product schema with comments/reactions
│   ├── routes/
│   │   ├── auth.js                  # Authentication routes
│   │   └── wishlist.js              # Wishlist and product routes
│   ├── controllers/
│   │   ├── authController.js        # Authentication logic
│   │   └── wishlistController.js    # Wishlist and product logic
│   ├── middleware/
│   │   └── authMiddleware.js        # JWT authentication middleware
│   ├── .gitignore                   # Git ignore rules
│   ├── server.js                    # Main server with Socket.IO
│   ├── package.json                 # Backend dependencies
│   └── .env                         # Environment variables
└── README.md                        # Project documentation
```

## 🚀 Setup Instructions

### Prerequisites
- **Node.js** (v16 or higher)
- **MongoDB** (local installation or MongoDB Atlas account)
- **npm** or **yarn** package manager
- **Git** for version control

### Step 1: Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd shared-wishlist-app

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### Step 2: Environment Configuration

#### Backend Environment
Create a `.env` file in the `server` directory:

```env
# Server Configuration
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_change_in_production

# Database Configuration
MONGO_URI=mongodb://localhost:27017/sharedwishlist

# For MongoDB Atlas, use your connection string:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/sharedwishlist
```

#### Frontend Environment
The frontend is configured to use the hosted backend by default. For local development, create a `.env` file in the `client` directory:

```env
# For local development
VITE_API_URL=http://localhost:5000

# For production (default)
VITE_API_URL=https://flockshop-ai-full-stack-intern-assignment.onrender.com
```

### Step 3: Start the Application

#### Start Backend Server (Terminal 1)
```bash
cd server
npm run dev
```
Server will run on `http://localhost:5000`

#### Start Frontend Development Server (Terminal 2)
```bash
cd client
npm run dev
```
Frontend will run on `http://localhost:5173`

### Step 4: Access the Application

1. Open your browser and navigate to `http://localhost:5173`
2. Register a new account or login with existing credentials
3. Start creating and managing your wishlists!

## 🧪 Testing the Application

### 1. User Registration & Authentication
1. Navigate to the signup page
2. Fill in username, email, and password
3. Click "Sign up" to create account
4. Login with your credentials
5. Verify JWT token is stored in localStorage

### 2. Wishlist Management
1. Create a new wishlist from the dashboard
2. Click on a wishlist to view its details
3. Add products with name, image URL, price, and category
4. Edit product details
5. Delete products with confirmation
6. Delete entire wishlists

### 3. Real-time Collaboration
1. Open the app in two different browser windows/tabs
2. Login with different user accounts
3. Join the same wishlist
4. Add/edit/delete products and observe real-time updates
5. Test WebSocket connection status indicators

### 4. Social Features
1. Add comments to products
2. Use emoji reactions (❤️, 👍, 🎉, 🔥, 💯)
3. Invite users to wishlists by email
4. Remove members from wishlists
5. View user activity tracking

### 5. Mobile Responsiveness
1. Test on different screen sizes
2. Verify touch-friendly interactions
3. Check responsive layout on mobile devices

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user

### Wishlists
- `GET /api/wishlists` - Get user's wishlists
- `POST /api/wishlists` - Create new wishlist
- `GET /api/wishlists/:id` - Get specific wishlist
- `PUT /api/wishlists/:id` - Update wishlist
- `DELETE /api/wishlists/:id` - Delete wishlist

### Products
- `POST /api/wishlists/:id/products` - Add product to wishlist
- `PUT /api/wishlists/:id/products/:productId` - Update product
- `DELETE /api/wishlists/:id/products/:productId` - Delete product

### Social Features
- `POST /api/wishlists/:id/products/:productId/comments` - Add comment
- `POST /api/wishlists/:id/products/:productId/reactions` - Add/remove reaction
- `POST /api/wishlists/:id/invite` - Invite user to wishlist
- `DELETE /api/wishlists/:id/members/:memberId` - Remove member

### WebSocket Events
- `join-wishlist` - Join wishlist room
- `leave-wishlist` - Leave wishlist room
- `product-added` - Product added notification
- `product-updated` - Product updated notification
- `product-deleted` - Product deleted notification
- `comment-added` - Comment added notification
- `reaction-added` - Reaction added/removed notification
- `member-invited` - Member invited notification

## 📊 Database Schema

### User Model
```javascript
{
  username: String (required),
  email: String (required, unique),
  password: String (hashed),
  createdAt: Date
}
```

### Wishlist Model
```javascript
{
  name: String (required),
  owner: ObjectId (ref: User),
  members: [ObjectId] (ref: User),
  products: [ObjectId] (ref: Product),
  createdAt: Date,
  updatedAt: Date
}
```

### Product Model
```javascript
{
  name: String (required),
  imageUrl: String,
  price: Number,
  category: String,
  addedBy: ObjectId (ref: User),
  editedBy: ObjectId (ref: User),
  comments: [{
    text: String,
    user: ObjectId (ref: User),
    createdAt: Date
  }],
  reactions: [{
    emoji: String,
    user: ObjectId (ref: User),
    createdAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

## 🎯 Assumptions & Limitations

### Current Implementation
- **Authentication**: JWT-based with localStorage (suitable for demo)
- **Invite System**: Mocked email invitation (no actual email sending)
- **Image URLs**: Must be valid image URLs (no file upload)
- **Database**: MongoDB (local or Atlas)
- **Real-time**: WebSocket-based with fallback to polling
- **Security**: Basic validation (production needs more robust security)

### Production Considerations
- Implement HTTPS and secure headers
- Add email verification and password reset
- Use Redis for session management
- Implement rate limiting and API throttling
- Add comprehensive input validation and sanitization
- Set up proper logging and monitoring
- Use environment-specific configurations
- Implement proper error handling and recovery

## 🚀 Scaling & Future Improvements

### Short-term Enhancements
- **Email Integration**: Real email invitations with templates
- **File Upload**: Image upload with cloud storage
- **Search & Filter**: Advanced product search and filtering
- **Notifications**: Push notifications for updates
- **Export/Import**: Wishlist sharing via URL or file export

### Long-term Features
- **Mobile App**: React Native or Flutter app
- **Payment Integration**: Direct purchase links
- **AI Recommendations**: Product suggestions based on preferences
- **Analytics Dashboard**: Usage statistics and insights
- **Multi-language Support**: Internationalization
- **Advanced Permissions**: Role-based access control
- **API Documentation**: Swagger/OpenAPI documentation

## 🔧 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   ```bash
   # Ensure MongoDB is running locally
   mongod
   
   # Or check Atlas connection string
   # Verify IP whitelist includes your IP
   ```

2. **Port Already in Use**
   ```bash
   # Kill process using port 5000
   npx kill-port 5000
   
   # Or change PORT in .env file
   PORT=5001
   ```

3. **CORS Errors**
   - Ensure backend is running on correct port
   - Check CORS configuration in server.js
   - Verify frontend URL in CORS settings

4. **WebSocket Connection Issues**
   - Check if Socket.IO server is running
   - Verify WebSocket URL in client
   - Check browser console for connection errors

5. **Authentication Issues**
   - Clear localStorage and re-login
   - Verify JWT_SECRET in .env
   - Check token expiration

### Development Commands

```bash
# Backend
cd server
npm run dev          # Start with nodemon
npm start           # Start production server

# Frontend
cd client
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
```


## 👨‍💻 Author

*Heemaang Saxena*
- **Email**: [heemaang.saxena18@gmail.com]
- **GitHub**: [https://github.com/heemaang]
- **LinkedIn**: [https://www.linkedin.com/in/heemaang-saxena/]

---

