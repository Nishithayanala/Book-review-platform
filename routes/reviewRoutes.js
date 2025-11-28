const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Book = require('../models/Book');
const { ensureAuth } = require('../middleware/auth');

// Add review
router.post('/add/:bookId', ensureAuth, async (req, res) => {
    const { rating, comment } = req.body;
    const review = await Review.create({
        book: req.params.bookId,
        user: req.session.user._id,
        rating,
        comment
    });
    await Book.findByIdAndUpdate(req.params.bookId, { $push: { reviews: review._id } });
    res.redirect(`/books/${req.params.bookId}`);
});

module.exports = router;
