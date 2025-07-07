// API Configuration
import config from './config';

const API_BASE_URL = config.API_BASE_URL;

export const API_URLS = {
  // Auth endpoints
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  SIGNUP: `${API_BASE_URL}/api/auth/signup`,
  
  // Wishlist endpoints
  WISHLISTS: `${API_BASE_URL}/api/wishlists`,
  WISHLIST_BY_ID: (id) => `${API_BASE_URL}/api/wishlists/${id}`,
  WISHLIST_PRODUCTS: (id) => `${API_BASE_URL}/api/wishlists/${id}/products`,
  WISHLIST_PRODUCT: (wishlistId, productId) => `${API_BASE_URL}/api/wishlists/${wishlistId}/products/${productId}`,
  
  // Invite endpoints
  WISHLIST_INVITES: (id) => `${API_BASE_URL}/api/wishlists/${id}/invite`,
  ACCEPT_INVITE: (inviteId) => `${API_BASE_URL}/api/invites/${inviteId}/accept`,
  
  // Comments and reactions
  PRODUCT_COMMENTS: (wishlistId, productId) => `${API_BASE_URL}/api/wishlists/${wishlistId}/products/${productId}/comments`,
  PRODUCT_REACTIONS: (wishlistId, productId) => `${API_BASE_URL}/api/wishlists/${wishlistId}/products/${productId}/reactions`,
  
  // WebSocket
  WEBSOCKET_URL: config.WEBSOCKET_URL,
};

export default API_BASE_URL; 