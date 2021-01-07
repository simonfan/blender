const { templateParse, templateRender } = require('./template')

describe('template', () => {

  test('templateParse(src, tokens)', () => {
    const render = templateParse('Lorem ipsum sourceKey dolor sit amet', [
      'source-key',
      'source-other-key',
    ])

    expect(render).toBeInstanceOf(Function)
    expect(render({
      'source-key': 'final-key',
    })).toEqual('Lorem ipsum finalKey dolor sit amet')
  })

  test('templateRender(src, data)', () => {
    const TEMPLATE_SRC = `
      // source-key
      source-key-A
      sourceKeyB
      source_key_C
      SOURCE_KEY_D

      // source-other-key
      source-other-key-A
      sourceOtherKeyB
      source_other_key_C
      SOURCE_OTHER_KEY_D

      // source-yet-another-key
      source-yet-another-key-A
      sourceYetAnotherKeyB
      source_yet_another_key_C
      SOURCE_YET_ANOTHER_KEY_D

      // source-other-string (should not be modified)
      source-other-string-A
      sourceOtherStringB
      source_other_string_C
      SOURCE_OTHER_STRING_D
    `


    const result = templateRender(TEMPLATE_SRC, {
      'source-key': 'dash-value',
      'source-other-key': 'underscored_value',
      'source-yet-another-key': 'camelcaseValue',
    })

    expect(result).toEqual(`
      // dash-value
      dash-value-A
      dashValueB
      dash_value_C
      DASH_VALUE_D

      // underscored-value
      underscored-value-A
      underscoredValueB
      underscored_value_C
      UNDERSCORED_VALUE_D

      // camelcase-value
      camelcase-value-A
      camelcaseValueB
      camelcase_value_C
      CAMELCASE_VALUE_D

      // source-other-string (should not be modified)
      source-other-string-A
      sourceOtherStringB
      source_other_string_C
      SOURCE_OTHER_STRING_D
    `)
  })
})