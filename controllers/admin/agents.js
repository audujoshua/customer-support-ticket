const validator = require('validator');
const isRequred = require('../../components/is-required');
const agents = require('../../models/agents');

module.exports = {

	register: (req, res) => {

		// validate input
		let errs = [];

		let email = isRequred(req.body, 'email');
		if (email !== false) {
			if (typeof(email) == 'string') {
				if (!validator.isEmail(email)) errs.push({field: "email", err: "format"});
			} else errs.push({field: "email", err: "type"})
		} else errs.push({field: "email", err: "required"})

		let fname = isRequred(req.body, 'fname');
		if (fname !== false){
			if (typeof(fname) !== 'string') errs.push({field: "fname", err: "type"})
		} else errs.push({field: "fname", err: "required"});

		let lname = isRequred(req.body, 'lname');
		if (lname !== false){
			if (typeof(lname) !== 'string') errs.push({field: "lname", err: "type"})
		} else errs.push({field: "lname", err: "required"});

		let roles = isRequred(req.body, 'roles');
		if (roles !== false) {
			if (typeof(roles) !== 'object') errs.push({field: "roles", err: "type"})
		} else errs.push({field: "roles", err: "required"})

		if (errs.length > 0) {
			return res.json({
				status: false,
				err: errs
			})
		}

		// Generate token from user email.

		// Create the Agent's record.
		let newAgent = new agents({
			email,
			fname,
			lname,
			roles
		})
		newAgent.save((err, result) => {
			if (!err) {
				res.json({
					status: true,
					data: result
				})
			} else {
				log(err);
				res.json({
					status: false,
					msg: "Record could not be created."
				})
			}
		})
	}
}