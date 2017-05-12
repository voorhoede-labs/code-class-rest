const Movie = require('../models/movie');

// Helper to set content location & return movie object as response body
function sendMovie(res, movie) {
    res.setHeader('Content-Location', `/movies/${movie._id}`);
    res.json(movie);
}

function all(req, res, next) {
    Movie.find().exec()
        .then(movies => {
            res.json({movies});
        });
}

function create(req, res, next) {
    new Movie({
        title: req.body.title,
        director: req.body.director,
        summary: req.body.summary,
        votes: req.body.votes
    }).save()
        .then(movie => sendMovie(res, movie))
        .catch(err => next(err));
}

function reset(req, res, next) {
    Movie.remove().exec()
        .then(() => res.status(204).end())
        .catch(err => next(err));
}

function show(req, res, next) {
    Movie.findById(req.params.id).exec()
        .then(movie => (movie) ? sendMovie(res, movie) : next())
        .catch(err => next(err));
}

function update(req, res, next) {
    Movie.findById(req.params.id).exec()
        .then(movie => {
            movie.title = req.body.title || movie.title;
            movie.director = req.body.director || movie.director;
            movie.summary = req.body.summary || movie.summary;
            movie.votes = req.body.votes || movie.votes;
            return movie.save();
        })
        .then(movie => sendMovie(res, movie))
        .catch(err => next(err));
}

function remove(req, res, next) {
    Movie.findOneAndRemove(req.params.id).exec()
        .then(movie => (movie) ? res.status(204).end() : next()) // Should send a status 410 Gone if id existed once
        .catch(err => next(err));
}

function vote(req, res, next) {
    Movie.findById(req.params.id).exec()
        .then(movie => {
            movie.votes += 1;
            return movie.save();
        }).then(movie => sendMovie(res, movie))
        .catch(err => next(err));
}

module.exports = { all, create, reset, show, update, remove, vote };
