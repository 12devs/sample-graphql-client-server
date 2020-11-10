import { createReadStream } from 'fs'
import Router from 'koa-router'
import { graphqlKoa, graphiqlKoa } from 'apollo-server-koa'
import { addErrorLoggingToSchema } from 'graphql-tools'
import { SevenBoom, formatErrorGenerator } from 'graphql-apollo-errors'
import jwt from 'koa-jwt'

import GraphQLSchema from '../db/graphql'
import { delay } from '../middlewares/devtools'
import logger from '../utils/logger'
import db from '../db'

const formatErrorOptions = {
	logger,
	// Only data under this path in the data object will be sent to the client (path parts should be separated by . - some.public.path)
	// publicDataPath: 'public',
	// whether to add the graphql locations to the final error (default false)
	showLocations: true,
	// whether to add the graphql path to the final error (default false)
	showPath: true,
	// whether to remove the data object from internal server errors (default true)
	hideSensitiveData: false,
	hooks: {
		// This run on the error you really throw from your code (not the graphql error - it means not with path and locations)
		onOriginalError: (originalError) => logger.debug(originalError),
		// This will run on the processed error, which means after we convert it to boom error if needed
		// and after we added the path and location (if requested)
		// If the error is not a boom error, this error won't include the original message but general internal server error message
		// This will run before we take only the payload and the public path of data
		onProcessedError: (processedError) => logger.warn(processedError),
		// This will run on the final error, it will only contains the output.payload, and if you configured the publicDataPath
		// it will only contain this data under the data object
		// If the error is internal error this error will be a wrapped internal error which not contains the sensitive details
		// This is the error which will be sent to the client
		onFinalError: (finalError) => logger.info(finalError),
	},
	nonBoomTransformer: error => SevenBoom.badImplementation(error),
	// Optional function to transform non-Boom errors, such as those from Apollo & other 3rd-party libraries, into Boom errors
	// nonBoomTransformer1: error => (error instanceof GraphQLError ? SevenBoom.badRequest(error.message) : SevenBoom.badImplementation(error)),
}
const formatError = formatErrorGenerator(formatErrorOptions)

const router = new Router()
const isDev = process.env.NODE_ENV !== 'production'

let delayInterval = 1
if (isDev) {
	addErrorLoggingToSchema(GraphQLSchema, console)
	router.get('/graphiql', graphiqlKoa({ endpointURL: '/graphql' }))
	delayInterval = 2
}

const auth = jwt({
	secret: process.env.JWT_SECRET,
	credentialsRequired: false,
	passthrough: true,
})

const checkDb = () => async (ctx, next) => {
	if (db.connection.readyState) return await next()

	return ctx.throw(500, 'Database is not reachable')
}

router.all('/graphql', auth, checkDb(), delay(delayInterval), graphqlKoa(ctx => ({
	schema: GraphQLSchema,
	context: ctx,
	debug: isDev,
	formatError,
})))

router.get('/500', async ctx => {
	ctx.type = 'html'
    ctx.body = createReadStream(`${__dirname}/../pages/500.html`)
})
router.get('/404', async ctx => {
	ctx.type = 'html'
    ctx.body = createReadStream(`${__dirname}/../pages/404.html`)
})

router.get('/*', async ctx => {
	ctx.type = 'html'
    ctx.body = createReadStream(`${__dirname}/../../client/dist/index.html`)
})

export default router
