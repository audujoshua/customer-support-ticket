const validator = require('validator');
const users = require("../../models/users");
const isRequred = require('../../components/is-required');
const appConst = require("../../components/constants");
const {checkHeader, createSession} = require('../../components/session');

module.exports = {

	// initiate the login process. Token is sent to user's email
	init: (req, res) => {

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

		// If user exists on the system, send a login link, otherwise create the user
		let token = _createLoginToken(email);
		users.findOne({email}, (err, user) => {
			if (!err) {
				if (!user) {

					// Create new user
					let newUser = new users({
						email,
						token,
						token_created: new Date()
					})
					newUser.save((err, status) => {
						if (!err) {
							res.json({
								status: true,
								data: token
							})
						} else {
							log(err);
							res.json({
								status: false,
							})
						}
					})

				} else {

					// Update login token
					users.updateOne({_id: user._id}, {$set: {token, token_created: new Date()}}, (err, status) => {
						if (!err) {

							// An email is expected to be sent at this point.
							// ...
							res.json({
								status: true,
								data: token
							})
						} else {
							log(err);
							res.json({
								status: false
							})
						}
					});
				}
			} else {
				log(err);
				res.json({
					status: false,
				})
			}
		})
	},

	// Confirmation of the login token and create a session for the user.
	login: (req, res) => {

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

		// Verify the token sent
		users.findOne({token}, (err, user) => {
			if (!err) {
				if (user) {

					// Check if the token is still valid
					let currentTime = new Date().getTime();
	                let tokenCreated = new Date(user['token_created']).getTime();

	                if ((currentTime - tokenCreated) < appConst.USER_LOGIN_TOKEN_LIMIT) {

	                	// Create session
	                   	createSession(user._id, (sessionId) => {
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

	                } else { 
	                   res.json({
	                   		status: false,
	                   		err: "token-expired"
	                   })
	                }
				} else {
					res.json({
						status: false,
						err: "not-found"
					})
				}
			} else {
				log(err);
				res.json({
					status: false,
					err: "app-err"
				})
			}
		})
	}
}


// Creates a login token for the user; combining the user email and ID
function _createLoginToken(userEmail){
	return "1234";
}