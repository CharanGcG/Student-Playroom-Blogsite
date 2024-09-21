const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const blogSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  writer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  image: { type: String },
  category: { type: String, required: true }, 
  likes: { type: Number, default: 0 }, // Add likes
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Track users who liked the blog
  comments: [{ // Add comments
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

const Blog = mongoose.model('Blog', blogSchema);
module.exports = Blog;
