const mongoose = require('mongoose')
const Schema = mongoose.Schema

const commentSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    score: { type: Number, required: true },
    user: { type: mongoose.Types.ObjectId, required: true, ref: 'User' }
}, { timestamps: true })

module.exports = mongoose.model('Comment', commentSchema)