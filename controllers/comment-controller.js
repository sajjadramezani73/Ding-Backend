const Comment = require("../model/comment")
const User = require("../model/user")
const HttpError = require('../model/http-error')

const getComments = async (req, res, next) => {
    let comments
    try {
        comments = await Comment.find()
    } catch (err) {
        const error = new HttpError('Getting comment faild', 500)
        return next(error)
    }
    res.json({ comments: comments.map(user => user.toObject({ gettesr: true })) })
}

const createComment = async (req, res, next) => {
    const { title, description, score, creator } = req.body

    const createComment = new Comment({
        title: title,
        description: description,
        score: score,
        user: creator
    })

    let user
    try {
        user = await User.findById(creator)
    } catch (err) {
        const error = new HttpError('Creating comment faildd', 500)
        return next(error)
    }
    if (!user) {
        res.status(422).json({ success: 0, message: 'کاربری با این آی دی یافت نشد' })
        return next()
    }

    try {
        await createComment.save()
        user.comments.push(createComment)
        await user.save()
    } catch (err) {
        const error = new HttpError('Creating comment failddd', 500)
        return next(error)
    }

    res.status(201).json({ success: 1, message: 'نظر شما با موفقیت ثبت شد' })
}

exports.getComments = getComments
exports.createComment = createComment