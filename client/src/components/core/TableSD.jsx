import React from 'react'
import { compose, withState, withHandlers } from 'recompose'
import { Query } from 'react-apollo'

import ReactTable from 'react-table'
import 'react-table/react-table.css'

import Loader from './Loader'
import ErrorHandler from './ErrorHandler'

const TableSD = ({
	query,
	dataKey,
	columns,
	params,
	onPageChange,
	onPageSizeChange,
	onSortedChange,
	onFilteredChange,
	customFiltered,
	...tableProps
}) => {
	const variables = Object.assign({}, params)
	if (customFiltered) {
		variables.filtered = [customFiltered, ...params.filtered]
	}

	return <Query query={query} variables={variables} fetchPolicy={'network-only'}>
		{({ data, loading, error }) => {
			if (loading && !data.medias) return <Loader/>
			if (error) return <ErrorHandler error={error}/>

			const { docs, meta: { pages } } = data[dataKey]

			return <ReactTable
				minRows={0}
				showPagination
				className="-striped -highlight"
				noDataText="No data..."
				filterable
				sortable={docs.length > 1}
				defaultFilterMethod={(filter, row) => row[filter.id].toLowerCase().includes(filter.value.toLowerCase())}

				pages={pages}
				page={params.page}
				pageSize={params.pageSize}
				sorted={params.sorted}
				filtered={params.filtered}

				// resized: [],
				// expanded: {},

				data={docs}
				columns={columns}
				loading={loading}
				defaultPageSize={params.pageSize}

				manual
				onPageChange={onPageChange}
				onPageSizeChange={onPageSizeChange}
				onSortedChange={onSortedChange}
				onFilteredChange={onFilteredChange}
				{...tableProps}
			/>
		}}
	</Query>
}

export default compose(
	withState('params', 'setParams', ({ defaultSorted }) => ({ page: 0, pageSize: 10, sorted: defaultSorted || [], filtered: [] })),
	withHandlers({
		onPageChange: ({ params, setParams }) => (page) => setParams({ ...params, page }),
		onPageSizeChange: ({ params, setParams }) => (pageSize) => setParams({ ...params, pageSize, page: 0 }),
		onSortedChange: ({ params, setParams }) => (sorted) => setParams({ ...params, sorted, page: 0 }),
		onFilteredChange: ({ params, setParams }) => (filtered) => setParams({ ...params, filtered, page: 0 }),
	}),
)(TableSD)
