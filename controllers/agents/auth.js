const validator = require('validator');
const agents = require("../../models/agents");
const isRequred = require('../../components/is-required');
const hasher = require('../../components/hash.js'),

module.exports = {

	// Sets password for user
	setPassword: (req, res) => {

		// Validate input
		let errs = [];

		let password = isRequred(req.body, 'password');
		if (password === false) errs.push({field: "password", err: "required"});

		let rpassword = isRequred(req.body, 'rpassword');
		if (rpassword === false) errs.push({field: "rpassword", err: "required"});

		let token = isRequred(req.body, 'token');
		if (token !== false){
			if (typeof(token) !== 'string') errs.push({field: "token", err: "type"})
		} else errs.push({field: "token", err: "required"});

		if (errs.length > 0) {
			return res.json({
				status: false,
				err: errs
			})
		}

		// Check password match
		if (password !== rpassword) return res.json({
			status: false,
			err: "password-mismatch"
		})


		// confirm that the password has not been set
		_isPasswordEmpty(token, (err, agentId) => {
			if (agentId) {

				// Set the password
				agents.updateOne({_id: agentId}, {$set: {password, updated: new Date()}}, (err, status) => {
					if (!err) {
						res.json({
							status: true
						})
					} else {
						log(err);
						res.json({
							status: false,
							msg: "Error on DB update"
						})
					}
				})

			} else {
				res.json({
					status: false,
					err: "password-set"
				})
			}
		})
	},

	// Check if password is already set.
	isPasswordSet: (req, res) => {

		// Validate input
		let errs = [];

		let token = isRequred(req.body, 'token');
		if (token !== false){
			if (typeof(token) !== 'string') errs.push({field: "token", err: "type"})
		} else errs.push({field: "token", err: "required"});

		if (errs.length > 0) {
			return res.json({
				status: false,
				err: errs
			})
		}

		_isPasswordEmpty(token, (err, pStatus) => {
			if (!err) {
				res.json({
					status: pStatus ? false : true
				})
			} else {
				log(err);
				res.json({
					status: false
				})
			}
		})
	}

	// Login
	login: (req, res) => {

		// validate input
		let errs = [];

		let email = isRequred(req.body, 'email');
		if (email !== false) {
			if (typeof(email) === 'string') {
				if (!validator.isEmail(email)) errs.push({field: "email", err: "invalid"})
			} else errs.push({field: "email", err: "type"})			
		} else errs.push({field: "email", err: "required"})

		let password = isRequred(req.body, 'password');
		if (password === false) errs.push({field: "password", err: "required"})

		if (errs.length > 0) {
			return res.json({
				status: false,
				err: errs
			})
		}

		// Verify login information
		agents.findOne({email: email}, (err, agent) => {
			if (!err) {
				if (agent) {
					if (agent.password == hasher(password)) {

						// If the request comes with a header, check it's validity and continue with session
						checkHeader(req, (userSessionData) => {
							if(userSessionData != false){
								return res.json({
											status: true,
											data: userSessionData._id
										})
							} else {
								createSession(agent._id, (sessionId) => {
									if(sessionId != false) {
										return res.json({
														status: true,
														data: sessionId
													})
									}
									else return res.json({
										status: false,
										msg: "Unable to register session."
									})
								})
							}
						})

					} else return res.json({
						status: false,
						err: "password-invalid"
					})
				} else res.json({
					status: false,
					err: "email-not-found"
				})
			} else {
				log(err);
				return res.json({
					status: false,
					err: "error-occured"
				})
			}
		})
	}
}


// Internal function for checking if password is set.
function _isPasswordEmpty(token, callback){
	agents.findOne({token, password: ""}, (err, result) => {
		if (!err) {
			if (result) callback(null, result._id);
			else callback(null, false);
		} else {
			log(err);
			callback("Unable to check password status.");
		}
	})
}