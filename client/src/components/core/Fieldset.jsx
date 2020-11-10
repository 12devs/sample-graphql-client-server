import React from 'react'

const Fieldset = ({ title, children, className = '' }) => <fieldset className={className}>
	<legend>{title}</legend>

	<div className="panel panel-default">
		<div className="panel-body">
			{children}
		</div>
	</div>
</fieldset>

export default Fieldset
