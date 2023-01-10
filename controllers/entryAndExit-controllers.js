const EntryAndExit = require('../model/entryAndExit')
const HttpError = require('../model/http-error')
const moment = require('jalali-moment')

const saveEntryAndExit = async (req, res, next) => {
    const { creator, mode, lat, lng } = req.body

    const date = moment().locale('fa').format('YYYY/M/D')
    const time = moment().locale('fa').format('HH:mm')

    let existingEntryAndExit
    try {
        existingEntryAndExit = await EntryAndExit.findOne({ user: creator, date: date })
    } catch (err) {
        const error = new HttpError('Creating entry and exit faild', 500)
        return next(error)
    }

    if (!existingEntryAndExit) {

        if (mode == 'exit') {
            res.status(422).json({ success: 0, message: 'برای این تاریخ، ابتدا باید زمان ورود ثبت شود!' })
            return next()
        }

        const createEntryAndExit = new EntryAndExit({
            user: creator,
            date: date,
            lastMode: mode,
            entryAndExit: [{ [mode]: { lat: lat, lng: lng, mode: mode, time: time } }]
        })

        try {
            await createEntryAndExit.save()
        } catch (err) {
            const error = new HttpError('Creating entry and exit faild', 500)
            return next(error)
        }
        res.json({ success: 1, message: 'درخواست شما با موفقیت ثبت شد' })
        return next()
    }

    if (mode == 'enter' && existingEntryAndExit.lastMode == 'enter') {
        res.status(422).json({ success: 0, message: 'قبلا زمان ورود ثبت شده است!' })
        return next()
    }
    if (mode == 'exit' && existingEntryAndExit.lastMode == 'exit') {
        res.status(422).json({ success: 0, message: 'قبلا زمان خروج ثبت شده است!' })
        return next()
    }

    let entryAndExit
    if (mode == 'enter') {
        entryAndExit = { [mode]: { lat: lat, lng: lng, mode: mode, time: time } }
    }
    if (mode == 'exit') {
        entryAndExit = existingEntryAndExit.entryAndExit[existingEntryAndExit.entryAndExit.length - 1]
        entryAndExit[mode] = { lat: lat, lng: lng, mode: mode, time: time }
        existingEntryAndExit.entryAndExit.pop()
    }

    try {
        existingEntryAndExit.lastMode = mode
        existingEntryAndExit.entryAndExit.push(entryAndExit)
        await existingEntryAndExit.save()
    } catch (err) {
        const error = new HttpError('Creating entry and exit faild', 500)
        return next(error)
    }

    res.json({ success: 1, message: 'درخواست شما با موفقیت ثبت شد' })
}

const reportEntryAndExit = async (req, res, next) => {
    const { creator, date, mode } = req.body

    const changeDate = (date) => {
        let m = moment.from(date, 'fa', 'YYYY/M/D')
        return m.locale('fa').format('YYYY/M')
    }

    let reports = []
    let existingEntryAndExit
    try {
        existingEntryAndExit = await EntryAndExit.find({ user: creator }).exec()
    } catch (err) {
        const error = new HttpError('finding entry and exit faild', 500)
        return next(error)
    }

    if (!existingEntryAndExit) {
        res.status(422).json({ success: 0, reports: reports })
        return next()
    }

    reportsFiltered = existingEntryAndExit.filter(item => changeDate(item.date) === date)

    if (mode === 'summary-report') {
        reports = {}
    } else if (mode === 'detailed-report') {
        reports = reportsFiltered
    }

    res.json({ reports: reports })
}

exports.saveEntryAndExit = saveEntryAndExit
exports.reportEntryAndExit = reportEntryAndExit