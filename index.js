const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const mongoSanitize = require('express-mongo-sanitize');
const Promise = require('bluebird');

const app = express();
const port = process.env.PORT || 1338;

// Instantiate Movie model
const Movie = require('./models/movie');

// Get environment variables from .env file
require('dotenv').config();

// Let Mongoose use Bluebird
// http://mongoosejs.com/docs/promises.html
mongoose.Promise = Promise;

// Connect to the database
mongoose.connect(`mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);

// Express plugin to parse JSON request body
app.use(bodyParser.json());

// Sanitize strings to prevent MongoDB Operator Injection
// http://blog.websecurify.com/2014/08/hacking-nodejs-and-mongodb.html
app.use(mongoSanitize());

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
