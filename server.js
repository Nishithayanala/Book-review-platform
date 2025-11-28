const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const path = require('path');
const { ensureLoggedIn } = require('./middleware/auth');

const MongoStore = require('connect-mongo')

const app = express();

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/bookReviewDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error(err));

// Middleware
app.use(express.urlencoded({ extended: true }))
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
;

app.use(session({
    secret: 'yourSecretKey',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: 'mongodb://127.0.0.1:27017/bookReviewDB', // your DB
        collectionName: 'sessions'                          // where sessions will be stored
    }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));


// Clear sessions silently on restart
mongoose.connection.once('open', async () => {
    try {
        await mongoose.connection.db.collection('sessions').deleteMany({});
    } catch (err) {}
});


app.use((req, res, next) => {
    // If a user is logged in via session, use that
    if (req.session.user) {
        req.user = req.session.user;
    } else {
        // Otherwise, fallback to simulated admin for testing
        req.user = { username: 'admin', isAdmin: true };
    }

    // Make user available in all EJS templates
    res.locals.user = req.user;
    next();
});
// Routes
app.use('/auth', require('./routes/authRoutes'));
app.use('/books', ensureLoggedIn, require('./routes/bookRoutes'));

// Root URL logic
app.get('/', (req, res) => {
    if (req.session.user) {
        // Logged-in users -> home page or books page
        res.redirect('/books');
    } else {
        // Guests -> login/register choice
        res.redirect('/auth/login');
    }
});

// Start server
app.listen(3000, '0.0.0.0', () => {
    console.log("Server running on port 3000");
});
