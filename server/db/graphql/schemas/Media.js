//language=GraphQL Schema
const Media = `
	type MediaSentiment {
		magnitude: Float
		score: Float
	}
	type Media {
		_id: ID
		externalId: String
		author: Author
		mediaType: String
		publicationDate: Date
		publicationName: String
		contentHeadline: String
		mediapageLink: String
		previewLink: String
		deepLink: String
		importDate: Date
		source: String
		publicationText: String
		services: JSON
		hasGoogleNlp: Boolean
		hasAmazon: Boolean
		hasAzure: Boolean
		sentiment: MediaSentiment
		raw: JSON
		projects: [Project]
		createdAt: Date
		link: String
	}
`

export default Media
