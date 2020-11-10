import { GraphQLScalarType } from 'graphql'
import GraphQLJSON from 'graphql-type-json'
import { Kind } from 'graphql/language'
import merge from 'lodash/merge'

import User from './User'
import Project from './Project'
import Template from './Template'
import Media from './Media'

const root = {
	JSON: GraphQLJSON,
	Date: new GraphQLScalarType({
		name: 'Date',
		description: 'Date custom scalar type',
		parseValue(value) {
			// value from the client
			return new Date(value)
		},
		serialize(value) {
			// value sent to the client
			return value.getTime()
		},
		parseLiteral(ast) {
			if (ast.kind === Kind.INT) {
				// ast value is always in string format
				return parseInt(ast.value, 10)
			}

			return null
		},
	}),
}

export default merge(root, User, Project, Template, Media)
