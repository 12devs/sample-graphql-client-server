import Joi from 'joi'
import JoiObjectId from 'joi-objectid'
import { name } from './common'

Joi.objectId = JoiObjectId(Joi)

const createProject = Joi.object().options({ abortEarly: false }).keys({
	name,
	status: Joi.string().only(['PENDING', 'ACTIVE', 'PAUSED', 'CANCELLED']),
	apiKey: Joi.string().required(),
	inApiKey: Joi.string().guid(),
	fetchInterval: Joi.number().required().min(1).max(300).integer(),
	services: Joi.array(),
})

const updateProject = createProject

export { createProject, updateProject }
