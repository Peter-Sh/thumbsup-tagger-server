// vim: set expandtab tabstop=2 shiftwidth=2 :
const sqlite = require('sqlite')
const path = require('path')

async function open() {
  let p = ('./foo.db')
  console.log(path.resolve(p))
  return sqlite.open(p);
}

module.exports = open() 
