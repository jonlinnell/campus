/* eslint-disable func-names */
const moment = require('moment')
const { Schema, model } = require('mongoose')

const permissions = Object.values(require('../constants/permissions'))

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
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
    default: moment(),
  },
  lastModified: Date,
})

userSchema.pre('updateOne', function (next) {
  this.update({}, { $set: { lastModified: new Date() } })

  next()
})

const User = model('User', userSchema)

module.exports = User
