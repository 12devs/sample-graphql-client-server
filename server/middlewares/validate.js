import joi from 'joi'
import { ValidationError } from '../utils/errors'

const validateSchema = (schema, data) => new Promise((resolve, reject) => {
	joi.validate(data, schema, { stripUnknown: true }, async (err, value) => {
		const error = new ValidationError()
		if (schema.async) {
			try {
				await schema.async(value)
			} catch (e) {
				if (!e.details) throw e
				error.merge(e.details)
			}
		}

		if (err) error.merge(err.details)
		if (error.details.length) {
			reject(error)
		} else {
			resolve(value)
		}
	})
})

const validate = (schema) => async (ctx, next) => {
	await validateSchema(schema, ctx.request.body)

	return await next()
}

export default validate
