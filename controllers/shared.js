const tickets = require("../models/tickets");
const isRequred = require('../components/is-required');

module.exports = {


	// Generic function for adding comment. Used by both the user and the agent.
	_ticketComment: (ticketId, text, userId, agentId, callback) => {

		if (!text) return callback({
			status: false,
			err: "text-required"
		})

		// confirm that ticket exists
		tickets.findOne({_id: ticketId}, (err, ticket) => {
			if (!err) {
				if (ticket) {

					// confirm that ticket is not closed
					if (isRequred(ticket, 'date_closed') !== false) return callback(null, {
						status: false,
						err: "ticket-closed"
					})
					
					// Ensure that it's the right agent.
					if (agentId) {
						if (ticket.agent_id != agentId) return callback(null, {
							status: false,
							err: "not-allowed"
						})
					}					

					// Users. check if user created this ticket and if ticket an agent has responded to the ticket.
					if (userId) {
						if (ticket.user_id != userId) return callback(null, {
							status: false,
							err: "not-allowed"
						})
						if (ticket.comments.length == 0) return callback(null, {
							status: false,
							err: "no-comment"
						})

					}

					// save comment
					ticket.comments.push({
						text,
						is_agent: agentId ? 1 : 0,
						created: new Date()
					})
					tickets.updateOne({_id: ticket._id}, {$set: {comments: ticket.comments}}, (err, status) => {
						if (!err) {
							callback(null, {
								status: true,
								data: ticket.comments
							});
						} else {
							log(err);
							callback("Unable to record comment.");
						}
					});

				} else callback(null, {
					status: false,
					err: 'ticket-not-found'
				});
			} else {
				log(err);
				callback('unable to fetch ticket.');
			}
		})
	}
}