#!/usr/bin/env node
const yargs = require('yargs')

yargs.command(require('./commands/create'))

yargs.argv
