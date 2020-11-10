import React from 'react'
import { FormFeedback, Input } from 'reactstrap'

class MyInput extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			supressError: false,
			invalid: props.invalid || false,
		}
	}

	static getDerivedStateFromProps(props, state) {
		if (props.invalid !== state.invalid) {
			return { invalid: props.invalid, supressError: false }
		}

		return null
	}

	render() {
		// eslint-disable-next-line
		const { invalid, onChange, ...attrs } = this.props

		return <Input
			invalid={this.state.invalid && !this.state.supressError}
			{...attrs}
			onChange={e => {
				this.setState({ supressError: true })

				return onChange(e)
			}}
		/>
	}
}

MyInput.defaultProps = {
	// eslint-disable-next-line
	onChange: () => {}
}

const FormInput = ({ name, error, hint, ...props }) => {
	let invalid = false
	let message = ''
	if (error) {
		if (error.graphQLErrors) {
			const fieldErrors = error.graphQLErrors.reduce((all, x) => Object.assign(all, x.data), {})
			if (typeof fieldErrors[name] !== 'undefined') {
				invalid = true
				message = fieldErrors[name]
			}
		}
	}

	return <React.Fragment>
		<MyInput
			invalid={invalid}
			name={name}
			{...props}
		/>
		{!hint || <small className="form-text text-muted">{hint}</small>}
		<FormFeedback>{message}</FormFeedback>
	</React.Fragment>
}

export default FormInput
