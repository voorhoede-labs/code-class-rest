const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const mongoSanitize = require('express-mongo-sanitize');
const Promise = require('bluebird');

// Get environment variables from .env file
require('dotenv').config();

// Let Mongoose use Bluebird
// http://mongoosejs.com/docs/promises.html
mongoose.Promise = Promise;

// Connect to the database
mongoose.connect(`mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);

// Instantiate Movie model
const Movie = require('./models/movie');

// Set up Express app
const app = express();

// Thanks, Express
app.use((req, res, next) => { res.removeHeader('X-Powered-By'); next(); });

// Express plugin to parse JSON request body
app.use(bodyParser.json());

// Sanitize strings to prevent MongoDB Operator Injection
// http://blog.websecurify.com/2014/08/hacking-nodejs-and-mongodb.html
app.use(mongoSanitize());

// Helper to set content location & return movie object as response body
function sendMovie(res, movie) {
    res.setHeader('Content-Location', `/movies/${movie._id}`);
    res.json(movie);
}

// Collection
app.route('/movies')
    // Get list of movies
    .get((req, res, next) => {
        Movie.find().exec()
            .then(movies => {
                res.json({movies});
            });
    })
    // Create movie
    .post((req, res, next) => {
        const movie = new Movie({
            title: req.body.title,
            director: req.body.director,
            summary: req.body.summary,
            votes: req.body.votes
        }).save()
            .then(movie => sendMovie(res, movie))
            .catch(err => next(err));
    })
    // Delete all movies
    .delete((req, res, next) => {
        Movie.remove().exec()
            .then(() => {
                res.status(204).end();
            }).catch(err => next(err));
    })
    // Send proper 405 Method Not Allowed
    .all((req, res, next) => {
        res.setHeader('Allow', 'GET, POST, DELETE');
        res.sendStatus(405);
    });

// Item
app.route('/movies/:id')
    // Get movie
    .get((req, res, next) => {
        Movie.findById(req.params.id).exec()
            .then(movie => sendMovie(res, movie))
            .catch(err => next(err))
    })
    // Update movie
    .put((req, res, next) => {
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
    })
    // Send proper 405 Method Not Allowed
    .all((req, res, next) => {
        res.setHeader('Allow', 'GET, PUT');
        res.sendStatus(405);
});

// Action
app.route('/movies/:id/vote')
    // Vote for a movie
    .patch((req, res, next) => {
        Movie.findById(req.params.id).exec()
            .then(movie => {
                movie.votes += 1;
                return movie.save();
            }).then(movie => sendMovie(res, movie))
            .catch(err => next(err));
    })
    // Send proper 405 Method Not Allowed
    .all((req, res, next) => {
        res.setHeader('Allow', 'PATCH');
        res.sendStatus(405);
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err);
    switch(err.name) {
        case "ValidationError":
            res.status('400').json({ statusCode: 400, message: err.errors.title.message });
            break;
        default:
            res.status('500').json({ statusCode: 500, message: 'Unknown error', error: err });
    }
});

// Not found
app.use((req, res, next) => res.sendStatus(404));

// Run server
const port = process.env.PORT || 1338;
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
