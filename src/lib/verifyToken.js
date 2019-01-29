const jwt = require('jsonwebtoken')
const fs = require('fs')
const path = require('path')

const User = require('../models/user')

const secret = fs.readFileSync(path.resolve(`${__dirname}/../../.secret`), 'utf8')

module.exports = (req, res, next) => {
  const token = req.headers['x-access-token']

  if (!token) {
    res.status(400).json({ message: 'No token provided. Remember to set x-access-token.' })
  } else {
    jwt.verify(token, secret, (error, decodedToken) => {
      if (error) {
        res.status(403).json({ message: 'Invalid token provided.' })
      } else {
        User.findOne({ username: decodedToken.username })
          .then((existingUser) => {
            if (existingUser) {
              req.user = {
                username: decodedToken.username,
                permissions: existingUser.permissions,
              }

              next()
            } else {
              res.status(403).json({ message: 'This token is for a user that does not exist.' })
            }
          })
          .catch(existingUserError => res.status(500).json({ message: existingUserError }))
      }
    })
  }
}
