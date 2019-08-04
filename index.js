// vim: set expandtab tabstop=2 shiftwidth=2 :
const express = require('express')
const app = express()
const debug = require('debug', 'tagger-server')
const dbConn = require('./src/db')

app.use((req, res, next) => {
  process.once('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection:', reason.stack)
    res.status(500).send('Unknown Error' + reason.stack)
    // next(reason)
  })
  next()
})

app.use(express.json())

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

app.get('/', async (req, res) => {
  res.send('Hi!')
})

app.get('/init', async (req, res) => {
  const db = await dbConn
  await db.run('CREATE TABLE IF NOT EXISTS tag (id INTEGER PRIMARY KEY, name VARCHAR(255))')
  await db.run('CREATE TABLE IF NOT EXISTS file (id INTEGER PRIMARY KEY, name VARCHAR(255))')
  await db.run('CREATE TABLE IF NOT EXISTS file_tag (id_file INTEGER, id_tag INTEGER, PRIMARY KEY (id_file, id_tag))')
  res.send('OK')
})

app.get('/tags/', async (req, res) => {
  const db = await dbConn
  const tag = await db.all('SELECT * FROM tag')
  res.send(JSON.stringify(tag))
})

app.post('/save/', async (req, res) => {
  const db = await dbConn
  const tags = req.body;
  res.json(tags)
})

app.listen(3000, () => {})
