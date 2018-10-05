const fs = require('fs')
const path = require('path')
const { promisify } = require('util')

const vinyl = require('vinyl-fs')

const codeBlenderStream = require('./stream')

const readFile = promisify(fs.readFile)

const TEMPLATE_CONFIG_FILE_NAME = '.blenderrc'

const NEW_LINE_RE = /\r?\n/
const DEFAULT_IGNORE = [
	'.git/**/*',
	TEMPLATE_CONFIG_FILE_NAME
]

const readProjectConfig = projectRootPath => {
	return readFile(path.join(projectRootPath, TEMPLATE_CONFIG_FILE_NAME), 'utf8')
		.then(config => {
			config = JSON.parse(config)
			config.ignore = config.ignore ?
				[...config.ignore, ...DEFAULT_IGNORE] : DEFAULT_IGNORE

			return config
		})
		.catch(err => {
			switch (err.code) {
				case 'ENOENT':
					return {}
				default:
					throw err
			}
		})
}

const createProject = (srcProjectRootPath, dest, data, options) => {
	return readProjectConfig(srcProjectRootPath).then(config => {
		const PATTERNS = [
			'**/*',
			...config.ignore.map(pattern => `!${pattern}`)
		]

		const SRC_OPTIONS = {
			dot: true,
			cwd: srcProjectRootPath,
			nodir: true,
		}

		return new Promise((resolve, reject) => {
			let stream = vinyl.src(PATTERNS, SRC_OPTIONS)
				.pipe(codeBlenderStream({
					data,
					...options
				}))
				.pipe(vinyl.dest(dest))
				.on('error', reject)
				.on('end', resolve)
		})
	})
}

module.exports = {
	readProjectConfig,
	createProject
}
