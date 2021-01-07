const {
  expandStr,
  expandObj
} = require('./auxiliary')

describe('expandStr', () => {
  test('', () => {
    expect(expandStr('projectName')).toEqual({
      source: 'projectName',
      formats: [
        { name: 'camelcase', value: 'projectName' },
        { name: 'pascalcase', value: 'ProjectName' },
        { name: 'dashed', value: 'project-name' },
        { name: 'underscored', value: 'project_name' },
        { name: 'underscored_uppercase', value: 'PROJECT_NAME' },
        { name: 'spaced', value: 'project name' },
        { name: 'humanized', value: 'Project name' },
        { name: 'titleized', value: 'Project Name' }
      ]
    })
  })
})

describe('expandObj', () => {
  test('', () => {
    expect(expandObj({
      projectName: 'Some project',
      actionName: 'My Custom Action'
    }))
    .toEqual({
      projectName: {
        camelcase: 'someProject',
        pascalcase: 'SomeProject',
        dashed: 'some-project',
        underscored: 'some_project',
        underscored_uppercase: 'SOME_PROJECT',
        spaced: 'some project',
        humanized: 'Some project',
        titleized: 'Some Project'
      },
      actionName: {
        camelcase: 'myCustomAction',
        pascalcase: 'MyCustomAction',
        dashed: 'my-custom-action',
        underscored: 'my_custom_action',
        underscored_uppercase: 'MY_CUSTOM_ACTION',
        spaced: 'my custom action',
        humanized: 'My custom action',
        titleized: 'My Custom Action'
      }
    })
  })
})
