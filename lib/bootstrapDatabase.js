const mongoose = require('mongoose')
const User = require('../models/user')

const addUser = require('../lib/addUser')

const { ALL } = require('../constants/permissions')

const { DB_HOST, DB_NAME, DEFAULT_ADMIN_PW } = process.env

const defaultAdminUser = {
  username: 'admin',
  permissions: ALL,
  givenName: 'Admin',
  password: DEFAULT_ADMIN_PW,

}

module.exports = () => new Promise((resolve, reject) => {
  mongoose.connect(`mongodb://${DB_HOST}/${DB_NAME}`, { useNewUrlParser: true })
  const db = mongoose.connection

  db.on('error', error => reject(error))
  db.once('connected', () => {
    User.findOne({ permissions: { $in: ALL } }, (dbError, result) => {
      if (dbError) { reject(dbError) }

      if (!result) {
        if (!DEFAULT_ADMIN_PW) {
          reject(new Error('No admin user exists, and DEFAULT_ADMIN_PW is not set. Please set this environment variable before continuing.'))
        } else {
          process.stdout.write('No admin user exists. Creating one... ')
          addUser(defaultAdminUser)
            .then((newUser) => {
              process.stdout.write(`Done.\nCreated user ${newUser.username} with permissions ${JSON.stringify(newUser.permissions)}.\n`)
              resolve()
            })
            .catch(adminUserError => process.stderr.write(adminUserError))
        }
      } else {
        resolve()
      }
    })
  })
})
