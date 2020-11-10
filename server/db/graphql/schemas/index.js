import Author from './Author'
import Media from './Media'
import Project from './Project'
import Template from './Template'
import User from './User'

//language=GraphQL Schema
const root = `
	scalar Date
	scalar JSON

	input RTFilter {
		id: String
		value: String
	}
	input RTSort {
		id: String
		desc: Boolean
	}
	input InputPaging {
		page: Int
		pageSize: Int
		filtered: [RTFilter]
		sorted: [RTSort]
	}
	type RTMeta {
		page: Int
		pages: Int
		pageSize: Int
		total: Int
	}

	type RTMediasResult {
		docs: [Media]
		meta: RTMeta
	}
	type RTUsersResult {
		docs: [User]
		meta: RTMeta
	}

	# the schema allows the following query:
	type Query {
		me: User

		user(id: ID!): User
		users: [User]
		usersPaginated(page: Int, pageSize: Int, filtered: [RTFilter], sorted: [RTSort]): RTUsersResult
		usersByProject(projectId: ID!): [User]

		project(id: ID!): Project
		projects: [Project]
		projectsByUser(userId: ID!): [Project]

		template(id: ID!): Template
		templates: [Template]

		media(id: ID!): Media
		medias(page: Int, pageSize: Int, filtered: [RTFilter], sorted: [RTSort]): RTMediasResult
	}

	type Mutation {
		login(email: String!, password: String!): Me
		logout: String

		userCreate (data: InputUser!): User
		userUpdate (id: ID!, data: InputUser!): User
		userDelete (id: ID!): ID
		userChangePassword (id: ID!, oldPassword: String!, newPassword: String!): String

		userAddProject (userId: ID!, projectId: ID!, role: String!): User
		userUpdateProject (userId: ID!, projectId: ID!, role: String!): User
		userRemoveProject (userId: ID!, projectId: ID!): User

		projectCreate (data: InputProject!): Project
		projectUpdate (id: ID!, data: InputProject!): Project
		projectDelete (id: ID!): ID

		projectAddUser (projectId: ID!, userId: ID!, role: String!): Project
		projectRemoveUser (projectId: ID!, userId: ID!): Project

		templateCreate (data: InputTemplate!): Template
		templateUpdate (id: ID!, data: InputTemplate!): Template
		templateDelete (id: ID!): ID
	}
`

export default [root, Author, Media, Project, Template, User]
