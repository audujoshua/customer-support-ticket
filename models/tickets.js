const mongoose = require('mongoose'),
	Schema = mongoose.Schema;


// Create a schema
const _schema = new Schema({
	user_id: {
		type: Schema.Types.ObjectId,
    	ref: "users"
	},
	agent_id: {
		type: Schema.Types.ObjectId,
    	ref: "agents"
	},
	category: String,
	text: String,
	date_assigned: Date,
	date_closed: Date,
	remark: String,
	comments: Array,
	created: { type: Date, default: Date.now}
});


// Create the model
const model = mongoose.model('tickets', _schema);


// Export the model
module.exports = model;