require('dotenv').config()

const bodyParser = require('body-parser')
const cors = require('cors')
const express = require('express')
const fs = require('fs')
const helmet = require('helmet')
const morgan = require('morgan')
const path = require('path')

const bootstrapDatabase = require('./lib/bootstrapDatabase')

const port = process.env.PORT || 3000
const routes = `${__dirname}/routes`
const NODE_ENV = process.env.NODE_ENV || 'development'

const app = express()

app.use(cors())
app.use(helmet())
app.use(bodyParser.json())

if (NODE_ENV !== 'production') { app.use(morgan('dev')) }

fs.readdir(routes, (error, files) => {
  if (error) { throw new Error(error) }

  files.forEach(file => app.use(`/${path.basename(file, '.js')}`, require(path.resolve(`${routes}/${file}`)))) // eslint-disable-line
})

bootstrapDatabase()
  .then(() => app.listen(port, () => process.stdout.write(`Starting in ${NODE_ENV} mode.\nListening on port ${port}.\n`)))
  .catch(error => process.stderr.write(`Database error: ${error}.\n`))
