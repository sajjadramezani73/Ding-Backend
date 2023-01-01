const express = require('express')
const router = express()
const entryAndExitControllers = require('../controllers/entryAndExit-controllers')

router.post('/save-entry-and-exit', entryAndExitControllers.saveEntryAndExit)

router.post('/report-entry-and-exit', entryAndExitControllers.reportEntryAndExit)

module.exports = router