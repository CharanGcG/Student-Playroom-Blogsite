const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Your user model

const Blog = require('../models/Blog');
const multer = require('multer');
const path = require('path');

// Render registration page
router.get('/register', (req, res) => {
  res.render('register', { error: null });
});

// Handle registration
router.post('/register', async (req, res) => {
  const { name, username, password, email } = req.body;

  try {
    const user = new User({ name, username, password, email });
    await user.save();
    req.session.userId = user._id; // Save user ID in session
    res.redirect('/auth/homepage'); // Redirect to homepage
  } catch (error) {
    console.error('Registration error:', error);
    res.render('register', { error: 'Registration failed. Please try again.' });
  }
});

// Render login page
router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

// Handle login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user || !(await user.isPasswordValid(password))) {
      return res.render('login', { error: 'Invalid username or password.' });
    }
    req.session.userId = user._id; // Save user ID in session
    res.redirect('/auth/homepage'); // Redirect to homepage
  } catch (error) {
    console.error('Login error:', error);
    res.render('login', { error: 'Login failed. Please try again.' });
  }
});




// Logout route
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return console.error('Logout error:', err);
    }
    res.redirect('/'); // Redirect to home after logout
  });
});


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'public/images'); // Upload to public/images
  },
  filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to filename
  }
});
const upload = multer({ storage });

router.get('/writeblog', async (req, res) => {
  if (!req.session.userId) {
      return res.redirect('/auth/login');
  }
  const user = await User.findById(req.session.userId); // Fetch the user
  res.render('writeblog', { user }); // Pass the user to the template
});



router.post('/writeblog', upload.single('image'), async (req, res) => {
  const { title, content } = req.body;
  const writer = req.session.userId;
  const image = req.file ? `/images/${req.file.filename}` : null; // Use uploaded image or default

  try {
      const blog = new Blog({ title, content, writer, image });
      await blog.save();
      res.redirect('/auth/homepage?success=Blog created successfully');
  } catch (error) {
      console.error('Blog creation error:', error);
      res.redirect('/writeblog?error=Error creating blog');
  }
});

router.get('/homepage', async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/auth/login'); // Redirect if not logged in
  }
  const user = await User.findById(req.session.userId); // Fetch the logged-in user
  
  // Populate the 'writer' field with the 'username' of the user
  const blogs = await Blog.find().populate('writer', 'username');

  res.render('homepage', { user, blogs }); // Pass user and blogs to the view
});





// Profile route
router.get('/profile', async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/auth/login'); // Redirect to login if not authenticated
  }

  try {
    // Fetch the user's details
    const user = await User.findById(req.session.userId);
    
    // Fetch the blogs written by this user
    const userBlogs = await Blog.find({ writer: req.session.userId });

    // Render the profile page, passing the user and their blogs
    res.render('profile', { user, userBlogs });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.redirect('/auth/homepage'); // Redirect to homepage in case of error
  }
});




router.get('/blog/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate('writer');
    if (!blog) {
      return res.status(404).send('Blog not found');
    }
    const user = await User.findById(req.session.userId); // Get the logged-in user
    res.render('blogDetails', { blog, user }); // Pass both blog and user
  } catch (err) {
    console.error('Error fetching blog:', err);
    res.status(500).send('Server error');
  }
});



module.exports = router;
