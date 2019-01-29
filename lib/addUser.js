const bcrypt = require('bcrypt')

const User = require('../models/user')

module.exports = (userInfo, creator = 'system') => new Promise((resolve, reject) => {
  const {
    username,
    surname,
    givenName,
    password,
    permissions,
  } = userInfo

  bcrypt.hash(password, 5, (err, hashedPassword) => {
    if (err) {
      reject(new Error(`Error generating password: ${err}.`))
    } else {
      const newUser = new User({
        username,
        surname,
        givenName,
        password: hashedPassword,
        permissions,
        createdBy: creator,
      })

      newUser
        .save((saveError, savedNewUser) => {
          if (saveError) reject(saveError)

          resolve(savedNewUser)
        })
    }
  })
})
