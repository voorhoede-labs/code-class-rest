const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema({
    title: String,
    director: String,
    summary: String,
    votes: { type: Number, default: 0 }
});

module.exports = mongoose.model('Movie', MovieSchema);
