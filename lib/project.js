const fs = require('fs')
const path = require('path')
const { promisify } = require('util')

const git = require('nodegit')
const tmpDir = promisify(require('tmp').dir)
const vinyl = require('vinyl-fs')

const { blendVinylStream } = require('./blendVinylStream')

const readFile = promisify(fs.readFile)

const TEMPLATE_CONFIG_FILE_NAME = '.blendrc'

const NEW_LINE_RE = /\r?\n/
const DEFAULT_IGNORE = [
  '.git/**/*',
  TEMPLATE_CONFIG_FILE_NAME
]

const projectReadTemplateConf = projectRootPath => (
  readFile(path.join(projectRootPath, TEMPLATE_CONFIG_FILE_NAME), 'utf8')
    .then(config => {
      config = JSON.parse(config)
      config.ignore = config.ignore
        ? [...config.ignore, ...DEFAULT_IGNORE]
        : DEFAULT_IGNORE

      return config
    })
    .catch(err => {
      switch (err.code) {
        case 'ENOENT':
          return {
            ignore: DEFAULT_IGNORE
          }
        default:
          throw err
      }
    })
)

const projectCreateFromTemplate = (
  templateProjectPath,
  dest,
  data = {},
  options = {}
) => {
  return projectReadTemplateConf(templateProjectPath).then(config => {
    const PATTERNS = [
      '**/*',
      ...config.ignore.map(pattern => `!${pattern}`)
    ]

    const SRC_OPTIONS = {
      dot: true,
      cwd: templateProjectPath,
      nodir: true,
    }

    return new Promise((resolve, reject) => {
      const stream = vinyl.src(PATTERNS, SRC_OPTIONS)
        .pipe(blendVinylStream({
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
  projectReadTemplateConf,
  projectCreateFromTemplate
}
