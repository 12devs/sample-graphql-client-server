import path from 'path'
import Koa from 'koa'
import serve from 'koa-static'
import mount from 'koa-mount'
import bodyparser from 'koa-bodyparser'
import helmet from 'koa-helmet'
import koaLogger from 'koa-logger-winston'
import omit from 'lodash/omit'

import logger from './utils/logger'
import routes from './routes'
import { rescheduleJobs } from './cron'
import apiSetup from './api'

const bodyOptions = {
	multipart: true,
	jsonLimit: '10gb',
	// formidable: {
	// 	uploadDir: config.temp,
	// }
}

const app = new Koa()
app.use(helmet())
app.use(koaLogger(logger))
// app.use(range)
app.use(bodyparser(bodyOptions))

// Static
app.use(mount('/dist', serve(path.resolve(path.join(__dirname, '../client/dist')))))
app.use(mount('/assets', serve(path.resolve(path.join(__dirname, '../client/assets')))))

const errorsMiddleware = async (ctx, next) => {
	try {
		await next()
	} catch (err) {
		const ignoreFields = ['message', 'status', 'statusCode', 'expose', 'name']

		ctx.status = err.status || 500
		ctx.body = Object.assign(omit(err, ignoreFields), {
			error: err.message,
		})

		if (ctx.status >= 500) {
			ctx.app.emit('error', err, ctx)
		}
	}
}

app.use(errorsMiddleware)

apiSetup(app)

app.use(routes.routes())

rescheduleJobs()

export default app
