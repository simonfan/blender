const aux = require('./auxiliary')

/**
 * Parses a given templateSource string into a template renderTemplateing
 * function.
 * 
 * @param  {String} templateSource
 * @param  {Array[String]} queries
 * @return {Function}
 */
const parseTemplate = (templateSource, queries) => {
	if (!templateSource) {
		throw new Error('templateSource is required')
	}

	if (!queries) {
		throw new Error('queries is required')
	}
	queries = Array.isArray(queries) ? queries : [queries]

	/**
	 * The root variable
	 * @type {String}
	 */
	let templateDataRootVariable = aux.randomVariableName()

	/**
	 * Specification of the data tokens
	 */
	let dataTokens = queries.map(query => {
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
	let dataMap = dataTokens.reduce((res, token) => {
		res[token.id] = token.name

		return res
	}, {})

	/**
	 * Escape special characters for js templating
	 */
	templateSource = templateSource.replace(/(\`|\$|\{|\})/g, '\\$1')

	/**
	 * Generate a template string using ES6 string literal syntax
	 * given the parseTemplated tokens
	 */
	let templateStr = dataTokens.reduce((res, token) => {
		token.query.formats.forEach(tokenQueryFormat => {
			let tokenQueryFormatRe = new RegExp(tokenQueryFormat.value, 'g')
			let tokenVariableStr = `${templateDataRootVariable}.${token.id}.${tokenQueryFormat.name}`

			res = res.replace(tokenQueryFormatRe, '${' + tokenVariableStr + '}' )
		})

		return res

	}, templateSource)

	/**
	 * The templating function that will renderTemplate the string.
	 * Takes the "root" data variable as first argument.
	 *
	 * Inspired by this:
	 * https://stackoverflow.com/questions/30003353/can-es6-template-literals-be-substituted-at-runtime-or-reused
	 * @type {Function}
	 */
	let templateFn = new Function(templateDataRootVariable, 'return `' + templateStr + '`')

	let renderTemplate = function (data) {
		// map the passed in data to the
		// random variable names
		data = aux.transposeObj(dataMap, data)

		// expand the values of the object
		// into all format variations
		data = aux.expandObj(data)

		return templateFn(data)
	}

	renderTemplate.str = templateStr
	renderTemplate.dataMap = dataMap
	renderTemplate.dataTokens = dataTokens

	return renderTemplate
}

/**
 * Shorthand for parsing and rendering the template
 * @param  {String} templateSource
 * @param  {Object} data
 * @return {String}
 */
const renderTemplate = (templateSource, data) => {
	let queries = Object.keys(data)

	return parseTemplate(templateSource, queries)(data)
}

module.exports = {
	parseTemplate,
	renderTemplate
}
