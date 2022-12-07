const Comment = require("../model/comment")
const HttpError = require('../model/http-error')

const getComments = async (req, res, next) => {
    let comments
    try {
        comments = await Comment.find()
    } catch (err) {
        const error = new HttpError('Getting user faild', 500)
        return next(error)
    }
    res.json({ comments: comments.map(user => user.toObject({ gettesr: true })) })
}

const createComment = (req, res, next) => {

}

exports.getComments = getComments
exports.createComment = createComment