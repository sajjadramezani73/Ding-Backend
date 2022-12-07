const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    username: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    password: { type: String, required: true },
    avatar: { type: String, required: false },
    gender: { type: String, required: true },
    hasAvatar: { type: Number, required: true },
    comments: [{ type: mongoose.Types.ObjectId, required: true, ref: 'Comment' }]
})

module.exports = mongoose.model('User', userSchema)