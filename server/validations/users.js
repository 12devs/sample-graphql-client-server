import Joi from 'joi'
import JoiObjectId from 'joi-objectid'
import { password, email, name, status } from './common'

Joi.objectId = JoiObjectId(Joi)

const loginUser = Joi.object().options({ abortEarly: false }).keys({
	email,
	password,
})

const createUser = Joi.object().options({ abortEarly: false }).keys({
	name,
	email,
	password,
	status,
	isAdmin: Joi.any(),
})

const updateUser = Joi.object().options({ abortEarly: false }).keys({
	name,
	email,
	status,
	isAdmin: Joi.any(),
})

const changePass = Joi.object().options({ abortEarly: false }).keys({
	id: Joi.objectId(),
	oldPassword: password,
	newPassword: password,
})
 export { createUser, loginUser, updateUser, changePass }
