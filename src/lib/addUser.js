const bcrypt = require('bcrypt')

const User = require('../models/user')

/**
 * @name addUser
 * @function
 * @description Create a new user
 * @param {Object} userInfo
 * @param {string} userInfo.username - A username. Must be alphanumeric.
 * @param {string} userInfo.password - A strong password.
 * @param {string} userInfo.givenName - The user's given name.
 * @param {string} [userInfo.surname] - The user's surname.
 * @param {string[]} [userInfo.permissions] - A list of initial permissions for this user.
 * @param {string} [creator=system] - The username of the person creating this account.
*/
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
