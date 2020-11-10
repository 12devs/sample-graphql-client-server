import winston from 'winston'
import { Loggly } from 'winston-loggly-bulk'

const logger = winston.createLogger({
	level: 'silly',
	exitOnError: false,
})
const env = process.env.NODE_ENV || 'development'

if (env === 'development') {
	const format = winston.format.combine(
		winston.format.colorize(),
		winston.format.simple(),
		winston.format.timestamp(),
		winston.format.align(),
	)
	logger.add(new winston.transports.Console({ format }))
} else {
	const options = {
		token: '',
		subdomain: 'eee',
		tags: ['lmax', 'backend', env],
		json: true,
		stripColors: true,
	}
	logger.add(new Loggly(options))
}

export default logger
