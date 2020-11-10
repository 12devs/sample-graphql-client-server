import _get from 'lodash/get'
import React from 'react'
import { Link, withRouter } from 'react-router-dom'
import ReactTable from 'react-table'
import { Query } from 'react-apollo'

import { queryMedia } from '../../graphql/Media'
import Loader from '../core/Loader'
import Fieldset from '../core/Fieldset'
import { IconBack, IconSentiment } from '../core/Icons'
import { colorizeValue } from '../../utils'

const columns = [
	{
		internalId: 'magnitude',
		maxWidth: 100,
		Header: 'Magnitude',
		id: 'magnitude',
		accessor: 'sentiment.magnitude',
	},
	{
		internalId: 'score',
		maxWidth: 100,
		Header: 'Score',
		id: 'score',
		accessor: 'sentiment.score',
	},
	{
		internalId: 'content',
		Header: 'Content',
		id: 'content',
		accessor: 'text.content',
		style: {
			overflow: 'visible',
			wordWrap: 'break-word',
			whiteSpace: 'normal',
		},
	},
]

const Sentiment = ({ match: { params: { id } } }) => <div>
	<Query query={queryMedia} variables={{ id }}>
		{({ data, loading, error }) => {
			if (loading) return <Loader/>

			if (error) {
				return <div>Error: {error}</div>
			}

			const { media } = data
			if (!media) {
				return <div>Media Item not found</div>
			}

			const sentences = _get(media, 'services.google.sentences', [])
			const { sentiment } = media

			return <div>
				<Fieldset title={`Media Item Sentiment details (MA Id: ${media.externalId})`}>
					<Link to="/media"><IconBack /> Back to Media List</Link>
					<h4>{media.contentHeadline}</h4>
					<hr />
					<h5>Overall Document sentiment</h5>
					<div>
						<IconSentiment {...sentiment} sizeClass="fa-2x" /> Magnitude: <strong>{sentiment.magnitude}</strong> Score: <strong>{sentiment.score}</strong>
					</div>
					<hr />
					<h5>Sentences</h5>
					<ReactTable
						sortable={false}
						minRows={0}
						noDataText="No data..."
						filterable={sentences.length > 2}
						data={sentences}
						columns={columns}
						showPagination={false}
						getTdProps={(state, rowInfo, column) => {
							if (['magnitude', 'score'].includes(column.id)) {
								return colorizeValue(rowInfo.row[column.id])
							}

							return {}
						}}
					/>
				</Fieldset>
			</div>
		}}
	</Query>
</div>

export default withRouter(Sentiment)
