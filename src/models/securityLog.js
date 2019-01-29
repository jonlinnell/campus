const { Schema, model } = require('mongoose')

const securityLogSchema = new Schema({
  date: {
    type: Date,
    default: Date.now(),
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  loggedBy: {
    type: String,
    required: true,
  },
  deviceAddress: String,
  useragent: String,
  tags: [String],
})

const SecurityLog = model('SecurityLog', securityLogSchema)

module.exports = SecurityLog
