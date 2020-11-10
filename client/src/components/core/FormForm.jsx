import React from 'react'

import ErrorHandler from './ErrorHandler'
import Fieldset from './Fieldset'

const FormForm = ({ title, error, children }) => <Fieldset title={title} >
	{
		error
		? <ErrorHandler error={error}/>
		: null
	}
	{children}
</Fieldset>

export default FormForm
