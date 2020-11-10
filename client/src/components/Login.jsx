import React from 'react'
import { withRouter } from 'react-router-dom'
import { Mutation } from 'react-apollo'
import { Form, Row, Col, FormGroup, Label, Button } from 'reactstrap'

import { queryMe, mutationLogin } from '../graphql/User'
import { withFormHandlers } from '../utils'

import FormInput from './core/FormInput'
import FormForm from './core/FormForm'

import logger from '../logger'

const LoginFormWithHandlers = withFormHandlers(({
	onRef,
	loading,
	data = {}, getFormData,
	onSubmit,
	error,
}) => <Row>
	<Col lg={{ size: 6, offset: 3 }}>
		<Form onSubmit={async (e) => {
			e.preventDefault()
			await onSubmit(getFormData())
		}}>
		<FormForm title="Please login" error={error}>
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
			<FormGroup row>
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
			<FormGroup check row>
				<Col sm={{ offset: 2 }}>
					<Button type="submit" color="success" disabled={loading}>Login</Button>
				</Col>
			</FormGroup>
		</FormForm>
		</Form>
	</Col>
</Row>)

const Login = ({ history }) => <Mutation
	mutation={mutationLogin}
	update={(cache, result) => {
		localStorage.setItem('authToken', result.data.login.token)
		// @TODO: ay p2 - reFetch?
		cache.writeQuery({
			query: queryMe,
			data: { me: result.data.login.user },
		})
	}}
>
	{(mutation, { loading, error }) => <LoginFormWithHandlers
		loading={loading}
		error={error}
		onSubmit={async data => {
			try {
				const response = await mutation({ variables: data })
				if (response.data.login.user.status === 'PENDING') {
					history.push(`/users/edit/${response.data.login.user._id}/password`)
				}
			} catch (err) {
				logger.debug('err', err)
			}
		}}
	/>}
</Mutation>

export default withRouter(Login)
