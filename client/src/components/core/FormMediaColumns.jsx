import React from 'react'
import sortBy from 'lodash/sortBy'
import { Row, Col, ListGroup, ListGroupItem } from 'reactstrap'

import { IconArrowRight, IconArrowLeft } from './Icons'

const SOURCE = 'source'
const TARGET = 'target'

const allItems = [
	{
		id: 'externalId',
		title: 'Id',
		description: 'Id',
	},
	{
		id: 'mediaType',
		title: 'Medienart',
		description: 'Medienart',
	},
	{
		id: 'publicationDate',
		title: 'Erscheinungsdatum',
		description: 'Erscheinungsdatum',
	},
	{
		id: 'publicationName',
		title: 'Publikation.Publikationsname',
		description: 'Publikation.Publikationsname',
	},
	{
		id: 'contentHeadline',
		title: 'Inhalt.Headline',
		description: 'Inhalt.Headline',
	},
	{
		id: 'mediapageLink',
		title: 'MedienblattLink',
		description: 'MedienblattLink',
	},
	{
		id: 'previewLink',
		title: 'Previewlink',
		description: 'Previewlink',
	},
	{
		id: 'deepLink',
		title: 'Deeplink',
		description: 'Deeplink',
	},
	{
		id: 'importDate',
		title: 'Importdatum',
		description: 'Importdatum',
	},
]

const Item = ({ type, data, onClick }) => {
	const direction = type === TARGET ? 'right' : 'left'
	const icon = type === TARGET ? <IconArrowRight className="text-danger"/> : <IconArrowLeft className="text-success"/>
	const button = <a
		href=""
		className={`mx-2 pull-${direction}`}
		onClick={e => {
			e.preventDefault()
			onClick(data.id)
		}}
	>
		{icon}
	</a>

	return <ListGroupItem>{button}{data.title}</ListGroupItem>
}

const List = ({ items, type, onClick }) =>
	<ListGroup>{items.map(item => <Item key={item.id} type={type} onClick={onClick} data={item}/>)}</ListGroup>

class FormMediaColumns extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			items: (props.items || []).map(x => allItems.find(y => y.id === x)),
		}
	}

	addItem(id) {
		const item = allItems.find(x => x.id === id)
		this.setState({ items: sortBy([item, ...this.state.items], 'title') })
	}

	removeItem(id) {
		this.setState({ items: sortBy(this.state.items.filter(x => x.id !== id), 'title') })
	}

	get value() {
		return this.state.items.map(x => x.id)
	}

	get name() {
		return this.props.name
	}

	render() {
		const { items } = this.state

		return <Row>
			<Col lg={6}>
				<List
					type={TARGET}
					onClick={this.removeItem.bind(this)}
					items={items}
				/>
			</Col>
			<Col lg={6}>
				<List
					type={SOURCE}
					onClick={this.addItem.bind(this)}
					items={allItems.filter(x => !items.find(y => y.id === x.id))}
				/>
			</Col>
		</Row>
	}
}

export default FormMediaColumns
