// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const path = require('path');
const app = express();
const port = 5000;


// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/motorguard')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  industryName: { type: String, required: true },
  industryType: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Signup Route
app.post('/api/signup', async (req, res) => {
  try {
    const { username, password, industryName, industryType, email } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      username,
      password: hashedPassword,
      industryName,
      industryType,
      email
    });

    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Error creating user' });
  }
});

// Signin Route
app.post('/api/signin', async (req, res) => {
  try {
    console.log('Signin request received:', req.body);
    const { username, password } = req.body;

    // Find user
    const user = await User.findOne({ username });
    console.log('User found:', user ? 'Yes' : 'No');

    if (!user) {
      console.log('User not found');
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('Invalid password');
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Return user data (excluding password)
    const userData = {
      username: user.username,
      industryName: user.industryName,
      industryType: user.industryType,
      email: user.email
    };

    console.log('Signin successful for user:', userData.username);
    res.json({ user: userData });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Error during signin' });
  }
});

// Handle all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log('Press Ctrl+C to stop the server');
});
