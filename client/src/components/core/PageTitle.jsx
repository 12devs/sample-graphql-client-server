import React from 'react'

const PageTitle = ({ title, children, level = 1 }) => {
	const Tag = `h${level}`

	return <Tag>
		{title}
		{children}
	</Tag>
}

export default PageTitle
