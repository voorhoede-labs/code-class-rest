const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema({
    title: String,
    director: String,
    summary: String,
    votes: number
});

module.exports = mongoose.model('Movie', MovieSchema);
