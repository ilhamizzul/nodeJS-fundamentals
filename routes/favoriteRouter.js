const express = require('express')
const bodyParser = require('body-parser')
const authenticate = require('../authenticate')
const cors = require('./cors')

const Favorites = require('../models/favorites')
const favoriteRouter = express.Router()

favoriteRouter.use(bodyParser.json())

favoriteRouter.route('/')
    .get(authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ user: req.user._id}).populate(['user', 'dishes']).then((result) => {
            res.statusCode = 200
            res.setHeader("Content-Type", 'application/json')
            res.json(result)
        }, (err) => next(err))
        .catch((err) => next(err))
    })
    .post(authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({user: req.user._id}).then((result) => {
            // if favorite list is exist
            if (result != null) {
                // loop from req.body
                req.body.forEach(dishes => {
                    // if req.body dishId is not found from existing favorite list then push the dishId
                    if (result.dishes.indexOf(dishes._id) == -1) {
                        result.dishes.push(dishes._id)
                    }
                });
                result.save().then((favorite) => {
                    res.statusCode = 200
                    res.setHeader('Content-Type', 'application/json')
                    res.json(favorite)
                }, (err) => next(err))
            } else {
                var newFavorite = Favorites({
                    user: req.user._id,
                    dishes: []
                })
                req.body.forEach(dishes => { 
                    newFavorite.dishes.push(dishes._id)
                })
                newFavorite.save().then((favorite) => {
                    res.statusCode = 200
                    res.setHeader('Content-Type', 'application/json')
                    res.json(favorite)
                }, (err) => next(err))
            }
        })
        .catch((err) => next(err))
    })
    .put(authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 200
        res.end('PUT operation not supported on favorites/' + req.params.dishId)
    })
    .delete(authenticate.verifyUser, (req, res, next) => {
        Favorites.remove({}).then((response) => {
            res.statusCode = 200
            res.setHeader("Content-Type", 'application/json')
            res.json(response)
        }, (err) => next(err))
        .catch((err) => next(err))
    })


favoriteRouter.route('/:dishId')
    .get(authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 200
        res.end('GET operation not supported on favorites/' + req.params.dishId)
    })
    .post(authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({user: req.user._id}).then((result) => {
            if (result != null) {
                if (result.dishes.indexOf(req.params.dishId) == -1) {
                    result.dishes.push(req.params.dishId)
                    result.save().then((favorite) => {
                        res.statusCode = 200
                        res.setHeader('Content-Type', 'application/json')
                        res.json(favorite)
                    }, (err) => next(err))
                } else {
                    err = new Error('You already add this dish into your favorite!')
                    err.status = 403
                    return next(err)
                }
            } else {
                var newFavorite = Favorites({
                    user: req.user._id,
                    dishes: req.params.dishId
                })
                newFavorite.save().then((favorite) => {
                    res.statusCode = 200
                    res.setHeader('Content-Type', 'application/json')
                    res.json(favorite)
                }, (err) => next(err))
            }
        })
        .catch((err) => next(err))
    })
    .put(authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 200
        res.end('PUT operation not supported on favorites/' + req.params.dishId)
    })
    .delete(authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({user: req.user._id}).then((result) => {
            // if favorite list is exist
            if (result != null) {
                const index = result.dishes.indexOf(req.params.dishId)
                // if dishId is exist at favorite list
                if (index > -1) {
                    // if there is more than one of favorite dishes on list
                    if (result.dishes.length > 1) {
                        result.dishes.splice(index, 1)
                        result.save().then((favorite) => {
                            res.statusCode = 200
                            res.setHeader('Content-Type', 'application/json')
                            res.json(favorite)
                        }, (err) => next(err))
                        .catch((err) => next(err))
                    } else {
                        Favorites.remove({}).then((response) => {
                            res.statusCode = 200
                            res.setHeader("Content-Type", 'application/json')
                            res.json(response)
                        }, (err) => next(err))
                        .catch((err) => next(err))
                    }
                } else {
                    err = new Error('Favorite dish '+ req.params.dishId +' not found!')
                    err.status = 403
                    return next(err)
                }
            } else {
                err = new Error('User favorite list is not found!')
                err.status = 404
                return next(err)
            }
        })
        .catch((err) => next(err))
    })

module.exports = favoriteRouter