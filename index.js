require('dotenv').config()

const bodyParser = require('body-parser')
const cors = require('cors')
const express = require('express')
const fs = require('fs')
const helmet = require('helmet')
const mongoose = require('mongoose')
const morgan = require('morgan')
const path = require('path')

const port = process.env.PORT || 3000
const routes = `${__dirname}/routes`
const NODE_ENV = process.env.NODE_ENV || 'development'
const {
  DB_HOST,
  DB_NAME,
} = process.env

const app = express()

app.use(cors())
app.use(helmet())
app.use(bodyParser.json())

if (NODE_ENV !== 'production') { app.use(morgan('dev')) }

fs.readdir(routes, (error, files) => {
  if (error) { throw new Error(error) }

  files.forEach(file => require(path.resolve(`${routes}/${file}`))(app)) // eslint-disable-line
})

mongoose.connect(`mongodb://${DB_HOST}/${DB_NAME}`, { useNewUrlParser: true })
const db = mongoose.connection

db.on('error', error => process.stderr.write(`MongoDB ${error}\n`))
db.once('connected', () => {
  process.stdout.write('Database connected.\n')
  app.listen(port, () => process.stdout.write(`In ${NODE_ENV} mode, listening on port ${port}...\n`))
})
