import _get from 'lodash/get'
import getFieldNames from 'graphql-list-fields'

import { buildQuery, checkAuth } from '../utils'

import Media from '../../models/Media'
import Project from '../../models/Project'

const MEDIA_TYPE_RADIO = 'Hörfunk'

export default {
	Query: {
		media: async (_, { id }, ctx) => {
			await checkAuth(ctx)
			return await Media.findById(id).populate('projects')
		},
		medias: async (_, { page, pageSize, sorted, filtered }, ctx, info) => {
			const user = await checkAuth(ctx)

			// eslint-disable-next-line
			page = Math.max(page, 0)

			const where = await buildQuery(filtered)

			// Avoid to load data for projects user has not access to
			let userProjectIds = []
			if (user.isAdmin) {
				const projects = await Project.find({ status: 'ACTIVE' })
				userProjectIds = projects.map(x => x._id)
			} else {
				userProjectIds = user.projects.map(x => x.project)
			}

			if (typeof where.projects !== 'undefined' && typeof where.projects.$in !== 'undefined') {
				where.projects.$in = where.projects.$in.filter(x => userProjectIds.find(y => y.equals(x)))
			} else {
				where.projects = { $in: userProjectIds }
			}

			const total = await Media.countDocuments(where)
			const pages = Math.ceil(total / pageSize)

			const query = Media.find(where)

			const fields = getFieldNames(info)
			if (fields.includes('docs.author.__typename')) {
				query.populate('author')
			}
			if (fields.includes('docs.projects.__typename')) {
				query.populate('projects')
			}

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
	Media: {
		link: media => (media.mediaType === MEDIA_TYPE_RADIO ? media.previewLink : media.deepLink),
		hasGoogleNlp: media => Boolean(_get(media, 'services.google', false)),
		hasAmazon: media => Boolean(_get(media, 'services.amazon', false)),
		hasAzure: media => Boolean(_get(media, 'services.azure', false)),
		sentiment: media => _get(media, 'services.google.documentSentiment', false),
	},
}
