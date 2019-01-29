const { Router } = require('express')

const verifyToken = require('../lib/verifyToken')
const verifyPermissions = require('../lib/verifyPermissions')
const { SECURITYLOG_READ, SECURITYLOG_WRITE } = require('../constants/permissions')

const SecurityLog = require('../models/securityLog')

const router = Router()

router.route('/')
  .get(verifyToken, verifyPermissions(SECURITYLOG_READ), (req, res) => {
    SecurityLog.find({}, (err, results) => {
      if (err) {
        res.status(500).send(err)
      } else {
        res.json(results)
      }
    })
  })

  .post(verifyToken, verifyPermissions(SECURITYLOG_WRITE), (req, res) => {
    const newSecurityLog = new SecurityLog(req.body)
    newSecurityLog.loggedBy = req.user.username
    newSecurityLog.deviceAddress = req.ip
    newSecurityLog.useragent = req.headers['user-agent']

    newSecurityLog
      .save()
      .then(savedNewSecurityLog => res.send(savedNewSecurityLog))
      .catch(saveError => res.status(500).send(saveError))
  })

module.exports = router
