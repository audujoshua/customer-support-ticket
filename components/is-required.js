// Ensure that a keyed variable exists in an object.
module.exports = function isRequired(body, key) {
	let typ = typeof(body[key]);
	if (typ != 'undefined') {
		if (typ == 'string') {
			let trimmed = body[key].trim();
			if (trimmed.length == 0) return false;
			else return trimmed;
		} else return body[key];
	} else return false;
};