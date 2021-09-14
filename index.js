'use strict';
const express = require('express')
const app = express()
const router = express.Router()
require('dotenv').config({ path: '.env' })

app.set('port', (process.env.APP_PORT || 8080))
app.use(express.urlencoded({ extended: false }))
app.use(router)

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST', 'GET', 'OPTIONS', 'PUT', 'DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept', 'application/json', 'text/json')
  next()
});

app.use('/', require('./src/router/router'))
app.get('/', (request, response) => {
  let result = 'App is running'
  response.send(result);
}).listen(app.get('port'), () => {
  console.log('App is running, server is listening on port', app.get('port'))
});

module.exports = app;