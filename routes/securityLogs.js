const verifyToken = require('../lib/verifyToken')

const SecurityLog = require('../models/securityLog')

const endpoint = '/securitylog'

module.exports = (app) => {
  app.get(endpoint, verifyToken, (req, res) => {
    SecurityLog.find({}, (err, results) => {
      if (err) {
        res.status(500).send(err)
      } else {
        res.json(results)
      }
    })
  })

  app.post(endpoint, verifyToken, (req, res) => {
    const newSecurityLog = new SecurityLog(req.body)
    newSecurityLog.loggedBy = req.user.username
    newSecurityLog.deviceAddress = req.ip
    newSecurityLog.useragent = req.headers['user-agent']

    newSecurityLog
      .save()
      .then(savedNewSecurityLog => res.send(savedNewSecurityLog))
      .catch(saveError => res.status(500).send(saveError))
  })
}
