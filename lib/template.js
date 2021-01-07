const aux = require('./auxiliary')
const nunjucks = require('nunjucks')

const VARIABLE_START_TAG = '<============================='
const VARIABLE_END_TAG =   '=============================>'

const NUNJUCKS_TEMPLATE_TAGS = {
  blockStart: `${VARIABLE_START_TAG}-`,
  blockEnd: `-${VARIABLE_END_TAG}`,
  variableStart: VARIABLE_START_TAG,
  variableEnd: VARIABLE_END_TAG,
  commentStart: `${VARIABLE_START_TAG}#`,
  commentEnd: `#${VARIABLE_END_TAG}`,
}

/**
 * Parses a given templateSource string into a template templateRendering
 * function.
 * 
 * @param  {String} templateSource
 * @param  {Array[String]} tokens
 * @return {Function}
 */
const templateParse = (templateSource, tokens) => {
	if (typeof templateSource !== 'string') {
		throw new Error('templateSource must be a String')
	}

	if (!tokens) {
		throw new Error('tokens is required')
	}
	tokens = Array.isArray(tokens) ? tokens : [tokens]

	/**
	 * Specification of the data tokens
	 */
	tokens = tokens.map(query => {
		query = aux.expandStr(query)

		/**
		 * Used uuid.v4 as variable names to minimize chances
		 * of naming conflicts or recursive substitutions
		 * in the template string.
		 *
		 * Normal code does not contain uuid.v4-like variables.
		 */
		return {
			id: aux.randomVariableName(),
			name: query.source,
			query: query,
		}
	})

	/**
	 * Object that maps token names to their
	 * ids (interpreted as actual variables inside the template)
	 */
	const dataMap = tokens.reduce((res, token) => {
		res[token.id] = token.name

		return res
	}, {})

	/**
	 * Generate a template string using ES6 string literal syntax
	 * given the templateParsed tokens
	 */
	const templateStr = tokens.reduce((res, token) => {
		token.query.formats.forEach(tokenQueryFormat => {
			const tokenQueryFormatRe = new RegExp(tokenQueryFormat.value, 'g')
			const tokenVariableStr = `${token.id}.${tokenQueryFormat.name}`

			res = res.replace(
				tokenQueryFormatRe,
				VARIABLE_START_TAG + tokenVariableStr + VARIABLE_END_TAG
			)
		})

		return res

	}, templateSource)

	const templateRender = data => {
		// For each one of the tokens,
		// set default values to empty string
		data = tokens.reduce((acc, token) => ({
			...acc,
			[token.name]: data[token.name] || ''
		}), data)

		// map the passed in data to the
		// random variable names
		data = aux.transposeObj(dataMap, data)

		// expand the values of the object
		// into all format variations
		data = aux.expandObj(data)

		const rendererEnv = new nunjucks.Environment(null, {
		  tags: NUNJUCKS_TEMPLATE_TAGS
		})

		return rendererEnv.renderString(templateStr, data)
	}

	return templateRender
}

/**
 * Shorthand for parsing and rendering the template
 * @param  {String} templateSource
 * @param  {Object} data
 * @return {String}
 */
const templateRender = (templateSource, data) => {
	const tokens = Object.keys(data)

	return templateParse(templateSource, tokens)(data)
}

module.exports = {
	templateParse,
	templateRender
}
