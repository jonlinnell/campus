const User = require('../models/user')

module.exports = ({ username, fields }) => new Promise((resolve, reject) => {
  User.findOne({ username }, fields, (error, data) => {
    error
      ? reject(error)
      : resolve(data)
  })
})
