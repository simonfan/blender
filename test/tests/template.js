const fs = require('fs')
const path = require('path')

const should = require('should')

const blender = require('../../')

// describe('.expand(query, queryType)', function () {
// 	it('should return array of all possible pattern-variations', function () {

// 		console.log(blender.query.expand('basic-dash-case-string'))

// 	})
// })

describe('.parse(templateSource, queries)', function () {
	it('should return template function', function () {

		let templateSource = fs.readFileSync(path.join(__dirname, '../fixtures/template.html'), 'utf8')

		let template = blender.template.parse(templateSource, [
			'some-variable',
			'some-other-variable',
		])

		console.log(template.str)
		console.log('==================')

		console.log(template({
			'some-variable': 'yetAnotherVariable',
			'some-other-variable': 'yetAnotherAgainVariable',
		}))

	})
})
