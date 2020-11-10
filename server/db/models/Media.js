import db from '../index'

const { ObjectId, Mixed } = db.Schema.Types

const MediaSchema = db.Schema({
	externalId: { type: String, index: true },
	author: { type: ObjectId, ref: 'Author' },
	mediaType: String,
	publicationDate: { type: Date, index: true },
	publicationName: String,
	contentHeadline: String,
	mediapageLink: String,
	previewLink: String,
	deepLink: String,
	importDate: Date,
	source: String,
	publicationText: String,
	services: Mixed,
	raw: Mixed,
	projects: [{ type: ObjectId, ref: 'Project' }],
	createdAt: { type: Date, default: Date.now, index: true },
}, { versionKey: false })

export default db.model('Media', MediaSchema)
