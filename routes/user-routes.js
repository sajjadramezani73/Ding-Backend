const express = require('express')
const router = express()
const userControllers = require('../controllers/user-controllers')
const fileUpload = require('../middleware/file-upload')

router.get('/', userControllers.getUsers)

router.post('/signup', userControllers.signup)

router.post('/login', userControllers.login)

router.post('/update', fileUpload.single('avatar'), userControllers.updeteUser)

module.exports = router