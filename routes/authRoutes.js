const express = require('express');
const router = express.Router();
const User = require('../models/User');

// --- REGISTER ---
router.get('/register', (req, res) => {
    res.render('auth/register', { error: null });
});

router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        if (!username || !email || !password) {
            return res.render('auth/register', { error: 'All fields are required.' });
        }

        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.render('auth/register', { error: 'Username or email already exists.' });
        }

        const user = new User({ username, email, password });
        await user.save();

        // Save session
        req.session.user = { _id: user._id, username: user.username, isAdmin: user.isAdmin };
        res.redirect('/books');
    } catch (err) {
        console.error('Registration Error:', err);
        res.render('auth/register', { error: 'Server error. Try again.' });
    }
});

// --- LOGIN ---
router.get('/login', (req, res) => {
    res.render('auth/login', { error: null });
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ $or: [{ username }, { email: username }] });
        if (!user) return res.render('auth/login', { error: 'Invalid username or password.' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.render('auth/login', { error: 'Invalid username or password.' });

        // Save session
        req.session.user = { _id: user._id, username: user.username, isAdmin: user.isAdmin };
        res.redirect('/books');
    } catch (err) {
        console.error('Login Error:', err);
        res.render('auth/login', { error: 'Server error. Try again.' });
    }
});

// --- LOGOUT ---
router.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/auth/login'));
});

module.exports = router;
