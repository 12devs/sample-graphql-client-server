const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')

const environment = process.env.NODE_ENV || 'development'

const plugins = [
	new CleanWebpackPlugin(['client/dist']),
	new HtmlWebpackPlugin({
		filename: 'dist/index.html',
		title: 'Development',
		template: 'index.ejs',
	}),
]

if (environment === 'development') {
	const WebpackNotifier = require('webpack-notifier')
	plugins.push(new WebpackNotifier({ title: 'Webpack LMAx', alwaysNotify: true }))
}

// const ExtractCSS = new ExtractTextPlugin('[name]')

module.exports = {
	entry: {
		'app': path.join(__dirname, '/client/src/index.js'),
		// print: './client/print.js',
		// 'app.css': path.join(__dirname, '/client/assets/sass/app.scss'),
		'vendors.react': [
			'react',
			'react-dom',
			'react-router-dom',

			'simple-console-logger',
			'recompose',
		],
		'vendors.ui': [
			'react-table',
			'reactstrap',
			'react-dates',
		],
		'vendors.apollo': [
			'react-apollo',
			'apollo-cache-inmemory',
			'apollo-client',
			'apollo-link',
			'apollo-link-error',
			'apollo-link-http',
			'apollo-link-retry',
			'graphql-tag',
		],
		'vendors.other': [
			'moment',
			'sweetalert2',
		],
	},
	optimization: {
		splitChunks: {
			cacheGroups: {
				'vendors.react': {
					chunks: 'initial',
					name: 'vendors.react',
					test: 'vendors.react',
					enforce: true,
				},
				'vendors.apollo': {
					chunks: 'initial',
					name: 'vendors.apollo',
					test: 'vendors.apollo',
					enforce: true,
				},
				'vendors.other': {
					chunks: 'initial',
					name: 'vendors.other',
					test: 'vendors.other',
					enforce: true,
				},
			},
		},
		runtimeChunk: true,
	},
	devtool: 'inline-source-map',
	devServer: {
		contentBase: path.join(__dirname, '/client/dist'),
	},
	plugins: plugins,
	output: {
		filename: 'dist/[name].[chunkhash].js',
		path: path.join(__dirname, 'client'),
		publicPath: '/',
	},
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				loader: 'babel-loader',
				query: {
					presets: ['env', 'react'],
					plugins: [
						'transform-class-properties',
						'transform-object-rest-spread',
						[
							'transform-runtime', {
								'polyfill': false,
								'regenerator': true,
							},
						],
					],
				},
			},
			{
				test: /\.(graphql|gql)$/,
				exclude: /node_modules/,
				loader: 'graphql-tag/loader',
			},
			{
				// For all .css files except from node_modules
				test: /\.css$/,
				exclude: /node_modules/,
				use: [
					'style-loader',
					{ loader: 'css-loader', options: { modules: true } },
				],
			},
			{
				// For all .css files in node_modules
				test: /\.css$/,
				include: /node_modules/,
				use: ['style-loader', 'css-loader'],
			},
			// {
			// 	test: /\.scss$/,
			// 	exclude: /node_modules/,
			// 	loader: ExtractCSS.extract('css-loader!sass'),
			// },
		],
	},
	resolve: {
        extensions: ['*', '.js', '.jsx', '.css'],
    },
}
