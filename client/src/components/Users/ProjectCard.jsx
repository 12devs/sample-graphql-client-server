import React from 'react'
import { compose } from 'recompose'
import { Link } from 'react-router-dom'
import { Mutation } from 'react-apollo'
import { Card, CardBody, CardTitle, CardSubtitle, CardLink, Input, Col, Label, FormGroup } from 'reactstrap'

import { aSuccess, aError } from '../core/Alert'
import { withMe, userHasPermission } from '../../utils'
import { PERM_ACTION_EDIT, ENTITY_PROJECT } from '../../constants'

import { queryUser, mutationUpdateProject, mutationRemoveProject } from '../../graphql/User'
import { queryProjectWithUsers } from '../../graphql/Project'

const UserProjectCard = ({ me, userId, userProject }) => <Card className={`card-user-project role-${userProject.role.toLowerCase()}`}>
	<CardBody>
		<CardTitle>
			<Link to={`/projects/${userProject.project._id}`}>{userProject.project.name}</Link>
		</CardTitle>
		<CardSubtitle>
			{
				userHasPermission(me, PERM_ACTION_EDIT, ENTITY_PROJECT, userProject.project._id)
				? <FormGroup row>
					<Label sm={4} for="role"><strong>ROLE: </strong></Label>
					<Col sm={8}>
						<Mutation
							mutation={mutationUpdateProject}
							update={(cache, result) => {
								cache.writeQuery({
									query: queryUser,
									variables: { id: userId },
									data: { user: result.data.userUpdateProject },
								})
							}}
							refetchQueries={[{
								query: queryProjectWithUsers,
								variables: { id: userProject.project._id },
							}]}
						>
							{(mutation, { loading }) => <Input
								disabled={loading}
								id="role"
								defaultValue={userProject.role}
								type="select"
								onChange={async e => {
									e.preventDefault()
									const payload = { variables: { userId, projectId: userProject.project._id, role: e.target.value } }
									try {
										await mutation(payload)
										aSuccess('Success!', 'Your user has been saved.')
									} catch (err) {
										aError('An Error occurred', err.message)
									}
								}}
							>
								<option value="OPERATOR">Operator</option>
								<option value="ANALYST">Analyst</option>
							</Input>}
						</Mutation>
					</Col>
				</FormGroup>
				: <span><strong>ROLE: </strong>{userProject.role}</span>
			}
		</CardSubtitle>
		<Mutation
			mutation={mutationRemoveProject}
			update={(cache, result) => {
				cache.writeQuery({
					query: queryUser,
					variables: { id: userId },
					data: { user: result.data.userRemoveProject },
				})
			}}
			refetchQueries={[{
				query: queryProjectWithUsers,
				variables: { id: userProject.project._id },
			}]}
		>
			{(mutation, { loading }) => <CardLink
				href=""
				disabled={loading}
				title="Delete"
				size="sm"
				onClick={async e => {
					e.preventDefault()
					const payload = { variables: { userId, projectId: userProject.project._id } }
					try {
						await mutation(payload)
						aSuccess('Success!', 'Your user has been saved.')
					} catch (err) {
						aError('An Error occurred', err.message)
					}
				}}
			>
				Revoke Access
			</CardLink>}
		</Mutation>
	</CardBody>
</Card>

export default compose(withMe)(UserProjectCard)
