// vim: set expandtab tabstop=2 shiftwidth=2 :
const db = require('./src/db.js')

const getFileIdStmt = db.prepare('SELECT id FROM file WHERE name = ?')
const getFileTagsStmt = db.prepare('SELECT tag.name FROM file_tag, tag WHERE file_tag.id_file = ? AND file_tag.id_tag = tag.id')

module.exports = file => {
	let fileIdRow = getFileIdStmt.get(file.path)
	let t = [];
	if (fileIdRow) {
		let fileId = fileIdRow.id
		t = getFileTagsStmt.all(fileId).map(row => row.name)
	}
	console.log(t)
	return t
}
