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
      const newSocket = io(API_URLS.WEBSOCKET_URL, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });
      
      newSocket.on('connect', () => {
        setIsConnected(true);
        setConnectionAttempts(0);
      });

      newSocket.on('disconnect', (reason) => {
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        setIsConnected(false);
        setConnectionAttempts(prev => prev + 1);
      });

      newSocket.on('reconnect', (attemptNumber) => {
        setIsConnected(true);
      });

      newSocket.on('reconnect_error', (error) => {
        setIsConnected(false);
      });

      setSocket(newSocket);

      return newSocket;
    };

    const socketInstance = connectSocket();

    return () => {
      socketInstance.close();
    };
  }, []);

  const joinWishlist = (wishlistId) => {
    if (socket && isConnected) {
      socket.emit('join-wishlist', wishlistId);
    } else {
      console.warn('Cannot join wishlist: Socket not connected');
    }
  };

  const leaveWishlist = (wishlistId) => {
    if (socket && isConnected) {
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