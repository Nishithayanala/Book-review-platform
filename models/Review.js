const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // allow guest
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    approved: { type: Boolean, default: false },
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true }
});

module.exports = mongoose.model('Review', reviewSchema);
