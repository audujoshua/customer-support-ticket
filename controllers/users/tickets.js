const ticketCategories = require("../../components/ticket-categories");
const tickets = require("../../models/tickets");
const isRequred = require('../../components/is-required');
const {_ticketComment} = require("../shared");

module.exports = {

	// Opens a new ticket
	open: (req, res) => {

		// validate input
		let errs = [];

		let category = isRequred(req.body, 'category');
		if (category !== false){
			if (typeof(category) === 'number') {			
				let match = ticketCategories.find(t => t.id === category)
				if (!match) errs.push({field: "category", err: "invalid"})
			} else errs.push({field: "category", err: "type"})			
		} else errs.push({field: "category", err: "required"});

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


		// Create the ticket
		let newTicket = new tickets({
			user_id: req.app.locals.userId,
			text,
			category,
			comments: []
		})
		newTicket.save((err, ticket) => {
			if (!err) {
				res.json({
					status: true,
					data: {
						id: ticket._id
					}
				})
			} else {
				log(err);
				res.json({
					status: false
				})
			}
		})
	},

	// Adds a comment to a ticket
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
		_ticketComment(ticketId, text, req.app.locals.userId, null, (err, r) => {
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

	// Fetch tickets
	fetch: (req, res) => {
		console.log(req.app.locals.userId);
		tickets.find({user_id: req.app.locals.userId}, (err, result) => {
			if (!err) {

				// process the result to set the status.
				let status = 'open';
				let data = result.map(r => {

					if (r['date_assigned']) status = 'assigned';
					if (r['date_closed']) status = 'closed';

					return {
						id: r._id,
						text: r.text,
						category: r.category,
						comments: r.comments,
						created: r.created,
						agent_id: r.agent_id,
						date_assigned: r.date_assigned,
						status: status
					}
				})

				// send response
				res.json({
					status: true,
					data: {
						tickets: data
					}
				})
			} else {
				log(err);
				res.json({
					status: false
				})
			}
		})
	}
}