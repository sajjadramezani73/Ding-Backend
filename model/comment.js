const mongoose = require('mongoose')
const Schema = mongoose.Schema

const commentSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    score: { type: Number, required: true },
    time: { type: String, required: true },
    user: { type: mongoose.Types.ObjectId, required: true, ref: 'User' }
})

module.exports = mongoose.model('Comment', commentSchema)