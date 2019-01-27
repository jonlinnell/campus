require('dotenv').config()

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const fs = require('fs')
const path = require('path')

const port = process.env.PORT || 3000
const routes = path.resolve(`${__dirname}/routes`)

const { NODE_ENV } = process.env

const app = express()

app.use(cors())
app.use(helmet())
app.use(bodyParser.json())

if (NODE_ENV !== 'production') { app.use(morgan('dev')) }

fs.readdir(routes, (error, files) => {
  if (error) { throw new Error(error) }

  files.forEach(file => require(path.resolve(`${routes}/${file}`))(app)) // eslint-disable-line
})

app.listen(port, () => process.stdout.write('Listening!\n'))
