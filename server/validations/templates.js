import Joi from 'joi'
import { name } from './common'

const createTemplate = Joi.object().options({ abortEarly: false }).keys({
	name,
	columns: Joi.array(),
})

const updateTemplate = createTemplate

export { createTemplate, updateTemplate }
