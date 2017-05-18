const Actor = require('../models/actor');

// Helper to set content location & return movie object as response body
function sendActor(res, actor) {
    res.setHeader('Content-Location', `/actors/${actor._id}`);
    res.json(actor);
}

function all(req, res, next) {
    Actor.find().exec()
        .then(actors => {
            res.json({actors});
        });
}

function create(req, res, next) {
    new Actor(req.body).save()
        .then(actor => sendActor(res, actor))
        .catch(err => next(err));
}

function reset(req, res, next) {
    Actor.remove().exec()
        .then(() => res.status(204).end())
        .catch(err => next(err));
}

function show(req, res, next) {
    Actor.findById(req.params.id).exec()
        .then(actor => (actor) ? sendActor(res, actor) : next())
        .catch(err => next(err));
}

function update(req, res, next) {
    Actor.findByIdAndUpdate(req.params.id, req.body, { new: true }).exec()
        .then(actor => (actor) ? sendActor(res, actor) : next())
        .catch(err => next(err));
}

function remove(req, res, next) {
    Actor.findByIdAndRemove(req.params.id).exec()
        .then(actor => (actor) ? res.status(204).end() : next()) // Should send a status 410 Gone if id existed once
        .catch(err => next(err));
}

module.exports = { all, create, reset, show, update, remove };
