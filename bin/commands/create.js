const path = require('path')
const validUrl = require('valid-url')
const { homedir } = require('os')
const { promisify } = require('util')
const fs = require('fs')
const { uniqBy } = require('lodash')
const untildify = require('untildify')
const tildify = require('tildify')

const inquirer = require('inquirer')
const { green, blue, red, blackBright } = require('chalk')

const git = require('nodegit')
const tmpDir = promisify(require('tmp').dir)

const {
	confRead,
	confWrite
} = require('../conf')

const { projectReadTemplateConf, projectCreateFromTemplate } = require('../../lib')

const readdir = promisify(fs.readdir)
const mkdirp = require('mkdirp')

const cloneRepoToTmpDir = repositoryUrl => {
	console.log(`${blackBright('clone: start')} ${repositoryUrl}`)

	return tmpDir().then(tmpDirPath => (
		git.Clone(repositoryUrl, tmpDirPath).then(() => {
			console.log(`${blackBright('clone: end')}`)

  		return tmpDirPath
  	})
  ))
}

const prompt = ({ cwd }, blendConf) => {
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
			name: 'reuseTemplate',
			message: 'Template:',
			type: 'list',
			when: ({ confirm }) => (
				(
					confirm === true ||
					confirm === undefined
				) &&
				Array.isArray(blendConf.history) &&
				blendConf.history.length > 0
			),
			choices: () => {
				return [
					...blendConf.history.map(entry => ({
						name: entry.name
							? `${entry.name} (${entry.location})`
							: entry.location,
						value: entry.location
					})),
					{ name: 'Other', value: false }
				]
			}
		},
		{
			name: 'newTemplate',
			message: 'Template:',
			when: ({ confirm, reuseTemplate }) => (
				(
					confirm === true ||
					confirm === undefined
				) &&
				(
					reuseTemplate === false ||
					reuseTemplate === undefined
				)
			)
		}
	]

	return inquirer.prompt(questions).then(({
		confirm,
		reuseTemplate,
		newTemplate,
	}) => {
    if (confirm === false) {
    	console.log(`Action aborted`)
      return
    }

		const template = typeof reuseTemplate === 'string'
			? reuseTemplate
			: newTemplate

		// If the template string is an URL, assume it is a git repo
		// Otherwise, assume it is a filesystem path
		const loadTemplatePromise = validUrl.isUri(template)
			? cloneRepoToTmpDir(template)
			: Promise.resolve(untildify(template))

		return loadTemplatePromise
			.then(templateRootPath => {
				return projectReadTemplateConf(templateRootPath)
					.then(templateConf => {
						return Array.isArray(templateConf.tokens)
							? inquirer.prompt(templateConf.tokens.map(token => {
									return {
										type: 'input',
										name: token,
										message: token,
										default: token === 'project-name' ? path.basename(cwd) : undefined
									}
								}))
							: {}
					})
					.then(data => projectCreateFromTemplate(
						templateRootPath,
						cwd,
						data,
						{
							log: file => {
								const name = path.relative(file.base, file.path)
								console.log(`${green('create')} ${blue(path.basename(cwd))} ${name}`)
							}
						}
					))
					.then(() => {
						console.log(green('Project created successfully at dir ') + tildify(cwd))

						// Update history
						return projectReadTemplateConf(templateRootPath).then(templateConf => {
							const historyEntry = {
								name: templateConf.name || null,
								location: template
							}

							const history = blendConf.history
									? [historyEntry, ...blendConf.history]
									: [historyEntry]

							confWrite({
								...blendConf,
								history: uniqBy(history, entry => entry.location)
							})
						})
					})
			})
	})
}

const handler = argv => {
	let cwd = process.cwd()

	if (argv.projectName && argv.projectName !== '.') {
		cwd = path.join(cwd, argv.projectName)
	}

	return mkdirp(cwd)
		.then(() => confRead())
		.then(blendConf => {
			return prompt({ cwd }, blendConf)
		})
}

const CMD_CREATE = {
	command: ['create [projectName]', '$0'],
	describe: 'Creates a new project',
	handler
}

module.exports = CMD_CREATE
