const { promisify } = require('util')
const path = require('path')
const fs = require('fs')
const { homedir } = require('os')

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const stat = promisify(fs.stat)

const mkdirp = require('mkdirp')

const BLEND_DIR = path.join(homedir(), '.blend')
const CONF_FILE_PATH = path.join(BLEND_DIR, `conf.json`)

const confEnsure = () => {
  return mkdirp(BLEND_DIR).then(() => {
    return stat(CONF_FILE_PATH)
      .then(() => {}, err => {
        if (err.code === 'ENOENT') {
          return confWrite({})
        } else {
          throw err
        }
      })
  })
}

const confWrite = data => {
  return writeFile(CONF_FILE_PATH, JSON.stringify(data, null, '  '), 'utf8')
}

const confRead = () => {
  return confEnsure().then(() => (
    readFile(CONF_FILE_PATH, 'utf8')
    .then(contents => JSON.parse(contents), err => {
      if (err.code === 'ENOENT') {
        return
      }
    })
  ))
}

module.exports = {
  confEnsure,
  confWrite,
  confRead
}
