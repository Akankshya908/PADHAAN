const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    password: String
});

module.exports = mongoose.model('Admin', adminSchema);