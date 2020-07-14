const validator = require('validator');
const agents = require("../../models/agents");
const isRequred = require('../../components/is-required');
const hasher = require('../../components/hash.js');
const appConst = require('../../components/constants');
const {checkHeader, createSession} = require('../../components/session');
const crypto = require('crypto');
const randomStr = require('../../components/random-str');


module.exports = {

	// Updates password for user
	updatePassword: (req, res) => {

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
		_validateToken(token, (err, agentId) => {
			if (!err) {

				// Update the password and clear the token.
				agents.updateOne({_id: agentId}, {$set: {password: hasher(password), token: '', updated: new Date()}}, (err, status) => {
					if (!err) {
						res.json({
							status: true
						})
					} else {
						log(err);
						res.json({
							status: false
						})
					}
				})
			} else {
				log(token + " " + err);
				res.json({
					status: false,
					err
				})
			}
		})
	},

	// Check if password is already set.
	checkToken: (req, res) => {

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

		_validateToken(token, (err, pStatus) => {
			if (!err) {
				res.json({
					status: true
				})
			} else {
				log(token + " " + err);
				res.json({
					status: false,
					err
				})
			}
		})
	},

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
						createSession(agent._id, (sessionId) => {
							if(sessionId != false) {
								return res.json({
												status: true,
												data: {
													token: sessionId
												}
											})
							}
							else return res.json({
								status: false,
								msg: "Unable to register session."
							})
						})

					} else return res.json({
						status: false,
						err: "login-invalid"
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
	},

	// Initate password reset
	reset: (req, res) => {

		// Validate input
		let errs = [];

		let email = isRequred(req.body, 'email');
		if (email !== false) {
			if (typeof(email) == 'string') {
				if (!validator.isEmail(email)) errs.push({field: "email", err: "format"});
			} else errs.push({field: "email", err: "type"})
		} else errs.push({field: "email", err: "required"})

		if (errs.length > 0) {
			return res.json({
				status: false,
				err: errs
			})
		}

		// Confirm user exists before carrying out the update
		agents.findOne({email}, (err, agent) => {
			if (!err) {
				if (agent) {
					let secret = randomStr() + email;
					let token = crypto.createHash('md5').update(secret).digest("hex");
					agents.updateOne({_id: agent._id}, {$set: {token, token_created: new Date()}}, (err, status) => {
						if (!err) {
							res.json({
								status: true,
								data: {
									token
								}
							})
						} else {
							log(err);
							res.json({
								status: false
							})
						}
					});
				} else {
					res.json({
						status: false,
						err: "email-not-found"
					})
				}
			} else {
				log(err);
				res.json({
					status: false
				})
			}
		})
	}
}


// Returns Record if set, else return false.
function _validateToken(token, callback){
	agents.findOne({token}, (err, agent) => {
		if (!err) {
			if (agent) {

				// Check if the token is still valid
				let currentTime = new Date().getTime();
                let tokenCreated = new Date(agent['token_created']).getTime();

                if (((currentTime - tokenCreated) / 1000) < appConst.AGENT_PASSWORD_RESET_LIMIT) {
                	callback(null, agent._id);
                } else { 
                	callback("token-expired");
                }
			} else {
				callback(`token-not-found`);
			}
		} else {
			log(err + " - Unable to check password status.");
			callback("error");
		}
	})
}