import React from 'react'
import { compose } from 'recompose'
import { Link, withRouter } from 'react-router-dom'
import { Card, CardBody, CardTitle, CardText, CardLink } from 'reactstrap'
import { Query } from 'react-apollo'

import { queryUser } from '../../graphql/User'
import Fieldset from '../core/Fieldset'
import Loader from '../core/Loader'
// import Projects from './Projects'
import { formatDate, withMe, userHasPermission } from '../../utils'
import {
	PERM_ACTION_EDIT,
	ENTITY_USER,
} from '../../constants'

const UserView = ({ me, match: { params: { id } } }) => <div>
	<Query query={queryUser} variables={{ id }}>
		{({ data, loading, error }) => {
			if (loading) return <Loader/>

			if (error) {
				return <div>Error: {error}</div>
			}

			if (!data.user) {
				return <div>User not found</div>
			}

			const user = data.user

			return <div>
				<Fieldset title="User information">
					<Card>
						<CardBody>
							<CardTitle><u>{user.name}</u></CardTitle>
							<CardText>
								<strong>Email</strong> <span><a href={`mailto:${user.email}`}>{user.email}</a></span><br/>
								<strong>Status</strong> <span>{user.status}</span><br/>
								<strong>Is Admin</strong> <span>{user.isAdmin ? 'Yes' : 'No'}</span><br/>
								<strong>Created at</strong> <span>{formatDate(user.createdAt)}</span><br/>
							</CardText>
							{
								!userHasPermission(me, PERM_ACTION_EDIT, ENTITY_USER, id) ||
								<CardLink tag={Link} to={`/users/edit/${id}`}>Edit User</CardLink>
							}
							{
								!userHasPermission(me, PERM_ACTION_EDIT, ENTITY_USER, id) ||
								<CardLink tag={Link} to={`/users/edit/${id}/password`}>Change Password</CardLink>
							}
						</CardBody>
					</Card>
				</Fieldset>
				{ user.isAdmin || !userHasPermission(me, PERM_ACTION_EDIT, ENTITY_USER, id) || <Projects user={user}/> }
			</div>
		}}
	</Query>
</div>

export default compose(
	withMe,
	withRouter
)(UserView)
