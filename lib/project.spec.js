const { promisify } = require('util')
const fs = require('fs')
const path = require('path')
const rimraf = promisify(require('rimraf'))

const {
  projectReadTemplateConf,
  projectCreateFromTemplate,
} = require('./project')

const TMP_DIR = path.join(__dirname, '../tmp')
const TEMPLATE_PROJECT_PATH = path.join(__dirname, '../spec/sample-project')

describe('projectReadTemplateConf', () => {
  test('', () => {

    return expect(projectReadTemplateConf(TEMPLATE_PROJECT_PATH)).resolves.toEqual({
      ignore: [
        'ignored_dir/**/*',
        'ignored_file.txt',
        '**/*.ignored_ext',
        '.git/**/*',
        '.blendrc'
      ]
    })
  })
})

describe('projectCreateFromTemplate', () => {
  beforeEach(() => rimraf(TMP_DIR))

  test('', () => {

    const DEST_DIR = path.join(TMP_DIR, 'test-project')

    return projectCreateFromTemplate(
      TEMPLATE_PROJECT_PATH,
      DEST_DIR,
      {
        projectName: 'test-project',
        actionName: 'someAction',
        afterButton: 'SomeThingAfter'
      }
    )
    .then(() => {
      const rootFiles = fs.readdirSync(DEST_DIR)
      const srcFiles = fs.readdirSync(path.join(DEST_DIR, 'src'))

      expect(rootFiles).toEqual([
        '.gitignore',
        'package.json',
        'src'
      ])

      expect(srcFiles).toEqual([
        'index.html',
        'script.js',
        'style.css'
      ])
    })
  })
})
