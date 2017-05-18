const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

const ActorSchema = new mongoose.Schema({
    name: { type: String, required: true }
});

module.exports = mongoose.model('Actor', ActorSchema);
