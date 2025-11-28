const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET register form
router.get('/register', (req, res) => {
  res.render('register');
});

// POST register
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return res.render('register', { error: 'Email or username already taken.' });
    }
    const user = new User({ username, email, password });
    await user.save();
    // log user in
    req.session.userId = user._id;
    req.session.isAdmin = user.isAdmin;
    res.redirect('/books');
  } catch (err) {
    console.error(err);
    res.render('register', { error: 'Server error. Try again.' });
  }
});

// GET login form
router.get('/login', (req, res) => {
  res.render('login');
});

// POST login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.render('login', { error: 'Invalid credentials.' });

    const ok = await user.comparePassword(password);
    if (!ok) return res.render('login', { error: 'Invalid credentials.' });

    req.session.userId = user._id;
    req.session.isAdmin = user.isAdmin;
    res.redirect('/books');
  } catch (err) {
    console.error(err);
    res.render('login', { error: 'Server error. Try again.' });
  }
});

// GET logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;
