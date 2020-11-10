import cron from 'cron'

import processor from './processor'
import logger from '../utils/logger'

import Project from '../db/models/Project'

let jobs = {}

const runAction = async (action, params) => {
	logger.debug('cron.runAction', { action })
	try {
		const result = await processor[action](...params)
		logger.info(`cron.runAction.success: Task ${action} is successfully completed`, result)

		return true
	} catch (err) {
		logger.error(`cron.runAction.error: ${err.message}`)

		return false
	}
}

const setupJob = (period, apiKey) => new cron.CronJob(
	`0 */${period} * * * *`,
	() => runAction('fetchMedia', apiKey),
	null, true, 'UTC'
)

const rescheduleJobs = async () => {
	Object.keys(jobs).forEach(x => jobs[x].stop())

	const projects = await Project.find({ status: 'ACTIVE' })
	projects.forEach(x => {
		if (!x.apiKey) {
			logger.error(`Active project w/o API key found. ID: ${x._id}`)
			return false
		}

		logger.debug(`Schedule project ${x.name} with interval ${x.fetchInterval} minutes`)
		jobs[x._id] = setupJob(x.fetchInterval, [x._id])
		return true
	})

	return jobs
}

// eslint-disable-next-line
const processMedia = new cron.CronJob(
	`0 */5 * * * *`,
	() => runAction('processMedia', ['5b80022cbfcf62000fe3e36c']),
	null, true, 'UTC'
)


export { rescheduleJobs }
