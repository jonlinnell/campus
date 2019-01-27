const Joi = require('joi')

const permissions = Object.values(require('../constants/permissions'))

const passwordRegex = new RegExp(/^$|^(?=.*[A-Z])+(?=.*[!@#$&*\-_€£])(?=.*[0-9])+(?=.*[a-z])+.+$/)

const create = {
  username: Joi.string().alphanum().min(3).max(30)
    .required(),
  password: Joi.string().min(8).max(32)
    .required()
    .regex(passwordRegex)
    .strip(),
  surname: Joi.string().alphanum().max(32),
  givenName: Joi.string().alphanum().min(2).max(24)
    .required(),
  permissions: Joi.array().items(Joi.string().valid([permissions])).required(),
}

const update = {
  username: Joi.any().forbidden(),
  password: Joi
    .string().min(8).max(32)
    .regex(passwordRegex)
    .strip(),
  surname: Joi.string().alphanum().max(32),
  givenName: Joi.string().alphanum().min(2).max(24),
  permissions: Joi.array().items(Joi.string().valid([permissions])),
}

module.exports = {
  userCreateValidationSchema: create,
  userUpdateValidationSchema: update,
}
