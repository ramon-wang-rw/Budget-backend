const mongoose = require('mongoose')

const Budget = new mongoose.Schema(
	{
		name: { type: String, required: true},
		allowance: { type: Number, required: true},
		email: { type: String, required: true},
		id: {type: String, required: true}
	},
	{ collection: 'budget' }, { "strict": false }
)


const model = mongoose.model('Budget', Budget)

module.exports = model