import { parseString } from 'xml2js'

import logger from '../utils/logger'

import googleNLP from './googleNLP'
import amazonComprehend from './amazonComprehend'
import azureTextAnalytics from './azureTextAnalytics'

const nlpMethods = {
	google: googleNLP,
	amazon: amazonComprehend,
	azure: azureTextAnalytics,
}

const getContent = (item) => new Promise((resolve, reject) => {
	if (item.raw.Inhalt.Text) return resolve(item.raw.Inhalt.Text)

	const xml = item.raw.Inhalt.Artikeldokument
	if (!xml) return resolve(item.raw.Inhalt.Previewtext)

	return parseString(xml, (err, result) => {
		if (err) return reject(err)

		if (typeof result.data === 'string') {
			return resolve(result.data)
		}

		if (result.data.headline) {
			return resolve(result.data.rawtext[0]._)
		}

		return reject(new Error(`Unknown Artikeldokument format for item externalId: ${item.externalId}`))
	})
})

const processServices = async (item, project) => {
	if (!project.services.length) return {}

	logger.log('debug', `getting text analys for item, ${JSON.stringify({ externalId: item.externalId })}`, { tags: ['services', ...project.services] })
	const language = item.raw.Sprache
	const content = await getContent(item)

	const services = {}
	// eslint-disable-next-line
	for (let i = 0; i < project.services.length; i++) {
		const service = project.services[i]
		logger.log('debug', `getting text analys by ${service}`, { tags: ['services', service] })
		try {
			services[service] = await nlpMethods[service](content, language)
		} catch (err) {
			logger.error(err)
			logger.log('error', err.message, { tags: ['services', service] })
			services[service] = err.message
		}
	}

	return services
}

export {
	getContent, processServices,
	googleNLP, amazonComprehend, azureTextAnalytics,
}
