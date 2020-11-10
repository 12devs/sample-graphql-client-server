import db from '../index'

const ProjectSchema = db.Schema({
	name: String,
	createdAt: { type: Date, default: Date.now, index: true },
}, { versionKey: false })

export default db.model('Project', ProjectSchema)
