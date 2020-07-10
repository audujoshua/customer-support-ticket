const mongoose = require('mongoose'),
	Schema = mongoose.Schema;


// Create a schema
const _schema = new Schema({
	email: String,
	fname: String,
	lname: String,
	password: String,
	roles: Array,
	token: String,
	updated: Date,
	created: { type: Date, default: Date.now}
});


// Create the model
const model = mongoose.model('agents', _schema);


// Export the model
module.exports = model;