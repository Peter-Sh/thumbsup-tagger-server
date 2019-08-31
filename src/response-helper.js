// vim: set expandtab tabstop=2 shiftwidth=2 :
module.exports = {
  sendErr: function (res, message) {
    res.json({ status: 'ERROR', message: message })
    res.end()
  },
  sendOK: function (res, message, data) {
    const body = { status: 'OK' }
    if (message) {
      body.message = message
    }
    if (data) {
      body.data = data
    }
    res.json(body)
    res.end()
  }
}
