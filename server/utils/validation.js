import joi from 'joi'
import { SevenBoom } from 'graphql-apollo-errors'

const hasErrors = (data, schema) => {
  const result = joi.validate(data, schema, { stripUnknown: true })

  return result.error
}

const validate = (data, schema) => {
  const error = hasErrors(data, schema)

  if (error) throw error

  return true
}

const validateJoi = (data, schema) => joi.validate(data, schema, (err) => {
	if (err) {
		const errorInfo = err.details
			.reduce((all, c) => Object.assign(all, { [c.context.key]: [c.message] }), {})
		throw SevenBoom.badRequest('Incorrect input', errorInfo)
	}
})

export {
	validateJoi,
	hasErrors,
	validate,
}
