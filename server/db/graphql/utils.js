import moment from 'moment'
import { SevenBoom } from 'graphql-apollo-errors'

import Author from '../models/Author'
import Project from '../models/Project'
import User from '../models/User'

const buildQueryLine = async (paramName, value) => {
	const [entity, ...path] = paramName.split('.')
	const fieldName = path.join('.')

	if (entity === 'author') {
		const authors = await Author.find({ [fieldName]: { $regex: value, $options: 'i' } }, '_id', { lean: true })

		return { [entity]: { $in: authors.map(x => x._id) } }
	}
	if (entity === 'projects') {
		const projects = await Project.find({ [fieldName]: { $regex: value, $options: 'i' } }, '_id', { lean: true })

		return { [entity]: { $in: projects.map(x => x._id) } }
	}
	if (entity === 'isAdmin') {
		return { [entity]: value }
	}

	if (entity === 'publicationDate') {
		const range = JSON.parse(value)

		const startDate = moment.utc(range.startDate, 'X')
		const endDate = moment.utc(range.endDate, 'X')

		return { [entity]: {
			$gte: startDate,
			$lte: endDate,
		} }
	}

	return { [paramName]: { $regex: value, $options: 'i' } }
}

const buildQuery = async (filtered) => {
	let query = {}
	for (let i in filtered) {
		if (Reflect.has(filtered, i)) {
			const filter = filtered[i]
			const queryLine = await buildQueryLine(filter.id, filter.value)
			query = Object.assign(query, queryLine)
		}
	}

	return query
}

const getLoggedUser = async (ctx) => {
	if (!ctx.state.user) return null

	return await User.findById(ctx.state.user._id)
}

const checkAuth = async (ctx, throwError = false) => {
	const user = await getLoggedUser(ctx)
	if (!user && throwError) throw SevenBoom.unauthorized('You are not authorized', null, {}, 'UNAUTHORIZED')

	return user
}

export { buildQuery, checkAuth }
