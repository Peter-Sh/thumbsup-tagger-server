// vim: set expandtab tabstop=2 shiftwidth=2 :
const path = require('path')
const Database = require('better-sqlite3')
const dbPath = path.join(__dirname, '..', 'foobar.db')
const db = new Database(dbPath, { verbose: console.log })

module.exports = db;
