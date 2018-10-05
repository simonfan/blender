const CMD_GET = {
	command: 'get <config>',
	describe: 'Read a configuration',
	handler: argv => {
		console.log('get', argv)
	}
}

module.exports = CMD_GET
