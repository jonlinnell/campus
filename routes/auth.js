const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const path = require('path')
const fs = require('fs')
const moment = require('moment')

const User = require('../models/user')

const verifyToken = require('../lib/verifyToken')

const endpoint = '/auth'
const secret = fs.readFileSync(path.resolve(`${__dirname}/../.secret`)).toString()

module.exports = (app) => {
  app.post(`${endpoint}/register`, verifyToken, (req, res) => {
    const {
      username,
      surname,
      givenName,
      password,
      privileges,
    } = req.body

    bcrypt.hash(password, 5, (err, hashedPassword) => {
      if (err) {
        res.status(400).send(`Error generating password: ${err}.`)
      } else {
        const newUser = new User({
          username,
          surname,
          givenName,
          password: hashedPassword,
          privileges,
          createdBy: req.user.username,
          createdOn: moment(),
        })

        newUser
          .save()
          .then(savedNewUser => res.json({ adminUser: req.user.username, savedNewUser }))
          .catch(saveError => res.status(500).send(saveError))
      }
    })
  })

  app.post(`${endpoint}/login`, (req, res) => {
    const { username, password } = req.body

    User
      .findOne({ username })
      .then((existingUser) => {
        if (!existingUser) {
          res.status(400).json({ authorised: false, message: 'User does not exist.' })
        } else if (bcrypt.compareSync(password, existingUser.password)) {
          jwt.sign(
            {
              username,
              privileges: existingUser.privileges,
            },
            secret,
            {
              expiresIn: '12H',
            },
            (err, token) => res.json({ authorised: true, token }),
          )
        } else {
          res.status(403).json({ authorised: false, message: 'Password incorrect.' })
        }
      })
  })

  app.delete(`${endpoint}/:username`, verifyToken, (req, res) => {
    User.findOneAndDelete({ username: req.params.username }, (err, dbRes) => {
      if (err) {
        res.status(500).send(err)
      } else if (dbRes) {
        res.status(200).send({ username: dbRes.username })
      } else {
        res.status(404).send({ message: 'User does not exist.' })
      }
    })
  })
}
