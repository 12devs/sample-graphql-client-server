import React from 'react'
import { Alert } from 'reactstrap'

const ErrorHandler = ({ error }) => <Alert color="danger">{error.message.replace('GraphQL error: ', '')}</Alert>

export default ErrorHandler
