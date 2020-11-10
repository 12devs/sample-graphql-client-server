import React from 'react'
import { compose } from 'recompose'
import { Route, withRouter, Redirect } from 'react-router-dom'
import { Container } from 'reactstrap'

import Navigation from './Navigation'
import { UsersList, UserForm, UserChangePasswordForm, UserView } from './Users'
import { ProjectsList, ProjectForm, ProjectView } from './Projects'
import { MediaList, MediaSentiment, MediaEntities } from './Media'
import { TemplatesList, TemplateForm, TemplateView } from './Templates'

import Login from './Login'
import Loader from './core/Loader'

import { getRole, withMe } from '../utils'
import { USER_ROLE_ADMIN, USER_ROLE_CLIENT, USER_ROLE_GUEST } from '../constants'

const PrivateRoute = ({ component: Component, user, ...rest }) => (
	<Route {...rest} render={(props) => {
		if (!user) return <Redirect to="/login" />

		return <Component {...props} />
	}} />
)

const homePage = user => ({
	[USER_ROLE_ADMIN]: <Redirect to="/users"/>,
	[USER_ROLE_CLIENT]: <Redirect to="/media"/>,
	[USER_ROLE_GUEST]: <Redirect to="/login"/>,
}[getRole(user)])

const App = ({ loading, me }) => <div className="App">
	<Navigation me={me}/>
	{
		loading || typeof me === 'undefined'
		? <Loader/>
		: <Container>
			<Route path={'/'} exact component={() => homePage(me)}/>
			<Route path={'/login'} exact component={() => (me ? homePage(me) : <Login/>)}/>

			<PrivateRoute path={'/users'} user={me} exact component={() => <UsersList/>}/>
			<PrivateRoute path={'/users/create'} user={me} exact component={() => <UserForm/>}/>
			<PrivateRoute path={'/users/view/:id'} user={me} exact component={() => <UserView/>}/>
			<PrivateRoute path={'/users/edit/:id'} user={me} exact component={() => <UserForm/>}/>
			<PrivateRoute path={'/users/edit/:id/password'} user={me} exact component={() => <UserChangePasswordForm/>}/>

			<PrivateRoute path={'/projects'} user={me} exact component={() => <ProjectsList/>}/>
			<PrivateRoute path={'/projects/create'} user={me} exact component={() => <ProjectForm/>}/>
			<PrivateRoute path={'/projects/view/:id'} user={me} exact component={() => <ProjectView/>}/>
			<PrivateRoute path={'/projects/edit/:id'} user={me} exact component={() => <ProjectForm/>}/>

			<PrivateRoute path={'/media'} user={me} exact component={() => <MediaList/>}/>
			<PrivateRoute path={'/media/:id/sentiment'} user={me} exact component={() => <MediaSentiment/>}/>
			<PrivateRoute path={'/media/:id/entities'} user={me} exact component={() => <MediaEntities/>}/>

			<PrivateRoute path={'/templates'} user={me} exact component={() => <TemplatesList/>}/>
			<PrivateRoute path={'/templates/create'} user={me} exact component={() => <TemplateForm/>}/>
			<PrivateRoute path={'/templates/view/:id'} user={me} exact component={() => <TemplateView/>}/>
			<PrivateRoute path={'/templates/edit/:id'} user={me} exact component={() => <TemplateForm/>}/>
		</Container>
	}
</div>

export default compose(
	withMe,
	withRouter
)(App)
