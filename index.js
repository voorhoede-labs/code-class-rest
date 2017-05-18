const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const mongoSanitize = require('express-mongo-sanitize');
const Promise = require('bluebird');
const movies = require('./routes/movies');
const actors = require('./routes/actors');

// Get environment variables from .env file
require('dotenv').config();

// Let Mongoose use Bluebird
// http://mongoosejs.com/docs/promises.html
mongoose.Promise = Promise;

// Connect to the database
mongoose.connect(`mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);

// Instantiate models
const Movie = require('./models/movie');
const Actor = require('./models/actor');

// Set up Express app
const app = express();

// Thanks, Express
app.use((req, res, next) => { res.removeHeader('X-Powered-By'); next(); });

// Express plugin to parse JSON request body
app.use(bodyParser.json());

// Sanitize strings to prevent MongoDB Operator Injection
// http://blog.websecurify.com/2014/08/hacking-nodejs-and-mongodb.html
app.use(mongoSanitize());

// Helper to send a Method Not Allowed header along with an Allow header
// designating which methods consumer should use
//
// @param methods String uppercase, comma + space separa
function sendAllowed(methods) {
    return (req, res, next) => {
        if (methods.includes(req.method.toLowerCase())) {
            next();
        } else {
            res.setHeader('Allow', methods.join(', ').toUpperCase());
            res.sendStatus(405);
        }
    }
}

// Movies
// Collection
app.route('/movies')
    .get(movies.all)
    .post(movies.create)
    .delete(movies.reset)
    .all(sendAllowed(['get','post','delete']));

// Item
app.route('/movies/:id')
    .get(movies.show)
    .put(movies.update)
    .delete(movies.remove)
    .all(sendAllowed(['get', 'put', 'delete']));

// Action
app.route('/movies/:id/vote')
    .patch(movies.vote)
    .all(sendAllowed(['patch']));

// Actors
// Collection
app.route('/actors')
    .get(actors.all)
    .post(actors.create)
    .delete(actors.reset)
    .all(sendAllowed(['get','post','delete']));

// Item
app.route('/actors/:id')
    .get(actors.show)
    .put(actors.update)
    .delete(actors.remove)
    .all(sendAllowed(['get', 'put', 'delete']));

// Actor for Movie
app.route('/movies/:id/actors')
    .get(movies.cast)
    .post(movies.add_actor);

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
