const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const { ensureAdmin } = require('../middleware/auth');

// View pending reviews
router.get('/reviews/pending', ensureAdmin, async (req, res) => {
    const reviews = await Review.find({ isApproved: false }).populate('book user');
    res.render('reviews/pending', { reviews });
});

// Approve review
router.post('/reviews/approve/:id', ensureAdmin, async (req, res) => {
    await Review.findByIdAndUpdate(req.params.id, { isApproved: true });
    res.redirect('/admin/reviews/pending');
});

// Reject review
router.post('/reviews/reject/:id', ensureAdmin, async (req, res) => {
    await Review.findByIdAndDelete(req.params.id);
    res.redirect('/admin/reviews/pending');
});
