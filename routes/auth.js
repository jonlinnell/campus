const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const path = require('path')
const fs = require('fs')
const moment = require('moment')
const Joi = require('joi')

const User = require('../models/user')
const { userCreateValidationSchema, userUpdateValidationSchema } = require('../validationSchema/user')

const verifyToken = require('../lib/verifyToken')

const endpoint = '/auth'
const secret = fs.readFileSync(path.resolve(`${__dirname}/../.secret`)).toString()
const hashPasses = 5

module.exports = (app) => {
  app.post(`${endpoint}/register`, verifyToken, (req, res) => {
    Joi.validate(req.body, userCreateValidationSchema, (invalid) => {
      if (invalid) {
        res.status(400).send(invalid)
      } else {
        const {
          username,
          surname,
          givenName,
          password,
          permissions,
        } = req.body

        bcrypt.hash(password, hashPasses, (err, hashedPassword) => {
          if (err) {
            res.status(400).send(`Error generating password: ${err}.`)
          } else {
            const newUser = new User({
              username,
              surname,
              givenName,
              password: hashedPassword,
              permissions,
              createdBy: req.user.username,
              createdOn: moment(),
            })

            newUser
              .save()
              .then(savedNewUser => res.json({ adminUser: req.user.username, savedNewUser }))
              .catch(saveError => res.status(500).send(saveError))
          }
        })
      }
    })
  })

  app.put(`${endpoint}/user/password/:username`, verifyToken, (req, res) => {
    bcrypt.hash(req.body.password, hashPasses, (err, newHashedPassword) => {
      if (err) {
        res.status(500).json({ message: 'Could not generate new hashed password.' })
      } else {
        User.updateOne(
          { username: req.params.username },
          { $set: { password: newHashedPassword } },
          (updateError) => {
            if (updateError) {
              res.status(500).send(updateError)
            } else {
              res.sendStatus(200)
            }
          },
        )
      }
    })
  })

  app.put(`${endpoint}/user/:username`, verifyToken, (req, res) => {
    const updateValues = req.body
    delete updateValues.password // Just in case

    Joi.validate(req.body, userUpdateValidationSchema, (invalid) => {
      if (invalid) {
        res.status(400).send(invalid)
      } else {
        User.updateOne(
          { username: req.params.username },
          { $set: req.body },
          (updateError) => {
            if (updateError) {
              res.status(500).send(updateError)
            } else {
              res.sendStatus(200) // Be more verbose?
            }
          },
        )
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
              permissions: existingUser.permissions,
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

  app.delete(`${endpoint}/user/:username`, verifyToken, (req, res) => {
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
