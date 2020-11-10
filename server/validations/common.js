import joi from 'joi'

// shared validation rules
const email = joi.string().email({ minDomainAtoms: 2 }).required()
const username = joi.string().required().min(3).max(20).regex(/^[a-zA-Z0-9.]+$/)
const role = joi.string().only(['ADMIN', 'MANAGER', 'OPERATOR'])
const password = joi.string().min(6).required()
const name = joi.string().required().min(1)
const status = joi.string().only(['PENDING', 'ACTIVE', 'INACTIVE'])

export {
	email,
	password,
	name,
	status,
	username,
	role,
}
