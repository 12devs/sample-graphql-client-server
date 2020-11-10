import React from 'react'
import { withRouter } from 'react-router-dom'
import { Col, Form, FormGroup, Label, Button } from 'reactstrap'
import { Query, Mutation } from 'react-apollo'

import { queryUser, mutationUserChangePassword } from '../../graphql/User'

import { aSuccess } from '../core/Alert'
import { withFormHandlers } from '../../utils'

import FormInput from '../core/FormInput'
import FormForm from '../core/FormForm'

import logger from '../../logger'

const UserPasswordFormWithHandlers = withFormHandlers(({
	onRef,
	loading,
	getFormData,
	onSubmit,
	history,
	error,
}) => <Form onSubmit={async (e) => {
	e.preventDefault()
	await onSubmit(getFormData())
}}>
	<FormGroup row>
		<Label for="oldPassword" sm={3}>Current Password</Label>
		<Col sm={9}>
			<FormInput
				error={error}
				id="oldPassword"
				name="oldPassword"
				defaultValue={''}
				innerRef={onRef}
				type="password"
			/>
		</Col>
	</FormGroup>
	<FormGroup row>
		<Label for="newPassword" sm={3}>New Password</Label>
		<Col sm={9}>
			<FormInput
				error={error}
				id="newPassword"
				name="newPassword"
				defaultValue={''}
				innerRef={onRef}
				type="password"
			/>
		</Col>
	</FormGroup>
	<FormGroup row>
		<Col sm={{ size: 9, offset: 3 }}>
			<Button type="submit" color="success" disabled={loading}>Save</Button>
			<Button color="link" onClick={() => history.goBack()}>Cancel</Button>
		</Col>
	</FormGroup>
</Form>)

const form = (username, id) => <div>
	<Mutation
		mutation={mutationUserChangePassword}
		onCompleted={() => history.back()}
	>
		{(mutation, { loading, error }) => <FormForm title={`Change password for ${username}`} error={error}>
			<UserPasswordFormWithHandlers
			loading={loading}
			error={error}
			onSubmit={async data => {
				data.id = id
				logger.debug('data', data)
				try {
					const response = await mutation({ variables: data })
					logger.debug('response', response)
					aSuccess('Success!', 'Password has been saved.')
				} catch (err) {
					logger.debug('err', err)
				}
			}}
		/>
		</FormForm>}
	</Mutation>
</div>

const UserChangePasswordForm = ({ match: { params: { id } }, history }) => <div>
	<Query query={queryUser} variables={{ id }}>
		{({ data, loading, error }) => {
			if (loading) return <div>Loading</div>

			if (error) {
				return <div>Error: {error}</div>
			}

			return form(data.user.name, data.user._id, history)
		}}
	</Query>
</div>


export default withRouter(UserChangePasswordForm)
