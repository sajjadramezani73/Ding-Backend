const express = require('express')
const router = express()
const configControllers = require('../controllers/config-controllers')

router.get('/', configControllers.getIndex)

module.exports = router