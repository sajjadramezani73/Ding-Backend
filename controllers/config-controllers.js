const jwt = require('jsonwebtoken')
const User = require('../model/user')

const getIndex = async (req, res, next) => {
    const reqToken = req.headers.authorization

    if (reqToken == undefined) {
        res.json({ userValid: false, user: null })
    } else {
        const token = reqToken.split(' ')[1]
        const validToken = jwt.verify(token, 'secret_key', async (err, decoded) => {
            if (err) {
                res.json({ userValid: false, user: null })
            }
            else {
                const user = await User.findOne({ _id: decoded.userId })
                res.json({ userValid: true, user: user })
            }
            next()
        })
    }

}

exports.getIndex = getIndex