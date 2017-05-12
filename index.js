const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const mongoSanitize = require('express-mongo-sanitize');
const Promise = require('bluebird');
const actions = require('./routes/actions');

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

// Helper to send a Method Not Allowed header along with an Allow header
// designating which methods consumer should use
function sendAllowed(methods) {
    return (req, res, next) => {
        res.setHeader('Allow', methods);
        res.sendStatus(405);
    }
}

// Collection
app.route('/movies')
    .get(actions.list)
    .post(actions.make)
    .delete(actions.empty)
    .all(sendAllowed('GET, POST, DELETE'));

// Item
app.route('/movies/:id')
    .get(actions.one)
    .put(actions.update)
    .all(sendAllowed('GET, PUT'));

// Action
app.route('/movies/:id/vote')
    .patch(actions.vote)
    .all(sendAllowed('PATCH'));

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
