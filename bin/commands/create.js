const path = require('path')
const { promisify } = require('util')
const fs = require('fs')

const inquirer = require('inquirer')
const { green, blue, red } = require('chalk')

const { ensureConfig } = require('../config')

const { readProjectConfig, createProject } = require('../../lib')

const readdir = promisify(fs.readdir)
const mkdirp = promisify(require('mkdirp'))

// const confirmCwd = (cwd) => {
// 	return readdir(cwd).then(contents => {
// 		if (contents.length > 0) {
// 			return inquirer.prompt([
// 				{
// 					name: 'proceed',
// 					type: 'confirm',
// 					default: false,
// 					message: red(`Directory ${cwd} is not empty. Proceed?`)
// 				}
// 			])
// 			.then(({ proceed }) => {
// 				return proceed
// 			})
// 		} else {
// 			return true
// 		}
// 	})
// }

const prompt = ({ cwd }, config) => {
	let questions = [
		{
			name: 'confirm',
			type: 'confirm',
			default: () => {
				// When the directory has no contents, the confirm is by default true
				return fs.readdirSync(cwd).length === 0
			},
			when: () => {
				// Only ask for confirmation whenever the directory is not empty
				return fs.readdirSync(cwd).length > 0
			},
			message: red(`Directory ${cwd} is not empty. Proceed?`),
		},
		{
			name: 'templateRootPath',
			message: 'Template:',
			type: 'list',
			when: ({ confirm }) => {
				return confirm === true || confirm === undefined
			},
			choices: () => {
				return readdir(config.templatesDir).then(templateNames => {
					return templateNames.filter(name => {
						return fs.statSync(path.join(config.templatesDir, name)).isDirectory()
					})
					.map(name => {
						return {
							name,
							value: path.join(config.templatesDir, name),
						}
					})
				})
			}
		}
	]

	return inquirer.prompt(questions).then(({ confirm, templateRootPath }) => {
		if (confirm === false) {
			return
		}

		return readProjectConfig(templateRootPath)
			.then(config => {
				return inquirer.prompt(config.tokens.map(token => {
					return {
						type: 'input',
						name: token,
						message: token,
						default: token === 'project-name' ? path.basename(cwd) : undefined
					}
				}))
			})
			.then(data => {
				return createProject(templateRootPath, cwd, data, {
					log: file => {
						const name = path.relative(file.base, file.path)
						console.log(`${green('create')} ${blue(path.basename(cwd))} ${name}`)
					}
				})
			})
			.then(() => {
				console.log(green('Project created successfully at dir ') + cwd)
			})
	})
}


const handler = argv => {
	let cwd = process.cwd()

	if (argv.projectName && argv.projectName !== '.') {
		cwd = path.join(cwd, argv.projectName)
	}

	return mkdirp(cwd)
		.then(ensureConfig)
		.then(config => {

			return prompt({ cwd }, config)

			// return confirmCwd(cwd).then(confirm => {
			// 	if (!confirm) {
			// 		return
			// 	}

			// 	return prompt({
			// 		cwd,
			// 	}, config)
			// })
		})
}

const CMD_CREATE = {
	command: ['create [projectName]', '$0'],
	describe: 'Creates a new project',
	handler
}

module.exports = CMD_CREATE
