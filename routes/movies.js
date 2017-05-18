const Movie = require('../models/movie');
const Actor = require('../models/actor');

// Helper to set content location & return movie object as response body
function sendMovie(res, movie) {
    res.setHeader('Content-Location', `/movies/${movie._id}`);
    res.json(movie);
}

function all(req, res, next) {
    Movie.find().populate('actors').exec()
        .then(movies => {
            res.json({movies});
        });
}

function create(req, res, next) {
    new Movie(req.body).save()
        .then(movie => sendMovie(res, movie))
        .catch(err => next(err));
}

function reset(req, res, next) {
    Movie.remove().exec()
        .then(() => res.status(204).end())
        .catch(err => next(err));
}

function show(req, res, next) {
    Movie.findById(req.params.id).populate('actors').exec()
        .then(movie => (movie) ? sendMovie(res, movie) : next())
        .catch(err => next(err));
}

function update(req, res, next) {
    Movie.findByIdAndUpdate(req.params.id, req.body, { new: true }).exec()
        .then(movie => (movie) ? sendMovie(res, movie) : next())
        .catch(err => next(err));
}

function remove(req, res, next) {
    Movie.findByIdAndRemove(req.params.id).exec()
        .then(movie => (movie) ? res.status(204).end() : next()) // Should send a status 410 Gone if id existed once
        .catch(err => next(err));
}

function vote(req, res, next) {
    Movie.findByIdAndUpdate(req.params.id, { $inc: { votes: 1 }}, { new: true }).exec()
        .then(movie => (movie) ? sendMovie(res, movie) : next())
        .catch(err => next(err));
}

function cast(req, res, next) {
    Movie.findById(req.params.id).populate('actors').exec()
        .then(movie => {
            res.json(movie.actors);
        }).catch(err => next(err));
}

function add_actor(req, res, next) {
    Movie.findById(req.params.id).exec()
        .then(movie => {
            req.body.forEach(actor => {
                new Actor(actor).save().then(actor => {
                    movie.actors.push(actor._id);
                    movie.save();
                }).catch(err => next(err));
            });
            return movie;
        })
        .then(movie => (movie) ? sendMovie(res, movie) : next())
        .catch(err => next(err));
}

module.exports = { all, create, reset, show, update, remove, vote, cast, add_actor };
