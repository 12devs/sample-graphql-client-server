//@TODO: ay p1 - mode to components/core
import React from 'react'

export const IconAdd = () => <i className="fa fa-lg fa-plus"/>
export const IconEdit = () => <i className="fa fa-lg fa-edit"/>
export const IconDelete = () => <i className="fa fa-lg fa-trash"/>
export const IconView = () => <i className="fa fa-lg fa-eye"/>
export const IconPassword = () => <i className="fa fa-lg fa-key"/>
export const IconAdmin = () => <i className="fa fa-lg fa-user-secret"/>
export const IconClient = () => <i className="fa fa-lg fa-user"/>
export const IconExternalLink = () => <i className="fa fa-lg fa-external-link"/>
export const IconInfo = () => <i className="fa fa-lg fa-info"/>
export const IconArrowRight = ({ className, ...rest }) => <i className={`fa fa-lg fa-arrow-circle-right ${className || ''}`} {...rest}/>
export const IconArrowLeft = ({ className, ...rest }) => <i className={`fa fa-lg fa-arrow-circle-left ${className || ''}`} {...rest}/>
export const IconSentiment = ({ magnitude, score, sizeClass = 'fa-lg' }) => {
	let icon = 'meh'
	if (magnitude > 0) icon = 'smile'
	if (magnitude < 0) icon = 'frown'

	return <i className={`fa ${sizeClass} fa-${icon}-o`} title={`Magnitude: ${magnitude}, Score: ${score}`}/>
}

export const IconEntities = () => <i className="fa fa-lg fa-list"/>
export const IconBack = () => <i className="fa fa-lg fa-long-arrow-left"/>

export const IconGoogle = () => <i className="fa fa-google" title="Google"/>
export const IconAmazon = () => <i className="fa fa-amazon" title="Amazon"/>
export const IconAzure = () => <i className="fa fa-windows" title="Azure"/>
