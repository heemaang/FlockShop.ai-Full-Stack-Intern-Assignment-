import { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { API_URLS } from '../config/api';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);

  useEffect(() => {
    const connectSocket = () => {
      console.log('Attempting to connect to WebSocket server...');
      const newSocket = io(API_URLS.WEBSOCKET_URL, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });
      
      newSocket.on('connect', () => {
        console.log('✅ Connected to WebSocket server with ID:', newSocket.id);
        setIsConnected(true);
        setConnectionAttempts(0);
      });

      newSocket.on('disconnect', (reason) => {
        console.log('❌ Disconnected from WebSocket server:', reason);
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('❌ WebSocket connection error:', error);
        setIsConnected(false);
        setConnectionAttempts(prev => prev + 1);
      });

      newSocket.on('reconnect', (attemptNumber) => {
        console.log('🔄 Reconnected to WebSocket server after', attemptNumber, 'attempts');
        setIsConnected(true);
      });

      newSocket.on('reconnect_error', (error) => {
        console.error('❌ WebSocket reconnection error:', error);
        setIsConnected(false);
      });

      setSocket(newSocket);

      return newSocket;
    };

    const socketInstance = connectSocket();

    return () => {
      console.log('Cleaning up WebSocket connection...');
      socketInstance.close();
    };
  }, []);

  const joinWishlist = (wishlistId) => {
    if (socket && isConnected) {
      console.log('Joining wishlist room:', wishlistId);
      socket.emit('join-wishlist', wishlistId);
    } else {
      console.warn('Cannot join wishlist: Socket not connected');
    }
  };

  const leaveWishlist = (wishlistId) => {
    if (socket && isConnected) {
      console.log('Leaving wishlist room:', wishlistId);
      socket.emit('leave-wishlist', wishlistId);
    }
  };

  const value = {
    socket,
    isConnected,
    connectionAttempts,
    joinWishlist,
    leaveWishlist
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}; 