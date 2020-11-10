'use strict'

require('babel-register')({
		presets: ['env'],
		plugins: [
			'transform-runtime',
			['babel-plugin-transform-builtin-extend', { globals: ['Error', 'Array'] }],
		],
})

require('./server')
