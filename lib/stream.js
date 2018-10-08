const through = require('through2')

const { renderTemplate } = require('./template')

const noop = () => {}

const codeBlender = ({ data, log = noop }) => {
	return through.obj(function (file, enc, cb) {
		if (file.isStream()) {
			this.emit('error', new Error('code-blender: Streams are not supported'))
			return cb()
		}

		if (file.isBuffer()) {
			log(file)

			const rendered = renderTemplate(file.contents.toString('utf8'), data)
			file.contents = Buffer.from(rendered, 'utf8')
		}

		this.push(file)

		cb()
	})
}

module.exports = codeBlender
