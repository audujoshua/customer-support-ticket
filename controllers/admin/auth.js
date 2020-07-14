const validator = require('validator');
const {checkHeader, createSession} = require('../../components/session');
const isRequred = require('../../components/is-required');
const randomStr = require('../../components/random-str');

module.exports = {
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

		// Verify Login details
		if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASS) {
			return res.json({
						status: false,
						err: "invalid-login"
					})
		}

		// If the request comes with a header, check it's validity and continue with session
		let admin_id = randomStr();
		createSession(admin_id, 'admin', (sessionId) => {
			if(sessionId != false) {
				return res.json({
								status: true,
								data: {
									token: sessionId
								}
							})
			}
			else return res.json({
				status: false
			})
		})
	}
}