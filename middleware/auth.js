const express = require('express');
const router = express.Router();
const User = require('../models/User');


// middleware/auth.js

function ensureLoggedIn(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/auth/login'); // redirect guests to login
    }
    next();
}

function ensureAdmin(req, res, next) {
    if (!req.session.user?.isAdmin) {
        return res.status(403).send('Access denied');
    }
    next();
}

module.exports = { ensureLoggedIn, ensureAdmin };


// Registration Page
router.get('/register', (req, res) => {
    res.render('auth/register');
});

// Register User
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).send('User already exists');

        const user = new User({ username, email, password });
        await user.save();
        res.redirect('/login');
    } catch (err) {
        console.error('Registration Error:', err);
        res.status(500).send('Server Error');
    }
});



// Login Page
router.get('/login', (req, res) => {
    res.render('auth/login');
});

// Login User
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).send('Invalid credentials');

        const isMatch = await user.matchPassword(password);
        if (!isMatch) return res.status(400).send('Invalid credentials');

        // Store user in session
        req.session.user = user;
        res.redirect('/books');
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).send('Server Error');
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) console.error(err);
        res.redirect('/login');
    });
});



