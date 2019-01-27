const { ALL } = require('../constants/permissions')

module.exports = role => (req, res, next) => {
  if (req.user.permissions.includes(ALL)) {
    next()
  } else if (req.user.permissions.includes(role)) {
    next()
  } else {
    res.status(403).json({ message: 'You do not have access to this resource.' })
  }
}
