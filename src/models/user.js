/* eslint-disable func-names */
const { Schema, model } = require('mongoose')

const permissions = Object.values(require('../constants/permissions'))

const passwordRegex = new RegExp(/^$|^(?=.*[A-Z])+(?=.*[!@#$&*\-_€£])(?=.*[0-9])+(?=.*[a-z])+.+$/)

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    validate: passwordRegex,
  },
  surname: {
    type: String,
  },
  givenName: {
    type: String,
    required: true,
  },
  permissions: {
    type: [String],
    enum: permissions,
  },
  createdBy: String,
  createdOn: {
    type: Date,
    default: new Date(),
  },
  lastModified: Date,
})

userSchema.pre('updateOne', function (next) {
  this.update({}, { $set: { lastModified: new Date() } })

  next()
})

const User = model('User', userSchema)

module.exports = User
