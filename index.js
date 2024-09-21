const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const authRoutes = require('./routes/auth');
const path = require('path');

// Initialize express app
const app = express();

// Set view engine to ejs
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));

// Middleware to parse incoming requests
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session({
  secret: 'BlogSecretKey4!', // Use a strong, secret key for signing session cookies
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: 'mongodb+srv://charangcg4:jMccKjrBFgTTf8LC@student-blog-cluster.dpzzp.mongodb.net/student_blog?retryWrites=true&w=majority',
    collectionName: 'sessions',
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // Session expiration: 1 day
  }
}));

// Static files
app.use(express.static('public'));

// Use the authentication routes
app.use('/auth', authRoutes);

// Simple route for homepage
app.get('/', (req, res) => {
  res.render('index', { user: req.session.user });
});

// MongoDB connection
mongoose.connect('mongodb+srv://charangcg4:jMccKjrBFgTTf8LC@student-blog-cluster.dpzzp.mongodb.net/student_blog?retryWrites=true&w=majority')
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(3000, () => console.log('Server running on port 3000'));
  })
  .catch(err => console.error('Database connection error:', err));
