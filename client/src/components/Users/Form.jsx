import React, { Fragment } from 'react'
import { withRouter } from 'react-router-dom'
import { TabContent, TabPane, Nav, NavItem, NavLink, Col, Form, FormGroup, Label, Input, Button } from 'reactstrap'
import { Query, Mutation } from 'react-apollo'
import { compose, withState, withHandlers } from 'recompose'
import { UserChangePasswordForm } from './index'

import {
	queryUser, queryUsers,
	mutationUserCreate, mutationUserUpdate,
} from '../../graphql/User'

import { aSuccess } from '../core/Alert'
import ErrorHandler from '../core/ErrorHandler'
import Loader from '../core/Loader'

import FormInput from '../core/FormInput'
import FormForm from '../core/FormForm'
import logger from '../../logger'

import { withFormHandlers, withMe } from '../../utils'

const UserFormWithHandlers = withFormHandlers(({
	me,
	onRef,
	loading,
	data = {}, getFormData,
	onSubmit,
	history,
	error,
}) => <Form onSubmit={async (e) => {
	e.preventDefault()
	await onSubmit(getFormData())
}}>
	<FormGroup row>
		<Label for="name" sm={2}>Full Name</Label>
		<Col sm={10}>
			<FormInput
				error={error}
				id="name"
				name="name"
				defaultValue={data.name || ''}
				innerRef={onRef}
				type="name"
				placeholder="First Last"
			/>
		</Col>
	</FormGroup>
	<FormGroup row>
		<Label for="email" sm={2}>Email</Label>
		<Col sm={10}>
			<FormInput
				error={error}
				id="email"
				name="email"
				defaultValue={data.email || ''}
				innerRef={onRef}
				type="email"
				placeholder="name@domain.com"
			/>
		</Col>
	</FormGroup>
	{
		// @TODO: ay p3 - check for _id instead of name
		data.name
			? null
			: <FormGroup row>
				<Label for="password" sm={2}>Password</Label>
				<Col sm={10}>
					<FormInput
						error={error}
						id="password"
						name="password"
						defaultValue={data.password || ''}
						innerRef={onRef}
						type="password"
					/>
				</Col>
			</FormGroup>
	}
	{
		me.isAdmin || !data.name
		? <Fragment>
			<FormGroup row>
				<Label for="status" sm={2}>Status</Label>
				<Col sm={10}>
					<FormInput
						error={error}
						id="status"
						name="status"
						defaultValue={data.status || 'PENDING'}
						innerRef={onRef}
						type="select"
						hint="Pending status causes change password request on first login"
					>
						<option value="PENDING">Pending</option>
						<option value="ACTIVE">Active</option>
						<option value="INACTIVE">Inactive</option>
					</FormInput>
				</Col>
			</FormGroup>
			<FormGroup check>
				<Label sm={{ size: 10, offset: 2 }} check>
					<Input
						error={error}
						id="isAdmin"
						name="isAdmin"
						defaultChecked={data.isAdmin}
						innerRef={onRef}
						type="checkbox"
						value={true}
					/>
					{' '} Is Admin
				</Label>
			</FormGroup>
		</Fragment>
		: null
	}
	<FormGroup row>
		<Col sm={{ size: 10, offset: 2 }}>
			<Button type="submit" color="success" disabled={loading}>Save</Button>
			<Button color="link" onClick={() => history.goBack()}>Cancel</Button>
		</Col>
	</FormGroup>
</Form>)

const UserForm = ({
	me,
	match: { params: { id } },
	history,
	toggle,
	activeTab,
}) => {
	const form = (title, userId, userData = {}) => <div>
		<Nav tabs>
			<NavItem>
				<NavLink
					className={`${activeTab === '1' ? 'active' : ''}`}
					onClick={() => toggle('1')}
				>
					Change Information
				</NavLink>
			</NavItem>
			{
				!userId || <NavItem>
					<NavLink
						className={`${activeTab === '2' ? 'active' : ''}`}
						onClick={() => toggle('2')}
					>
						Change Password
					</NavLink>
				</NavItem>
			}
		</Nav>
		<TabContent activeTab={activeTab}>
			<TabPane tabId="1">
				<Mutation
					mutation={userId ? mutationUserUpdate : mutationUserCreate}
					update={(cache, result) => {
						// No need to update case on update since we are inside the Query
						if (userId) return true

						// No need to update if no clients list fetched
						if (!cache.data.data.ROOT_QUERY) return true

						const { users } = cache.readQuery({ query: queryUsers })
						cache.writeQuery({
							query: queryUsers,
							// @TODO: ay p1 - sorting
							data: { users: users.concat([result.data.userCreate]) },
						})

						return true
					}}
					onCompleted={() => history.goBack()}
				>
					{(mutation, { loading, error }) => <FormForm title={title} error={error}>
						<UserFormWithHandlers
						me={me}
						loading={loading}
						data={userData}
						error={error}
						onSubmit={async data => {
							const payload = { variables: { data } }
							if (userId) payload.variables.id = userId

							try {
								await mutation(payload)
								aSuccess('Success!', 'Your user has been saved.')
							} catch (err) {
								logger.debug('err', err)
							}
						}}
					/>
					</FormForm>}
				</Mutation>
			</TabPane>
			{
				!userId || <TabPane tabId="2">
					<UserChangePasswordForm/>
				</TabPane>
			}
		</TabContent>
	</div>

	if (!id) return form('Create User')

	return <Query query={queryUser} variables={{ id }} errorPolicy="all">
			{({ data, loading, error }) => {
				if (loading) return <Loader/>
				if (error) return <ErrorHandler error={error}/>

				return form('Update User', id, data.user)
			}}
		</Query>
}

export default compose(
	withMe,
	withRouter,
	withState('activeTab', 'setActiveTab', '1'),
	withHandlers({
		toggle: ({ activeTab, setActiveTab }) => (tab) => {
			if (activeTab !== tab) {
				setActiveTab(tab)
			}
		},
	}
))(UserForm)
