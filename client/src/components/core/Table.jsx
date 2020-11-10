import React from 'react'

import ReactTable from 'react-table'
import 'react-table/react-table.css'

// const allColumns = {
// 	_id: {
// 		internalId: '_id',
// 		Header: 'ID',
// 		accessor: '_id',
// 	},
// }

const Table = ({ columns, data = [], defaultPageSize = 20, ...rest }) => {
	// const tableColumns = columns.length
	// 	? allColumns.filter(x => columns.includes(x.internalId))
	// 	: allColumns

	return <ReactTable
		{...rest}
		data={data}
		minRows={0}
		defaultPageSize={defaultPageSize}
		showPagination
		className="-striped -highlight"
		noDataText="No data..."
		columns={columns}
		filterable
		sortable={data.length > 1}
		defaultFilterMethod={(filter, row) => String(row[filter.id]).toLowerCase().includes(filter.value.toLowerCase())}
	/>
}

export default Table
