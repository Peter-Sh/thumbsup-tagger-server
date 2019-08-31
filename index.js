// vim: set expandtab tabstop=2 shiftwidth=2 :
const express = require('express')
const app = express()
const debug = require('debug', 'tagger-server')
const server = require('./src/response-helper.js')

const db = require('./src/db.js')

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

app.get('/init', (req, res) => {
  db.exec('CREATE TABLE IF NOT EXISTS tag (id INTEGER PRIMARY KEY, name VARCHAR(255), UNIQUE (name))')
  db.exec('CREATE TABLE IF NOT EXISTS file (id INTEGER PRIMARY KEY, name VARCHAR(255), UNIQUE (name))')
  db.exec('CREATE TABLE IF NOT EXISTS file_tag (id_file INTEGER, id_tag INTEGER, PRIMARY KEY (id_file, id_tag))')
  res.send('OK')
})

app.get('/tags/', (req, res) => {
  const tag = db.prepare('SELECT tag.name, COALESCE(count(*), 0) AS cnt FROM tag LEFT JOIN file_tag ON tag.id = file_tag.id_tag GROUP BY tag.id ORDER BY cnt DESC').all()
  res.send(JSON.stringify(tag))
})

app.get('/tags/file/', (req, res) => {
  console.log(req)
  if (!req.query.fileName) {
    return server.sendErr(res, 'missing fileName')
  }
  let file = db.prepare('SELECT id FROM file WHERE name = ?').get(req.query.fileName)
  if (file === undefined) {
    return server.sendErr(res, 'file not found')
  }
  let fileId = file.id
  let tags = db.prepare('SELECT tag.name FROM file_tag, tag WHERE file_tag.id_file = ? AND file_tag.id_tag = tag.id')
    .all(fileId)
    .map(tag => { return tag.name })
  return server.sendOK(res, null, tags)
})

app.post('/save/', (req, res) => {
  const tags = req.body
  const collection = tags.tags

  if (collection === undefined) {
    res.json({ status: 'ERROR', message: 'missing tags' })
    res.end()
    return
  }
  if (!Array.isArray(collection)) {
    res.json({ status: 'ERROR', message: 'tags should be an array' })
    res.end()
    return
  }
  // TODO: check every element is string
  if (!tags.fileName) {
    res.json({ status: 'ERROR', message: 'missing fileName' })
    res.end()
    return
  }

  const insertTagStatement = db.prepare('INSERT OR IGNORE INTO tag (name) VALUES (?)')
  let inExpr = [];
  collection.map((tag) => {
    insertTagStatement.run(tag)
    inExpr.push('?');
  })
  db.exec('BEGIN TRANSACTION')
  let file = db.prepare('SELECT id FROM file WHERE name = ?').get(tags.fileName)
  if (file === undefined) {
    db.prepare('INSERT INTO file (name) VALUES (?)').run(tags.fileName)
    file = db.prepare('SELECT last_insert_rowid()').get()
  }
  db.prepare('DELETE FROM file_tag WHERE id_file = ?').run("" + file.id)
  db.prepare('INSERT INTO file_tag SELECT ?, id FROM tag WHERE name IN (' + inExpr.join(',') + ')')
    .run(["" + file.id].concat(collection))
  db.exec('COMMIT')
 
  res.json({ status: 'OK' })
  res.end()
  return
})

app.listen(3000, () => {})
