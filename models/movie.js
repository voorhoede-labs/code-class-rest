const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

const MovieSchema = new mongoose.Schema({
    title: { type: String, required: true },
    director: { type: String, default: '' },
    summary: { type: String, default: '' },
    votes: { type: Number, default: 0 },
    actors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Actor'
    }]
});

module.exports = mongoose.model('Movie', MovieSchema);
