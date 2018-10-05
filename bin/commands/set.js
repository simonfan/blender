const { ensureConfig, writeConfig } = require('../config')
const camelcase = require('camelcase')

const CMD_SET = {
	command: 'set <configName> <configValue>',
	describe: 'Set a configuration',
	handler: ({ configName, configValue }) => {
		ensureConfig().then(config => {
			configName = camelcase(configName)

			return writeConfig({
				...config,
				[configName]: configValue
			})
		})
	}
}

module.exports = CMD_SET
