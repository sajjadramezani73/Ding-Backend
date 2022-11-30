const express = require('express')
const router = express()
const userControllers = require('../controllers/user-controllers')

router.get('/', userControllers.getUsers)

router.post('/signup', userControllers.signup)

router.post('/login', userControllers.login)

module.exports = router