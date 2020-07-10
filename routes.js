// Create new router
const express = require('express');
const router = express.Router();
const {hasSession} = require('./components/session');


// Export the router
module.exports = router;


// User Routes
router.get('/', (req, res) => {res.json({msg: "Fliqpay."})});


// Agent Routes



