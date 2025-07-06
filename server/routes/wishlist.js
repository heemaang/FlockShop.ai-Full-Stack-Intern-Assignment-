const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const wishlistController = require('../controllers/wishlistController');

// Wishlist CRUD
router.post('/', auth, wishlistController.createWishlist);
router.get('/', auth, wishlistController.getWishlists);
router.get('/:id', auth, wishlistController.getWishlist);
router.put('/:id', auth, wishlistController.updateWishlist);
router.delete('/:id', auth, wishlistController.deleteWishlist);

// Product CRUD within a wishlist
router.post('/:id/products', auth, wishlistController.addProduct);
router.put('/:id/products/:productId', auth, wishlistController.updateProduct);
router.delete('/:id/products/:productId', auth, wishlistController.deleteProduct);

// Invite functionality
router.post('/:id/invite', auth, wishlistController.inviteToWishlist);
router.delete('/:id/members/:memberId', auth, wishlistController.removeMember);

// Comments and Reactions
router.post('/:id/products/:productId/comments', auth, wishlistController.addComment);
router.post('/:id/products/:productId/reactions', auth, wishlistController.addReaction);

module.exports = router; 