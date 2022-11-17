const User = require("../model/user")
const HttpError = require('../model/http-error')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

const getUsers = (req, res, next) => {
    res.json({ users: [] })
}

const signup = async (req, res, next) => {
    const { firstName, lastName, username, password, gender } = req.body

    let existingUser
    try {
        existingUser = await User.findOne({ username: username })
    } catch (err) {
        const error = new HttpError('singup faild !', 500)
        return next(error)
    }

    if (existingUser) {
        res.status(422).json({ success: 0, message: 'نام کاربری قبلا انتخاب شده است' })
        return next()
    }

    let hashPassword
    try {
        hashPassword = await bcrypt.hash(password, 12)
    } catch (err) {
        const error = new HttpError('singup faild !', 500)
        return next(error)
    }

    const createUser = new User({
        firstName: firstName,
        lastName: lastName,
        username: username,
        password: hashPassword,
        gender: gender,
        avatar: '',
        hasAvatar: 0
    })

    try {
        await createUser.save()
    } catch (err) {
        const error = new HttpError('singup faild !', 500)
        return next(error)
    }

    let token
    try {
        token = jwt.sign(
            { userId: createUser.id, username: createUser.username },
            'secret_key',
            { expiresIn: '1h' }
        )
    } catch (err) {
        const error = new HttpError('Sing up faild.', 500)
        return next(error)
    }

    res.status(201).json({ success: 1, message: 'ثبت نام با موفقیت انجام شد' })
}

exports.getUsers = getUsers
exports.signup = signup