const { promisify } = require('util')
const path = require('path')
const { homedir } = require('os')
const fs = require('fs')

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const stat = promisify(fs.stat)
const mkdir = promisify(fs.mkdir)

const inquirer = require('inquirer')
const untildify = require('untildify')

const CODE_BLENDER_DIR = path.join(homedir(), '.code-blender')
const CONFIG_FILE_PATH = path.join(CODE_BLENDER_DIR, 'code-blender.json')
const CONFIG_BASE = {}

const writeConfig = (config) => {
	return writeFile(
		CONFIG_FILE_PATH,
		JSON.stringify(config, null, '  '),
		'utf8'
	)
	.then(() => config)
}

const readConfig = () => {
	return readFile(CONFIG_FILE_PATH, 'utf8').then(contents => {
		return JSON.parse(contents)
	})
}

const ensureBlenderDir = () => {
	return stat(CODE_BLENDER_DIR).then(stat => {
		if (stat.isDirectory()) {
			return
		} else {
			throw new Error('code-blender configurations directory is taken')
		}
	}, err => {
		if (err.code === 'ENOENT') {
			return mkdir(CODE_BLENDER_DIR)
		} else {
			throw err
		}
	})
}

const ensureBasicConfigs = (config) => {
	let questions = []

	if (!config.templatesDir) {
		questions = [...questions, {
			type: 'input',
			name: 'templatesDir',
			message: 'No `templatesDir` option defined, please define the path to the directory where templates are located.',
			filter: (dir) => {
				return untildify(dir.trim())
			},
			validate: (dir) => {
				return stat(dir).then(res => {
					if (!res.isDirectory()) {
						return `The path specified (${dir}) is not a directory`
					}

					return true
				})
				.catch(err => {
					switch (err.code) {
						case 'ENOENT':
							return `The path specified (${dir}) does not exist`
						default:
							return false
					}
				})
			}
		}]
	}

	return questions.length > 0 ?
		inquirer.prompt(questions).then(answers => {
			return Object.assign({}, config, answers)
		}) :
		Promise.resolve(config)
}

const ensureConfig = () => {
	return ensureBlenderDir().then(() => {
		return readConfig()
	})
	.catch(err => {
		if (err.code === 'ENOENT') {
			return CONFIG_BASE
		} else {
			throw err
		}
	})
	.then(config => {
		return ensureBasicConfigs(config)
	})
	.then(config => {
		return writeConfig(config)
	})
}

module.exports = {
	ensureConfig,
	writeConfig
}
