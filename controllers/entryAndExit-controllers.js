const EntryAndExit = require('../model/entryAndExit')
const HttpError = require('../model/http-error')
const moment = require('jalali-moment')

const saveEntryAndExit = async (req, res, next) => {
    const { creator, mode, lat, lng } = req.body

    const date = moment().locale('fa').format('YYYY/M/D')
    const time = moment().locale('fa').format('HH:mm:ss')

    // function for totalTime each report 
    const calculationTimeFunc = (arr) => {
        let hours = 0
        let minutes = 0
        let seconds = 0
        const newArr = arr.filter(item => Object.keys(item).length == 2)
        newArr.map(item => {
            const enterTime = moment(item.enter.time, 'HH:mm:ss')
            const exitTime = moment(item.exit.time, 'HH:mm:ss')

            hours += moment.duration(exitTime.diff(enterTime)).get('hours')
            minutes += moment.duration(exitTime.diff(enterTime)).get('minutes')
            seconds += moment.duration(exitTime.diff(enterTime)).get('seconds')
        })

        if (seconds >= 60) {
            minutes += (seconds - seconds % 60) / 60
            seconds = seconds % 60
        }
        if (minutes >= 60) {
            hours += (minutes - minutes % 60) / 60
            minutes = minutes % 60
        }

        return `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`
    }

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
            entryAndExit: [{ [mode]: { lat: lat, lng: lng, mode: mode, time: time } }],
            totalTime: ''
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
        existingEntryAndExit.totalTime = calculationTimeFunc(existingEntryAndExit.entryAndExit)
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

    // function for total_working_hours each month 
    const calculationAllTimeFunc = (arr) => {
        let hours = 0
        let minutes = 0
        let seconds = 0
        arr.map(item => {
            hours += Number(item.totalTime.split(":")[0])
            minutes += Number(item.totalTime.split(":")[1])
            seconds += Number(item.totalTime.split(":")[2])
        })

        if (seconds >= 60) {
            minutes += (seconds - seconds % 60) / 60
            seconds = seconds % 60
        }
        if (minutes >= 60) {
            hours += (minutes - minutes % 60) / 60
            minutes = minutes % 60
        }

        return `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`
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
        const reportsObj = {
            total_shift_hours: '00:00:00',
            total_working_hours: calculationAllTimeFunc(reportsFiltered),
            total_delay_hours: '00:00:00',
            total_rush_hours: '00:00:00',
            totla_leave_days: 0
        }
        reports = reportsObj
    } else if (mode === 'detailed-report') {
        reports = reportsFiltered
    }

    res.json({ reports: reports })
}

exports.saveEntryAndExit = saveEntryAndExit
exports.reportEntryAndExit = reportEntryAndExit