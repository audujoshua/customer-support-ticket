const mongoose = require('mongoose'),
	Schema = mongoose.Schema;


// Create a schema
const _schema = new Schema({
	email: String,
	token: String,
	token_created: Date,
	updated: Date,
	created: { type: Date, default: Date.now}
});


// Create the model
const model = mongoose.model('users', _schema);


// Export the model
module.exports = model;