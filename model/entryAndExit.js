const mongoose = require('mongoose')
const Schema = mongoose.Schema

const entryAndExitSchema = new Schema({
    user: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
    date: { type: String, required: true },
    lastMode: { type: String, required: true },
    entryAndExit: { type: Array, "default": [] },
    totalTime: { type: String, require: true }
})

module.exports = mongoose.model('EntryAndExit', entryAndExitSchema)