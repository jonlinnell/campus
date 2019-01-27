const { ALL } = require('../constants/permissions')

module.exports = role => (req, res, next) => {
  if (req.user.permissions.indexOf(ALL) !== -1) {
    next()
  } else if (req.user.permissions.indexOf(role) !== -1) {
    next()
  } else {
    res.status(403).json({ message: 'You do not have access to this resource.' })
  }
}
