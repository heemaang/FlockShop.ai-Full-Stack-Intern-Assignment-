const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

const ReactionSchema = new mongoose.Schema({
  emoji: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  imageUrl: { type: String },
  price: { type: Number, default: 0 },
  category: { type: String, default: 'General' },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  editedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  comments: [CommentSchema],
  reactions: [ReactionSchema]
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema); 