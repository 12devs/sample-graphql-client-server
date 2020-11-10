import joi from 'joi'

import User from '../db/models/User'
import rules from './common'

import { ValidationError } from '../utils/errors'

const LoginSchema = joi.object().keys({
	username: joi.alternatives([rules.username, rules.email]),
	password: joi.string().required(),
})

const RegisterSchema = LoginSchema.keys({
	role: rules.role,
	gender: rules.gender,
	passwordConfirm: joi.string().required().only(joi.ref('password')),
	email: rules.email,
})

RegisterSchema.async = async ({ username: userName, email }) => {
	const username = userName.toLowerCase()
	const user = await User.findOne({ $or: [{ username }, { email }] })
	if (!user) return

	const error = new ValidationError()

	if (user.username === username) {
		error.add('username', 'Username should be unique')
	}

	if (user.email === email) {
		error.add('email', 'Email should be unique')
	}

	throw error
}


export {
	LoginSchema,
	RegisterSchema,
}
