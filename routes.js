// Create new router
const express = require('express');
const router = express.Router();
const {hasSession} = require('./components/session');

const admin = require('./controllers/admin/index.js');
const agents = require('./controllers/agents/index.js');
const users = require('./controllers/users/index.js');

// Export the router
module.exports = router;


router.get('/', (req, res) => {res.json({msg: "Fliqpay."})});


// User Routes
router.post('/user/auth/init', users.auth.init);
router.post('/user/auth/confirm', users.auth.login);


// Agent Routes
router.post('/agent/auth', agents.auth.setPassword);
router.post('/agent/auth/status', agents.auth.isPasswordSet);
router.post('/agent/auth/login', agents.auth.login);


// Admin Routes
router.post('/admin/login', admin.auth.login);
router.post('/admin/agents', admin.agents.register);