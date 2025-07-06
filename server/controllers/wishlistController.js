const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const User = require('../models/User');

exports.createWishlist = async (req, res) => {
  try {
    const { name } = req.body;
    const wishlist = new Wishlist({ name, owner: req.user.userId, members: [req.user.userId], products: [] });
    await wishlist.save();
    res.status(201).json(wishlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getWishlists = async (req, res) => {
  try {
    const wishlists = await Wishlist.find({ members: req.user.userId })
      .populate('owner', 'username email')
      .populate('members', 'username email')
      .populate({ 
        path: 'products', 
        populate: [
          { path: 'addedBy editedBy', select: 'username email' },
          { path: 'comments.user', select: 'username email' },
          { path: 'reactions.user', select: 'username email' }
        ]
      });
    res.json(wishlists);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findById(req.params.id)
      .populate('owner', 'username email')
      .populate('members', 'username email')
      .populate({ 
        path: 'products', 
        populate: [
          { path: 'addedBy editedBy', select: 'username email' },
          { path: 'comments.user', select: 'username email' },
          { path: 'reactions.user', select: 'username email' }
        ]
      });
    if (!wishlist) return res.status(404).json({ message: 'Wishlist not found' });
    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateWishlist = async (req, res) => {
  try {
    const { name, members } = req.body;
    const wishlist = await Wishlist.findByIdAndUpdate(req.params.id, { name, members }, { new: true });
    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteWishlist = async (req, res) => {
  try {
    await Wishlist.findByIdAndDelete(req.params.id);
    res.json({ message: 'Wishlist deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Product CRUD
exports.addProduct = async (req, res) => {
  try {
    const { name, imageUrl, price } = req.body;
    const product = new Product({ name, imageUrl, price, addedBy: req.user.userId });
    await product.save();
    const wishlist = await Wishlist.findById(req.params.id);
    wishlist.products.push(product._id);
    await wishlist.save();
    
    // Populate the new product
    const populatedProduct = await Product.findById(product._id)
      .populate('addedBy editedBy', 'username email')
      .populate('comments.user', 'username email')
      .populate('reactions.user', 'username email');
    
    // Emit real-time update
    const io = req.app.get('io');
    io.to(`wishlist-${req.params.id}`).emit('product-added', {
      wishlistId: req.params.id,
      product: populatedProduct
    });
    
    res.status(201).json(populatedProduct);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { name, imageUrl, price } = req.body;
    const product = await Product.findByIdAndUpdate(req.params.productId, { name, imageUrl, price, editedBy: req.user.userId }, { new: true })
      .populate('addedBy editedBy', 'username email')
      .populate('comments.user', 'username email')
      .populate('reactions.user', 'username email');
    
    // Emit real-time update
    const io = req.app.get('io');
    io.to(`wishlist-${req.params.id}`).emit('product-updated', {
      wishlistId: req.params.id,
      product
    });
    
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.productId);
    const wishlist = await Wishlist.findById(req.params.id);
    wishlist.products = wishlist.products.filter(pid => pid.toString() !== req.params.productId);
    await wishlist.save();
    
    // Emit real-time update
    const io = req.app.get('io');
    io.to(`wishlist-${req.params.id}`).emit('product-deleted', {
      wishlistId: req.params.id,
      productId: req.params.productId
    });
    
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Invite functionality
exports.inviteToWishlist = async (req, res) => {
  try {
    const { email } = req.body;
    const wishlistId = req.params.id;
    
    // Find the wishlist
    const wishlist = await Wishlist.findById(wishlistId);
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }
    
    // Check if user is owner or member
    if (wishlist.owner.toString() !== req.user.userId && 
        !wishlist.members.includes(req.user.userId)) {
      return res.status(403).json({ message: 'Not authorized to invite to this wishlist' });
    }
    
    // Find user by email
    const userToInvite = await User.findOne({ email });
    if (!userToInvite) {
      return res.status(404).json({ message: 'User not found with this email' });
    }
    
    // Check if user is already a member
    if (wishlist.members.includes(userToInvite._id)) {
      return res.status(400).json({ message: 'User is already a member of this wishlist' });
    }
    
    // Add user to members
    wishlist.members.push(userToInvite._id);
    await wishlist.save();
    
    // Return updated wishlist with populated members
    const updatedWishlist = await Wishlist.findById(wishlistId)
      .populate('owner', 'username email')
      .populate('members', 'username email')
      .populate({ path: 'products', populate: { path: 'addedBy editedBy', select: 'username email' } });
    
    // Emit real-time update
    const io = req.app.get('io');
    io.to(`wishlist-${wishlistId}`).emit('member-invited', {
      wishlistId,
      wishlist: updatedWishlist,
      invitedUser: userToInvite
    });
    
    res.json({ 
      message: `Successfully invited ${userToInvite.username} to the wishlist`,
      wishlist: updatedWishlist 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    const wishlistId = req.params.id;
    
    // Find the wishlist
    const wishlist = await Wishlist.findById(wishlistId);
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }
    
    // Check if user is owner
    if (wishlist.owner.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only the owner can remove members' });
    }
    
    // Remove member
    wishlist.members = wishlist.members.filter(member => member.toString() !== memberId);
    await wishlist.save();
    
    // Return updated wishlist
    const updatedWishlist = await Wishlist.findById(wishlistId)
      .populate('owner', 'username email')
      .populate('members', 'username email')
      .populate({ path: 'products', populate: { path: 'addedBy editedBy', select: 'username email' } });
    
    res.json({ 
      message: 'Member removed successfully',
      wishlist: updatedWishlist 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Comment functionality
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const { id: wishlistId, productId } = req.params;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Add comment
    product.comments.push({
      text,
      user: req.user.userId
    });
    await product.save();
    
    // Populate the new comment
    const updatedProduct = await Product.findById(productId)
      .populate('addedBy editedBy', 'username email')
      .populate('comments.user', 'username email')
      .populate('reactions.user', 'username email');
    
    // Emit real-time update
    const io = req.app.get('io');
    io.to(`wishlist-${wishlistId}`).emit('comment-added', {
      wishlistId,
      product: updatedProduct
    });
    
    res.json(updatedProduct);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addReaction = async (req, res) => {
  try {
    const { emoji } = req.body;
    const { id: wishlistId, productId } = req.params;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if user already reacted with this emoji
    const existingReaction = product.reactions.find(
      reaction => reaction.user.toString() === req.user.userId && reaction.emoji === emoji
    );
    
    if (existingReaction) {
      // Remove existing reaction
      product.reactions = product.reactions.filter(
        reaction => !(reaction.user.toString() === req.user.userId && reaction.emoji === emoji)
      );
    } else {
      // Add new reaction
      product.reactions.push({
        emoji,
        user: req.user.userId
      });
    }
    
    await product.save();
    
    // Populate the updated product
    const updatedProduct = await Product.findById(productId)
      .populate('addedBy editedBy', 'username email')
      .populate('comments.user', 'username email')
      .populate('reactions.user', 'username email');
    
    // Emit real-time update
    const io = req.app.get('io');
    io.to(`wishlist-${wishlistId}`).emit('reaction-added', {
      wishlistId,
      product: updatedProduct
    });
    
    res.json(updatedProduct);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 