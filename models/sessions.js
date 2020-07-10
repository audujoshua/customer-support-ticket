const mongoose = require('mongoose'),
	Schema = mongoose.Schema;


// Create a schema
const _schema = new Schema({
	user_id: String,
	last_entry: { type: Date, default: Date.now}
});


// Create the model
const model = mongoose.model('sessions', _schema);


// Export the model
module.exports = model;