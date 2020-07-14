const express = require('express');
const router = express.Router();
const {hasSession} = require('./components/session');

// Controllers
const admin = require('./controllers/admin/index.js');
const agents = require('./controllers/agents/index.js');
const users = require('./controllers/users/index.js');


// Export the router
module.exports = router;

router.get('/', (req, res) => {res.json({msg: "Customer Ticket Support System - Fliqpay."})});

// User Routes
router.post('/user/auth/init', users.auth.init);
router.post('/user/auth/confirm', users.auth.login);
router.post('/user/tickets', hasSession, users.tickets.open);
router.post('/user/ticket/:ticket_id/comment', hasSession, users.tickets.addComment);
router.get('/user/tickets', hasSession, users.tickets.fetch);

// Agent Routes
router.post('/agent/auth/reset', agents.auth.reset);
router.post('/agent/auth', agents.auth.updatePassword);
router.post('/agent/auth/token', agents.auth.checkToken);
router.post('/agent/auth/login', agents.auth.login);
router.put('/agent/ticket/:ticket_id/rep', hasSession, agents.tickets.claim);
router.post('/agent/ticket/:ticket_id/comment', hasSession, agents.tickets.addComment);
router.put('/agent/ticket/:ticket_id/close', hasSession, agents.tickets.close);
router.get('/agent/tickets/open', hasSession, agents.tickets.getOpenTickets);

// Admin Routes
router.post('/admin/login', admin.auth.login);
router.post('/admin/agents', hasSession, admin.agents.register);
router.post('/admin/tickets/report', hasSession, admin.tickets.generateReport);