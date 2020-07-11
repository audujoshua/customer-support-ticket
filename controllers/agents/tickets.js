const ticketCategories = require("../../components/ticket-categories");
const tickets = require("../../models/tickets");
const isRequred = require('../../components/is-required');
const {_ticketComment} = require("../shared");

module.exports = {

	// Claim responsibility for the resolution of a ticket
	claim: (req, res) => {

		// validate input
		let errs = [];

		let ticket_id = req.params.ticket_id;
		if (typeof(ticket_id) !== 'string') errs.push({field: "ticket_id", err: "type"})

		if (errs.length > 0) {
			return res.json({
				status: false,
				err: errs
			})
		}

		// Assign ticket to user. First, confirm ticket has not been assigned.
		tickets.findOne({_id: ticket_id}, (err, ticket) => {
			if (!err) {
				if (ticket) {
					if (isRequred(ticket, 'agent_id') === false) {

						// Update the ticket with this agent's ID
						tickets.updateOne({_id: ticket_id}, {$set: {agent_id: req.app.locals.userId, date_assigned: new Date()}}, (err, status) => {
							if (!err) {
								res.json({
									status: true
								})
							} else {
								res.json({
									status: false
								})
							}
						})

					} else {
						res.json({
							status: false,
							err: "ticket-already-assigned"
						})
					}
				} else {
					res.json({
						status: false,
						err: "ticket-not-found"
					})
				}
			} else {
				log(err);
				res.json({
					status: false
				})
			}
		})
	},

	// Adds comment to a ticket
	addComment: (req, res) => {

		// validate input
		let errs = [];

		let ticketId = req.params.ticket_id;

		let text = isRequred(req.body, 'text');
		if (text !== false){
			if (typeof(text) !== 'string') errs.push({field: "text", err: "type"})
		} else errs.push({field: "text", err: "required"});

		if (errs.length > 0) {
			return res.json({
				status: false,
				err: errs
			})
		}

		// Add comment
		_ticketComment(ticketId, text, null, req.app.locals.userId, (err, r) => {
			if (!err) {
				if (r.status) {
					res.json({
						status: true,
						data: r.data
					})
				} else {
					res.json({
						status: false,
						err: r.err
					})
				}
			} else {
				log(err);
				res.json({
					status: false
				})
			}
		})
	},

	// Close ticket
	close: (req, res) => {

		// validate input
		let errs = [];

		let ticketId = req.params.ticket_id;

		if (errs.length > 0) {
			return res.json({
				status: false,
				err: errs
			})
		}

		// Confirm ticket exists and user is the owner
		tickets.findOne({id: ticketId}, (err, ticket) => {
			if (!err) {
				if (ticket) {

				} else {
					res.json({
						status: false,
						err: "ticket-not-found"
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
