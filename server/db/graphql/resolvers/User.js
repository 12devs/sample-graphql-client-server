import jwt from 'jsonwebtoken'
import pick from 'lodash/pick'
import dotenv from 'dotenv'
import getFieldNames from 'graphql-list-fields'
import { SevenBoom } from 'graphql-apollo-errors'
import { validateJoi } from '../../../utils/validation'

import User from '../../models/User'
import { buildQuery, checkAuth } from '../utils'
import { createUser, loginUser, updateUser, changePass } from '../../../validations/users'
import nodeMailer from 'nodemailer'
import logger from '../../../../client/src/logger'
dotenv.config()

export default {
	Query: {
		me: async (_, args, ctx, info) => {
			const user = await checkAuth(ctx, false)
			if (!user) return null

			const query = User.findById(user._id)
			const fields = getFieldNames(info)
			if (fields.includes('projects.project.__typename')) query.populate('projects.project')

			return await query
		},
		user: async (_, { id }, ctx, info) => {
			await checkAuth(ctx)
			// @TODO: ay p2 - user should has access here - for selector

			const query = User.findById(id)
			const fields = getFieldNames(info)
			if (fields.includes('projects.project.__typename')) query.populate('projects.project')

			return await query
		},
		users: async (_, args, ctx, info) => {
			await checkAuth(ctx)
			// @TODO: ay p2 - user should has access here - for selector

			const query = User.find()
			const fields = getFieldNames(info)
			if (fields.includes('projects.project.__typename')) query.populate('projects.project')

			return await query
		},
		usersPaginated: async (_, { page, pageSize, sorted, filtered }, ctx, info) => {
			const user = await checkAuth(ctx)
			if (!user.isAdmin) {
				throw SevenBoom.forbidden('Sorry you have no access to this resource', {}, 'FORBIDDEN')
			}

			// eslint-disable-next-line
			page = Math.max(page, 0)

			const where = await buildQuery(filtered)
			// Avoid to load data for projects user has not access to
			if (!user.isAdmin) {
				if (typeof where.projects !== 'undefined' && typeof where.projects.$in !== 'undefined') {
					where.projects.$in = where.projects.$in.filter(x => user.projects.find(y => y.project.equals(x)))
				} else {
					where.projects = { $in: user.projects.map(x => x.project) }
				}
			}
			where.isAdmin = false

			const total = await User.countDocuments(where)
			const pages = Math.ceil(total / pageSize)

			const query = User.find(where)

			const fields = getFieldNames(info)
			if (fields.includes('docs.projects.__typename')) query.populate('projects')

			query
				.sort(sorted.reduce((acc, sort) => Object.assign(acc, { [sort.id]: sort.desc ? -1 : 1 }), {}))
				.limit(pageSize)
				.skip(page * pageSize)

			return {
				docs: await query,
				meta: { page, pageSize, total, pages },
			}
		},
	},
	Mutation: {
		login: async (_, { email, password }, ctx, info) => {
			validateJoi({ email, password }, loginUser)
			const user = await User.findOne({ email })
			if (!user) {
				throw SevenBoom.badRequest('Incorrect credentials')
			}

			const isValidPassword = await user.comparePassword(password)
			if (!isValidPassword) {
				throw SevenBoom.badRequest('Unable to login', { password: 'Incorrect password' })
			}

			if (!user.isActive()) {
				throw SevenBoom.badRequest('Unable to login', { email: 'Sorry your account is not approved yet' })
			}

			const token = jwt.sign(pick(user, ['_id']), process.env.JWT_SECRET)

			// @TODO: ay p2 - refactor this
			const query = User.findById(user._id)
			const fields = getFieldNames(info)
			if (fields.includes('user.projects.project.__typename')) query.populate('projects.project')

			return {
				user: await query,
				token,
			}
		},
		logout: async () => 'bye',
		userCreate: async (_, { data }, ctx) => {
			validateJoi(data, createUser)
			const me = await checkAuth(ctx)
			if (!me.isAdmin) {
				throw SevenBoom.forbidden('Sorry you have no access to this operations', {}, 'FORBIDDEN')
			}

			const existingUser = await User.findOne({ email: data.email })
			if (existingUser) {
				throw SevenBoom.badRequest('Email already taken', { email: 'Please specify different email' })
			}
			const transporter = nodeMailer.createTransport({
				auth: {
				},
			})
			const host = process.env.VIRTUAL_HOST
			const mailOptions = {
				from: 'L<t@zoho.com>',
				to: data.email,
				subject: 'Registration',
				html: `<html title="Registration">
						<h1>Hello ${data.name}</h1>
						<p>Registration was successful. Please sign in your profile and change password</p>
						<h3>Email: ${data.email}</h3><h3>Password: ${data.password}</h3>
						<a href="${host}">Log in</a>
						</html>`,
			}
			transporter.sendMail(mailOptions, (error, info) => {
				if (error) {
					logger.error(error)
				}

				logger.debug('Message sent: %s', info.messageId)
			})

			const user = new User(pick(data, 'name', 'email', 'isAdmin', 'status'))
			user.password = await User.hashPassword(data.password)
			await user.save()

			return user
		},
		userUpdate: async (_, { id, data }, ctx) => {
			validateJoi(data, updateUser)
			const me = await checkAuth(ctx)
			if (!me.isAdmin && !me._id.equals(id)) {
				throw SevenBoom.forbidden('Sorry you have no access to this operations', {}, 'FORBIDDEN')
			}

			const user = await User.findById(id)
			if (!user) {
				throw SevenBoom.notFound(`User ID ${id} not found`, { id })
			}

			// Do not update password field - use special method
			Reflect.deleteProperty(data, 'password')

			//@TODO: ay p1 - check allowed columns
			const updated = await User.findByIdAndUpdate(id, data, { new: true })

			return updated
		},
		userChangePassword: async (_, { id, oldPassword, newPassword }, ctx) => {
			validateJoi({ id, oldPassword, newPassword }, changePass)
			const me = await checkAuth(ctx)
			if (!me.isAdmin && !me._id.equals(id)) {
				throw SevenBoom.forbidden('Sorry you have no access to this operations', {}, 'FORBIDDEN')
			}

			const user = await User.findById(id)
			if (!user) {
				throw SevenBoom.notFound(`User ID ${id} not found`, { id })
			}

			const isValidPassword = await user.comparePassword(oldPassword)
			if (!isValidPassword) {
				throw SevenBoom.badRequest('Unable change password', { 'oldPassword': 'Incorrect password' })
			}
			if (user.status === 'PENDING') {
				user.status = 'ACTIVE'
			}
			const updateData = { password: await User.hashPassword(newPassword), status: user.status }
			await User.updateOne({ _id: id }, updateData)

			return 'Password has been updated'
		},
		userDelete: async (_, { id }, ctx) => {
			const me = await checkAuth(ctx)
			if (!me.isAdmin) {
				throw SevenBoom.forbidden('Sorry you have no access to this operations', {}, 'FORBIDDEN')
			}

			if (me._id === id) {
				throw SevenBoom.badRequest('To delete your own account please ask Admin')
			}

			const user = await User.findById(id)
			if (!user) {
				throw SevenBoom.notFound(`User ID ${id} not found`, { id })
			}

			await User.deleteOne({ _id: id })

			return id
		},
		userAddProject: async (_, { userId, projectId, role }, ctx, info) => {
			const me = await checkAuth(ctx)
			if (!me.isAdmin) {
				throw SevenBoom.forbidden('Sorry you have no access to this operations', {}, 'FORBIDDEN')
			}

			const user = await User.findById(userId)
			const userProject = user.projects.find(x => x.project.equals(projectId))
			if (userProject) throw SevenBoom.badRequest(`User already has access to this project as ${userProject.role}`, { projectId })

			user.projects.push({ project: projectId, role })
			await user.save()

			const query = User.findById(userId)
			const fields = getFieldNames(info)
			if (fields.includes('projects.project.__typename')) query.populate('projects.project')

			return await query
		},
		userUpdateProject: async (_, { userId, projectId, role }, ctx, info) => {
			const me = await checkAuth(ctx)
			if (!me.isAdmin) {
				throw SevenBoom.forbidden('Sorry you have no access to this operations', {}, 'FORBIDDEN')
			}

			const user = await User.findById(userId)

			const index = user.projects.findIndex(x => x.project.equals(projectId))
			if (index < 0) throw SevenBoom.badRequest('User has no access to this project', { projectId })

			user.projects[index].role = role
			await user.save()

			const query = User.findById(userId)
			const fields = getFieldNames(info)
			if (fields.includes('projects.project.__typename')) query.populate('projects.project')

			return await query
		},
		userRemoveProject: async (_, { userId, projectId }, ctx, info) => {
			const me = await checkAuth(ctx)
			if (!me.isAdmin) {
				throw SevenBoom.forbidden('Sorry you have no access to this operations', {}, 'FORBIDDEN')
			}

			const user = await User.findById(userId)
			user.projects = user.projects.filter(x => !x.project.equals(projectId))
			await user.save()

			const query = User.findById(userId)
			const fields = getFieldNames(info)
			if (fields.includes('projects.project.__typename')) query.populate('projects.project')

			return await query
		},
	},
}
