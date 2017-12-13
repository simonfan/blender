const camelcase = require('camelcase')
const decamelize = require('decamelize')
const cryptoRandomString = require('crypto-random-string')

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('')

const BASIC_FORMATS = [
	{
		name: 'camelcase',
		fn: (str) => {
			return camelcase(str)
		}
	},
	{
		name: 'dashed',
		fn: (str) => {
			return decamelize(camelcase(str), '-')
		}
	},
	{
		name: 'underscored',
		fn: (str) => {
			return decamelize(camelcase(str), '_')
		}
	}
]

/**
 * Expands a dash-based-string to possible variations:
 * - camelcase: dashBasedString
 * - underscore: dash_based_string
 */
function expandStr(source, formats) {
	formats = formats || []
	
	return {
		source: source,
		formats: BASIC_FORMATS.concat(formats).map(format => {
			return {
				name: format.name,
				value: format.fn(source),
			}
		}),
	}

}

/**
 * Expands all object values into their respective values
 */
function expandObj(data) {
	return Object.keys(data).reduce((res, key) => {
		res[key] = expandStr(data[key]).formats.reduce((res, format) => {
			res[format.name] = format.value

			return res
		}, {})

		return res
	}, {})
}

/**
 * Generates a random variable name that starts with a letter.
 */
function randomVariableName() {
	let randomLetter = ALPHABET[Math.floor(Math.random() * ALPHABET.length)]

	// ensure the variable name starts with a letter
	// so that it is valid
	return randomLetter + cryptoRandomString(10)
}

/**
 * Copies data from the data object in order
 * to generate an object with the format of the given map.
 * @param  {Object} map
 * @param  {Object} data
 */
function transposeObj(map, data) {
	// map data to the respective token ids
	return Object.keys(map).reduce((res, key) => {
		res[key] = data[map[key]]

		return res
	}, {})
}

exports.expandStr = expandStr
exports.expandObj = expandObj
exports.transposeObj = transposeObj
exports.randomVariableName = randomVariableName
