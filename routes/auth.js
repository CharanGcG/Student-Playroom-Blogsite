//Essential imports
const express = require('express');
const router = express.Router();


//Model imports
const User = require('../models/User');
const Blog = require('../models/Blog');


//Module imports
const multer = require('multer');
const path = require('path');







//Registration requests
router.get('/register', (req, res) => {
  res.render('register', { error: null });
});


router.post('/register', async (req, res) => {
  const { name, username, password, email } = req.body;
  try {
    const user = new User({ name, username, password, email });
    await user.save();
    req.session.userId = user._id; // Save user ID in session
    res.redirect('/auth/homepage'); // Redirect to homepage
  } 
  catch (error) {
    // Handle validation errors customized error validation messages
    if (error.name === 'ValidationError') {
      const errorMessage = Object.values(error.errors).map(err => err.message).join(', ');
      res.render('register', { error: `Validation failed: ${errorMessage}` });
    } 
    // Handle duplicate key errors
    else if (error.code === 11000) { // MongoDB duplicate key error code
      const field = Object.keys(error.keyValue)[0]; // Get the field causing the error
      res.render('register', { error: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.` });
    } else {
      res.render('register', { error: 'Registration failed. Please try again.' });
    }
  }
});
//End of Registration requests








//Login Requests
router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.render('login', { error: 'Invalid username' });
    }
    if(user && !(await user.isPasswordValid(password))){
      return res.render('login', { error: 'Incorrect Password'})
    }
    req.session.userId = user._id; // Save user ID in session
    res.redirect('/auth/homepage'); // Redirect to homepage
  } catch (error) {
    console.error('Login error:', error);
    res.render('login', { error: 'Login failed. Please try again.' });
  }
});


router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return console.error('Logout error:', err);
    }
    res.redirect('/'); // Redirect to home after logout
  });
});
//End of Login requests









//File uploads multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'public/images'); // Upload to public/images
  },
  filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to filename
  }
});
const upload = multer({ storage });
//End of multer file upload









//Write Blog requests
router.get('/writeblog', async (req, res) => {
  if (!req.session.userId) {
      return res.redirect('/auth/login');
  }
  const user = await User.findById(req.session.userId); // Fetch the user
  res.render('writeblog', { user }); // Pass the user to the template
});


router.post('/writeblog', upload.single('image'), async (req, res) => {
  const { title, content, category } = req.body;
  const writer = req.session.userId;
  const image = req.file ? `/images/${req.file.filename}` : null; // Use uploaded image or default

  try {
      const blog = new Blog({ title, content, writer, image, category });
      await blog.save();
      res.redirect('/auth/homepage?success=Blog created successfully');
  } catch (error) {
      console.error('Blog creation error:', error);
      res.redirect('/writeblog?error=Error creating blog');
  }
});
//End of Write blog requests







//Homepage requests
router.get('/homepage', async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/auth/login'); // Redirect if not logged in
  }
  const user = await User.findById(req.session.userId); // Fetch the logged-in user
  
  // Populate the 'writer' field with the 'username' of the user
  const blogs = await Blog.find().populate('writer', 'username');

  res.render('homepage', { user, blogs }); // Pass user and blogs to the view
});
//End of Homepage requests







// Profile requests
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
//End of profile requests







//Individual Blog requests
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
//End of individual blog requests











//General blogs requests
router.get('/general', async (req, res)=>{
  if(!req.session.userId){
    return res.redirect('auth/login');
  }
  const user = await User.findById(req.session.userId);
  const blogs = await Blog.find({category: 'general'}).populate('writer','username');
  res.render('general', {user, blogs});
})
//End of general blogs requests







//studies blogs requests
router.get('/studies', async (req, res)=>{
  if(!req.session.userId){
    return res.redirect('auth/login');
  }
  const user = await User.findById(req.session.userId);
  const blogs = await Blog.find({category: 'studies'}).populate('writer','username');
  res.render('studies', {user, blogs});
})
//End of studies blogs requests






//Sports blogs requests
router.get('/sports', async (req, res)=>{
  if(!req.session.userId){
    return res.redirect('auth/login');
  }
  const user = await User.findById(req.session.userId);
  const blogs = await Blog.find({category: 'sports'}).populate('writer','username');
  res.render('sports', {user, blogs});
})
//End of sports blogs requests







//Memenots blogs requests
router.get('/mementos', async (req, res)=>{
  if(!req.session.userId){
    return res.redirect('auth/login');
  }
  const user = await User.findById(req.session.userId);
  const blogs = await Blog.find({category: 'mementos'}).populate('writer','username');
  res.render('mementos', {user, blogs});
})
//End of Mementos blogs requests

//export the router
module.exports = router;
