const delay = (ms) => async (ctx, next) => {
	await next()
	await new Promise(resolve => setTimeout(resolve, ms))
}

export { delay }
