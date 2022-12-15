const EntryAndExit = require('../model/entryAndExit')
const HttpError = require('../model/http-error')
const moment = require('jalali-moment')

const saveEntryAndExit = async (req, res, next) => {
    const { creator, mode, lat, lng } = req.body

    const date = moment().locale('fa').format('YYYY/M/D')
    const time = moment().locale('fa').format('HH:mm:ss')

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
            entryAndExit: [{ lat: lat, lng: lng, mode: mode, time: time }]
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

    const entryAndExit = { lat: lat, lng: lng, mode: mode, time: time }

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

exports.saveEntryAndExit = saveEntryAndExit