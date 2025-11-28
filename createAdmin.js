const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User'); // path to your User model

mongoose.connect('mongodb://127.0.0.1:27017/bookReviewDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function createAdmin() {
    const hashedPassword = await bcrypt.hash('admin123', 10); // choose a password
    const admin = new User({
        username: 'admin',
        password: hashedPassword,
        isAdmin: true
    });
    await admin.save();
    console.log('Admin user created!');
    mongoose.disconnect();
}

createAdmin();
