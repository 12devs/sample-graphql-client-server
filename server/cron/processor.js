import axios from 'axios'
import moment from 'moment'

import logger from '../utils/logger'

import Project from '../db/models/Project'
import Media from '../db/models/Media'
import Author from '../db/models/Author'

import { processServices } from '../services'

const getFetcher = apiKey => axios.create({
	baseURL: 'http://api.de/api/v2',
	// timeout: 1000,
	headers: {
		'Accept': 'application/json',
		'Accept-Encoding': 'gzip, deflate, sdch',
		'Accept-Language': 'de-DE,de;q=0.8,en-US;q=0.6,en;q=0.4',
		'Connection': 'keep-alive',
		'api_key': apiKey,
	},
})

const source = 'landau'

const storeMediaItem = async (item, project) => {
	let media = await Media.findOne({ externalId: item.Id })
	if (media) {
		const p = media.projects.find(x => x.equals(project._id))
		if (p) return false

		media.projects.push(project._id)

		return await media.save()
	}

	const authorData = {
		originalName: item.Inhalt.Autor,
		publicationName: (item.Publikation.Publikationsname || '').toLowerCase(),
		source,
	}
	let author = await Author.findOne(authorData)

	if (!author) {
		author = new Author(authorData)
		await author.save()
	}

	media = new Media({
		projects: [project._id],
		author: author._id,
		externalId: item.Id,
		mediaType: item.Medienart,
		publicationDate: item.Erscheinungsdatum,
		publicationName: item.Publikation.Publikationsname,
		contentHeadline: item.Inhalt.Headline,
		mediapageLink: item.MedienblattLink,
		previewLink: item.Previewlink,
		deepLink: item.Deeplink,
		importDate: item.Importdatum,
		source,
		raw: item,
		services: {},
	})

	media.services = await processServices(media, project)

	return await media.save()
}

const Processor = {
	isFetching: {},
	isProcessing: {},

	processMedia: async (projectId) => {
		logger.debug(`cron/processor|processMedia.start for Project: ${projectId}`)

		if (Processor.isProcessing[projectId]) {
			logger.debug('cron/processor|processMedia.skip')

			return true
		}

		Processor.isProcessing[projectId] = true

		try {
			const project = await Project.findById(projectId)
			if (project.status !== 'ACTIVE') {
				Processor.isProcessing[projectId] = false

				return true
			}

			const items = await Media.find(
				{
					projects: project._id,
					$or: project.services.map(x => ({ [`services.${x}`]: { $exists: false } })),
				},
				'_id externalId raw services'
			)
				.sort({ createdAt: -1 })
				.limit(10)

			// eslint-disable-next-line
			for (let i = 0; i < items.length; i++) {
				const item = items[i]

				item.services = await processServices(item, project)
				await item.save()
			}

			Processor.isProcessing[projectId] = false
		} catch (err) {
			Processor.isProcessing[projectId] = false
			logger.error('cron/processor|processMedia', { message: err.message })
			logger.debug(err)
			throw err
		}

		return true
	},

	fetchMedia: async (projectId) => {
		logger.debug(`cron/processor|fetchMedia.start for Project: ${projectId}`)

		if (Processor.isFetching[projectId]) {
			logger.debug('cron/processor|fetchMedia.skip')

			return true
		}

		Processor.isFetching[projectId] = true

		const project = await Project.findById(projectId)

		const fetcher = getFetcher(project.apiKey)
		const params = {
			typ: 'Importdatum',
			von: moment(project.lastFetch.lastImportDate).unix() + 1 || 0,
			page: 0,
		}
		// params.von++ // Adding one second to prevent reloading last imported article

		try {
			let totalCount = 0
			let lastImportDate = ''

			let response = { data: { NextPageLink: true } }
			while (response.data.NextPageLink) {
				logger.debug('cron/processor|fetchMedia Fetching Articles with params', params)
				response = await fetcher.get('/Articles', { params })
				if (response.status !== 200) throw new Error(response.statusText)

				logger.info('cron/processor|fetchMedia', `Page ${params.page}: Items ${response.data.Items.length}`)

				for (let item of response.data.Items) {
					const res = await storeMediaItem(item, project)
					totalCount += Boolean(res)
					lastImportDate = lastImportDate > item.Importdatum ? lastImportDate : item.Importdatum
				}

				params.page += 1

				// #HACK to prevent full media load
				// response.data.NextPageLink = false
			}

			project.lastFetch.date = new Date()
			project.lastFetch.status = 'SUCCESS'
			project.lastFetch.count = totalCount
			project.lastFetch.lastImportDate = lastImportDate
			await project.save()

			logger.info('cron/processor|fetchMedia', `Total items fetched: ${totalCount}`)
			Processor.isFetching[projectId] = false

			return totalCount
		} catch (err) {
			Processor.isFetching[projectId] = false
			logger.error('cron/processor|fetchMedia', { message: err.message })
			logger.debug(err)
			throw err
		}
	},
}

export default Processor
