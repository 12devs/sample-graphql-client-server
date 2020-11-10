//language=GraphQL Schema
const User = `
	enum UserRole {
		OPERATOR
		ANALYST
	}

	enum UserStatus {
		PENDING
		ACTIVE
		INACTIVE
	}

	type UserProject {
		project: Project
		role: UserRole
	}

	input InputUserProject {
		project: ID!
		role: UserRole!
	}

	type User {
		_id: ID
		name: String
		email: String!
		password: String!
		projects: [UserProject]
		status: UserStatus!
		isAdmin: Boolean
		createdAt: Date
	}

	type Me {
		user: User
		token: String
	}

	input InputUser {
		name: String
		email: String
		password: String
		status: UserStatus
		isAdmin: Boolean
		projects: [InputUserProject]
	}
`

export default User
