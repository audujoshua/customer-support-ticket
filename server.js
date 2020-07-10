// install dependencies
const dotenv = require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 2300;
const mongoose = require('mongoose');
const SimpleNodeLogger = require('simple-node-logger');
const bodyParser = require('body-parser');


// Cors. Ensure that it is placed before any call most especially the static file definition. As a static file could be processed
// before the CORS header is processed if placed afterwards.
app.use(function(req, res, next) {

    res.header("Access-Control-Allow-Origin", '*');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');

    //intercepts OPTIONS method
    if ('OPTIONS' === req.method) res.sendStatus(200);
    else next();
});


// Connect to database
mongoose.connect('mongodb+srv://fliqpay-ticket-system:3JgBqiPt8zAa3Eg@cluster0.znh7p.mongodb.net/test?retryWrites=true&w=majority', { useNewUrlParser: true, useCreateIndex: true } );


// Configure
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Err log
const log = SimpleNodeLogger.createSimpleLogger({
		logFilePath:'err.log',
		timestampFormat:'YYYY-MM-DD HH:mm:ss.SSS'
	});
global.log = log.info;


// Routes
app.use(require('./routes'));


// Error Handling middleware. Err passed from sessions, etc ... middleware.
app.use(function (err, req, res, next) {
	if (err == 'login-required') {
		res.status(401).json({
			status: false,
			err: 'login-required.'
		})
	} else if(err == 'registration-required'){
		res.json({
			status: false,
			err: 'registration-required'
		})
	} else if(err == 'app-error'){
		res.json({
			status: false,
			err: 'app-error'
		})
	} else next(err); 
})


// start the server
app.listen(port, () => {
	console.log(`App started on port ${port}`)
})