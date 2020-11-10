import React from 'react'
import { Link, withRouter } from 'react-router-dom'
import { compose, withState, withHandlers } from 'recompose'
import { Mutation } from 'react-apollo'

import { Navbar, NavbarToggler, NavbarBrand, Collapse, Nav, NavItem, NavLink, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap'

import { mutationLogout } from '../graphql/User'
import { getRole } from '../utils'

import { aError } from '../components/core/Alert'
import { USER_ROLE_ADMIN, USER_ROLE_CLIENT, USER_ROLE_GUEST } from '../constants'

const Logout = withRouter(({ history }) => <Mutation mutation={mutationLogout}>
	{(mutation, { client, loading }) => <NavItem>
		<NavLink
			href=""
			disabled={loading}
			onClick={async (e) => {
				e.preventDefault()
				try {
					await mutation()
					Promise.resolve()
						.then(() => localStorage.removeItem('authToken'))
						.then(() => client.resetStore())
					// @TODO: ay p3 - redirect to / (keeps /projects)
						.then(() => history.push('/login'))
				} catch (err) {
					aError('An Error occurred', err.message)
				}
			}}
		>
			Logout
		</NavLink>
	</NavItem>}
</Mutation>)

const LogoutComponent = ({ dropDownOpen, toggle, onMouseEnter, onMouseLeave, user }) => <Dropdown onMouseOver={onMouseEnter} onMouseLeave={onMouseLeave} isOpen={dropDownOpen} toggle={toggle}>
	<DropdownToggle color="default" style={{ background: 'transparent', border: '0', fontweight: 'normal', padding: '.5rem 1rem' }}>
		{user.name}
	</DropdownToggle>
	<DropdownMenu right>
		<DropdownItem>
			<NavLink tag={Link} to={`/users/edit/${user._id}`}>
				Settings
			</NavLink>
		</DropdownItem>
		<DropdownItem>
			<Logout user={user}/>
		</DropdownItem>
	</DropdownMenu>
</Dropdown>

const LogoutMenu = compose(
	withRouter,
	withState('dropDownOpen', 'setDropdownOpen', false),
	withHandlers({
		toggle: ({ setDropdownOpen, dropDownOpen }) => () => {
			setDropdownOpen(!dropDownOpen)
		},
		onMouseEnter: ({ setDropdownOpen }) => () => {
			setDropdownOpen(true)
		},
		onMouseLeave: ({ setDropdownOpen }) => () => {
			setDropdownOpen(false)
		},
	})
)(LogoutComponent)

const Navigation = ({
	me,
	open,
	onToggle,
}) => {
	const menuItems = {
		[USER_ROLE_ADMIN]: {
			'/media': 'Media',
			'/projects': 'Projects',
			'/templates': 'Templates',
			'/users': 'Users',
		},
		[USER_ROLE_CLIENT]: {
			'/media': 'Media',
			'/projects': 'Projects',
		},
		[USER_ROLE_GUEST]: {
			'/login': 'Login',
		},
	}[getRole(me)]

	return <Navbar color="light" light expand>
		<NavbarToggler onClick={onToggle} />
		<NavbarBrand tag={Link} to="/">
			<img height="30" src="/assets/images/logo.jpg"/>
			{
				me && me.client && me.client._id
					? <span>User: {me.client.name}</span>
					: <span>Exchange</span>
			}
		</NavbarBrand>
		<Collapse isOpen={open} navbar>
			<Nav className="ml-auto" navbar>
				{
					Object.keys(menuItems)
						.map(link => <NavItem key={link}><NavLink tag={Link} to={link}>{menuItems[link]}</NavLink></NavItem>)
				}
				{ !me || <LogoutMenu user={me}/> }
			</Nav>
		</Collapse>
	</Navbar>
}

export default compose(
	withRouter,
	withState('open', 'setOpen', false),
	withHandlers({
		onToggle: ({ open, setOpen }) => () => setOpen(!open),
	}),
)(Navigation)
