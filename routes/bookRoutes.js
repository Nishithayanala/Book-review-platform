const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const Review = require('../models/Review');




// -------------------- Admin: Add Book --------------------
router.get('/add', (req, res) => {
    if (!req.user?.isAdmin) return res.status(403).send('Access denied');
    res.render('books/addBook', { user: req.user });
});

router.post('/add', async (req, res) => {
    if (!req.user?.isAdmin) return res.status(403).send('Access denied');
    const { title, author, genre, description } = req.body;
    try {
        const book = new Book({ title, author, genre, description });
        await book.save();
        res.redirect('/books');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// -------------------- List Books + Search --------------------
router.get('/', async (req, res) => {
    const { query } = req.query;
    let searchQuery = {};

    if (query) {
        searchQuery = {
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { author: { $regex: query, $options: 'i' } },
                { genre: { $regex: query, $options: 'i' } }
            ]
        };
    }

    try {
        const books = await Book.find(searchQuery);
        res.render('books/list', { books, user: req.user, search: { query: query || '' } });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Admin Manage Books Page
router.get('/manage', async (req, res) => {
    if (!req.user?.isAdmin) return res.status(403).send('Access denied');
    try {
        const books = await Book.find();
        res.render('books/manageBooks', { books, user: req.user });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});


// -------------------- Book Details + Reviews --------------------
router.get('/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id)
            .populate({
                path: 'reviews',
                match: { approved: true },
                populate: { path: 'user', select: 'username' }
            });

        res.render('books/bookDetails', { book, user: req.user });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// -------------------- Submit a Review (Logged-in users only) --------------------
router.post('/:id/review', async (req, res) => {
    if (!req.user) return res.redirect('/auth/login'); // redirect if not logged in

    const { rating, comment } = req.body;
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).send('Book not found');

        const review = new Review({
            user: req.user._id, // must be logged-in user
            rating,
            comment,
            book: book._id
        });

        await review.save();
        book.reviews.push(review);
        await book.save();

        res.redirect(`/books/${book._id}`);
    } catch (err) {
        console.error('Error submitting review:', err);
        res.status(500).send('Server Error');
    }
});

// -------------------- Admin: Pending Reviews --------------------
router.get('/admin/reviews/pending', async (req, res) => {
    if (!req.user?.isAdmin) return res.status(403).send('Access denied');

    try {
        const reviews = await Review.find({ approved: false })
            .populate('book')
            .populate('user', 'username');

        res.render('books/pendingReviews', { reviews, user: req.user });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// -------------------- Admin: Approve Review --------------------
router.post('/admin/reviews/:id/approve', async (req, res) => {
    if (!req.user?.isAdmin) return res.status(403).send('Access denied');

    try {
        await Review.findByIdAndUpdate(req.params.id, { approved: true });
        res.redirect('/books/admin/reviews/pending');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});




// Delete Review
router.post('/admin/reviews/:id/delete', async (req, res) => {
    if (!req.user?.isAdmin) return res.status(403).send('Access denied');
    try {
        const review = await Review.findById(req.params.id);
        await Review.findByIdAndDelete(req.params.id);
        await Book.findByIdAndUpdate(review.book, { $pull: { reviews: review._id } });
        res.redirect('/books/admin/reviews/pending');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});


// -------------------- Admin: Delete Book --------------------
router.post('/:id/delete', async (req, res) => {
    if (!req.user?.isAdmin) return res.status(403).send('Access denied');

    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).send('Book not found');

        await Book.findByIdAndDelete(req.params.id);
        res.redirect('/books/manage');
    } catch (err) {
        console.error('Delete Error:', err);
        res.status(500).send('Server Error');
    }
});




module.exports = router;
