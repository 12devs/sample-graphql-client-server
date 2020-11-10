import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router } from 'react-router-dom'
import { ApolloProvider } from 'react-apollo'
import { ApolloClient } from 'apollo-client'
import { ApolloLink } from 'apollo-link'
import { HttpLink } from 'apollo-link-http'
import { setContext } from 'apollo-link-context'
import { onError } from 'apollo-link-error'
import { InMemoryCache } from 'apollo-cache-inmemory'

import logger from './logger'

import App from './components/App.jsx'
import { aError } from './components/core/Alert'

const httpLink = new HttpLink({
	uri: '/graphql',
	credentials: 'same-origin',
})

const authLink = setContext((_, { headers }) => {
	const token = localStorage.getItem('authToken')

	return {
		headers: {
			...headers,
			authorization: token ? `Bearer ${token}` : '',
		},
	}
})

const errorLink = onError(({ graphQLErrors, networkError }) => {
	if (graphQLErrors) {
		logger.error('graphQLErrors', { graphQLErrors })
	}

	if (networkError) {
		// do something with network error
		logger.error('networkError', { networkError })
		aError('Network error')
	}
})

const link = ApolloLink.from([
	authLink,
	errorLink,
	httpLink,
])

const cache = new InMemoryCache()
const client = new ApolloClient({
	link,
	cache,
})

ReactDOM.render(
	<ApolloProvider client={client}>
		<Router>
			<App />
		</Router>
	</ApolloProvider>,
	document.getElementById('root')
)
