let argv = require('minimist')(process.argv.slice(2))

let src = argv.src || argv._[0]

console.log(process.cwd())
