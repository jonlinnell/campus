const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const path = require('path')
const fs = require('fs')
const Joi = require('joi')
const { Router } = require('express')

const User = require('../models/user')
const { userCreateValidationSchema, userUpdateValidationSchema } = require('../validationSchema/user')

const verifyToken = require('../lib/verifyToken')
const addUser = require('../lib/addUser')
const findUser = require('../lib/findUser')

const secret = fs.readFileSync(path.resolve(`${__dirname}/../../.secret`)).toString()
const hashPasses = 5

const router = Router()

router.post('/register', verifyToken, (req, res) => {
  Joi.validate(req.body, userCreateValidationSchema, (invalid) => {
    if (invalid) {
      res.status(400).send(invalid)
    } else {
      addUser(req.body, req.user.username)
        .then(newUser => res.json(newUser))
        .catch(addUserError => res.status(500).send(addUserError))
    }
  })
})

router.get('/me', verifyToken, (req, res) => {
  findUser({ username: req.user.username, fields: 'username permissions givenName' })
    .then(foundUser => res.json(foundUser))
    .catch(error => res.status(500).send(error))
})

router.put('/user/password/:username', verifyToken, (req, res) => {
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

router.put('/user/:username', verifyToken, (req, res) => {
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

router.post('/login', (req, res) => {
  const { username, password } = req.body

  User
    .findOne({ username }, (error, existingUser) => {
      if (!existingUser) {
        res.status(400).json({ authorised: false, type: 'username', message: 'User does not exist.' })
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
        res.status(403).json({ authorised: false, type: 'password', message: 'Password incorrect.' })
      }
    })
})

router.delete('/user/:username', verifyToken, (req, res) => {
  User.findOneAndDelete({ username: req.params.username }, (err, dbRes) => {
    if (err) {
      res.status(500).send(err)
    } else if (dbRes) {
      res.status(200).send({ username: dbRes.username })
    } else {
      res.status(404).send({ authorised: false, type: 'username', message: 'User does not exist.' })
    }
  })
})

module.exports = router
