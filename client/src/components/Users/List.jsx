import React from 'react'
import { compose } from 'recompose'
import { Link, withRouter } from 'react-router-dom'
import { Query, Mutation } from 'react-apollo'
import { Badge, Button } from 'reactstrap'

import { IconAdd, IconEdit, IconDelete, IconView, IconPassword, IconClient, IconAdmin } from '../core/Icons'
import PageTitle from '../core/PageTitle'
import { aSuccess, aError, aConfirm } from '../core/Alert'
import Table from '../core/Table'
import { Loader, StatusBadge } from '../core'
import ErrorHandler from '../core/ErrorHandler'

import { queryUsers, mutationUserDelete } from '../../graphql/User'
import { formatDate, withMe } from '../../utils'

const getColumns = user => [
	{
		internalId: 'controls',
		Header: '',
		id: 'controls',
		sortable: false,
		filterable: false,
		maxWidth: 88,
		accessor: item => <span className="control-actions-block">
			{ user.role === 'OPERATOR' || <Link className="control-action" to={`/users/edit/${item._id}`} title="Edit"><IconEdit/></Link> }
			<Link className="control-action" to={`/users/view/${item._id}`} title="View"><IconView/></Link>
			<Link className="control-action" to={`/users/edit/${item._id}/password`} title="Change Password"><IconPassword/></Link>
			{ user.role === 'OPERATOR' || <ButtonDelete id={item._id} name={item.name}/> }
		</span>,
	},
	{
		Header: 'Name',
		accessor: 'name',
	},
	{
		id: 'isAdmin',
		Header: 'Is Admin',
		filterable: false,
		accessor: 'isAdmin',
		Cell: ({ value }) => (value ? <Badge color="danger"><IconAdmin/> Admin</Badge> : <Badge color="secondary"><IconClient/> Client</Badge>),
		Filter: ({ filter, onChange }) => <input checked={filter} type="checkbox" onChange={(e) => onChange(e.target.checked)}/>,
	},
	{
		id: 'email',
		Header: 'Email',
		accessor: 'email',
		Cell: ({ value }) => <a href={`mailto:${value}`}>{value}</a>,
	},
	{
		id: 'status',
		Header: 'Status',
		accessor: 'status',
		Cell: ({ value }) => <StatusBadge status={value}/>,
	},
	{
		id: 'createdAt',
		Header: 'Created At',
		accessor: item => formatDate(item.createdAt),
	},
]

const ButtonDelete = ({ id, name }) => <Mutation
	errorPolicy="all"
	mutation={mutationUserDelete}
	variables={{ id }}
	update={(cache, { data: { userDelete } }) => {
		const { users } = cache.readQuery({ query: queryUsers })
		cache.writeQuery({
			query: queryUsers,
			data: { users: users.filter(e => e._id !== userDelete) },
		})
	}}
>
	{(mutation, { loading }) => <a
		href=""
		className="control-action"
		title="Delete"
		disabled={loading}
		onClick={async e => {
			e.preventDefault()
			const decision = await aConfirm('Delete user', `Are you sure you want to delete '${name}' user?`)
			if (decision.value) {
				try {
					await mutation({ variables: { id } })
					aSuccess('Deleted!', 'Your user has been deleted.')
				} catch (err) {
					aError('An Error occurred', err.message)
				}
			}
		}}
	>
		<IconDelete/>
	</a>}
</Mutation>

const List = ({ me }) => <div>
	<PageTitle title="Users">
		{
			me.role === 'OPERATOR' || <Button color="link" className="pull-right" tag={Link} to="/users/create">
				<IconAdd/> Create User
			</Button>
		}
	</PageTitle>

	<Query query={queryUsers}>
		{({ data, loading, error }) => {
			if (loading) return <Loader/>
			if (error) return <ErrorHandler error={error}/>

			if (!data.users.length) {
				return <div>No users ...</div>
			}

			return <Table
				data={data.users}
				columns={getColumns(me)}
			/>
		}}
	</Query>
</div>

export default compose(withMe, withRouter)(List)
