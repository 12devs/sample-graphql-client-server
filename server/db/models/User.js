import bcrypt from 'bcrypt'
import db from '../index'

const { ObjectId } = db.Schema.Types

const UserSchema = db.Schema({
	email: { type: String, unique: true },
	password: String,
	name: String,
	status: { type: String, required: true, enum: ['PENDING', 'ACTIVE', 'INACTIVE'], default: 'PENDING' },
	isAdmin: { type: Boolean, default: false },
	projects: [{
		project: { type: ObjectId, ref: 'Project' },
		role: { type: String, required: true, enum: ['OPERATOR', 'ANALYST'], default: 'ANALYST' },
	}],
	createdAt: { type: Date, default: Date.now },
}, { versionKey: false })

UserSchema.pre('save', function lowercaseEmail (next) {
	this.email = this.email.toLowerCase()
	next()
})

UserSchema.methods.comparePassword = async function comparePassword (password) {
	return await bcrypt.compare(password, this.password)
}

UserSchema.methods.isActive = function isActive () {
	return this.status === 'ACTIVE' || this.status === 'PENDING'
}

UserSchema.statics.hashPassword = async (password) => {
	try {
		const salt = await bcrypt.genSalt(10)

		return await bcrypt.hash(password, salt)
	} catch (error) {
		throw new Error('Hashing failed', error)
	}
}

export default db.model('User', UserSchema)
