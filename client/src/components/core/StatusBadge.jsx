import React from 'react'
import { Badge } from 'reactstrap'

const StatusBadge = ({ status }) => {
	const color = {
		PENDING: 'warning',
		ACTIVE: 'success',
		INACTIVE: 'secondary',
	}[status]

	return <Badge color={color}>{status}</Badge>
}

export default StatusBadge
