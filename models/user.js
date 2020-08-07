const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose')

const user = new mongoose.Schema({
    admin: {
        type: Boolean,
        default: false
    }
})

user.plugin(passportLocalMongoose)

module.exports = mongoose.model('user', user)