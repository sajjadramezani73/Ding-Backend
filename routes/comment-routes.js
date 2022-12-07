const express = require('express')
const router = express()

const commentControllers = require('../controllers/comment-controller')

router.get('/', commentControllers.getComments)

router.post('/add-comment', commentControllers.createComment)

module.exports = router