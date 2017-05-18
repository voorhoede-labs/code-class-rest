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
//
// @param methods String uppercase, comma + space separa
function sendAllowed(methods) {
    return (req, res, next) => {
        if (methods.includes(req.method.toLowerCase())) {
            next();
        } else {
            res.setHeader('Allow', methods.join(', ').toUpperCase());
            res.sendStatus(/* STATUSCODE */);
        }
    }
}

/**

- Create routes for "all, create, reset, show, update, remove & vote" endpoints (see /routes/actions.js)
- Use the right HTTP verbs
- Send an Allow header for the verbs that are supported (see 'sendAllowed' function above)
- Find all STATUSCODE bits and put the right status codes in there (https://en.wikipedia.org/wiki/List_of_HTTP_status_codes)
- Use '.all' on a route as the last handler to catch all other methods that aren't impelemented

Code template:

app.route('/some-route-goes-here')
    .someVerbGoesHere(actions.someFunction)
    .propablyAnotherVerbGoesHere(actions.someOtherFunction)
    .et
    .cetera
    .all(sendAllowed(someArrayOfHTTPVerbs));

*/

// Error handling
app.use((err, req, res, next) => {
    console.error(err);
    switch(err.name) {
        case "ValidationError":
            res.status(/* STATUSCODE */).json({ statusCode: /* STATUSCODE */, message: err.errors.title.message });
            break;
        default:
            res.status(/* STATUSCODE */).json({ statusCode: /* STATUSCODE */, message: 'Unknown error', error: err });
    }
});

// Not found
app.use((req, res, next) => res.sendStatus(/* STATUSCODE */));

// Run server
const port = process.env.PORT || 1338;
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
