#!/usr/bin/env node
const yargs = require('yargs')

yargs.command(require('./commands/create'))
yargs.command(require('./commands/get'))
yargs.command(require('./commands/set'))

yargs.argv
