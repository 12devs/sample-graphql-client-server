import mongoose from 'mongoose'

import logger from '../utils/logger'
import {} from '../config'

mongoose.Promise = global.Promise
const promise = mongoose.connect(process.env.MONGODB, {
	useNewUrlParser: true,
	reconnectTries: Number.MAX_VALUE,
	reconnectInterval: 1000,
	useCreateIndex: true,
})

// mongoose.set('debug', true)
mongoose.set('debug', (collectionName, method, query, doc) => {
	logger.log('info', `${collectionName}.${method}(${JSON.stringify(query)}, ${JSON.stringify(doc)})`, { tags: ['mongoose'] })
})

export { mongoose as default, promise }
