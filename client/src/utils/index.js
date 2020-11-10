import moment from 'moment'
import 'moment-timezone'
import { compose, withHandlers } from 'recompose'
import { withRouter } from 'react-router-dom'
import { graphql } from 'react-apollo'

import { queryMe } from '../graphql/User'

import {
	USER_ROLE_ADMIN, USER_ROLE_CLIENT, USER_ROLE_GUEST,
	PERM_ACTION_CREATE, PERM_ACTION_EDIT, PERM_ACTION_DELETE,
	ENTITY_PROJECT,
} from '../constants'

const TIMEZONE = 'Europe/Berlin'

const formatDate = (date) => moment.utc(date).tz(TIMEZONE).format('DD MMM LT')
const formatDateAgo = (date) => moment(date).tz(TIMEZONE).fromNow()

const withFormHandlers = compose(
	withRouter,
	withHandlers(() => {
		let refs = {}

		return {
			setValue: () => (name, value) => {
				refs[name].value = value
			},
			onRef: () => (ref) => (ref && ref.name && (refs[ref.name] = ref)),
			getFormData: () => () => Object.keys(refs).reduce((data, x) => {
				const valueKey = refs[x].type === 'checkbox' ? 'checked' : 'value'

				return Object.assign(data, { [x]: refs[x][valueKey] })
			}, {}),
		}
	})
)

const withMe = graphql(queryMe, {
	options: { fetchPolicy: 'cache-first' },
	props: ({ data: { loading, me } }) => ({ loading, me }),
})

const getRole = user => {
	if (!user) return USER_ROLE_GUEST
	if (user.isAdmin) return USER_ROLE_ADMIN

	return USER_ROLE_CLIENT
}

const userHasPermission = (user, action, entity, entityId) => {
	if (user.isAdmin) return true

	if (entity === ENTITY_PROJECT) {
		if (action === PERM_ACTION_CREATE) return false

		const userProject = user.projects.find(x => x.project._id === entityId)
		if (!userProject) return false
		if (action === PERM_ACTION_EDIT) return userProject.role === 'OPERATOR'
		if (action === PERM_ACTION_DELETE) return false

		return true
	}

	return false
}

const colorizeValue = (value) => {
	if (value === 0) return {}

	const color = value > 0 ? '0, 255, 0' : '255, 0, 0'
	const backgroundColor = `rgba(${color}, 0.5)`

	return { style: { backgroundColor } }
}

export {
	formatDateAgo,
	formatDate,
	withFormHandlers,
	withMe,
	getRole,
	userHasPermission,
	TIMEZONE,
	colorizeValue,
}
