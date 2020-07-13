const validator = require('validator');
const isRequred = require('../../components/is-required');
const csv = require('csv-writer').createObjectCsvWriter;
const path = require('path');
const tickets = require("../../models/tickets");
const randomStr = require('../../components/random-str');

module.exports = {
	generateReport: (req, res) => {

		// validate input
		let errs = [];

		// start date
		let sdate = isRequred(req.body, 'sdate');
		if (sdate !== false) {
			if (typeof(sdate) === 'string') {
				if ((sdate.length != 10) || (!validator.isDate(sdate))) errs.push({field: "sdate", err: "invalid"})
			} else errs.push({field: "sdate", err: "type"})			
		} else errs.push({field: "sdate", err: "required"})

		// end date
		let edate = isRequred(req.body, 'edate');
		if (edate !== false) {
			if (typeof(edate) === 'string') {
				if ((sdate.length != 10) || (!validator.isDate(edate))) errs.push({field: "edate", err: "invalid"})
			} else errs.push({field: "edate", err: "type"})			
		} else errs.push({field: "edate", err: "required"})

		if (errs.length > 0) {
			return res.json({
				status: false,
				err: errs
			})
		}


		// End date must be more recent that start date
		if (!validator.isAfter(edate, sdate)) return res.json({
			status: false,
			err: "sdate-greater-then-edate"
		})


		// Fetch the records
		tickets.aggregate([
			{ "$match": { 
					"date_closed": { $type: 9 },
					"created": {
				        $gte: new Date(sdate),
				        $lte: new Date(edate)
				    }
				}
			},
			{ "$lookup": {
					"localField": "agent_id",
					"from": "agents",
					"foreignField": "_id",
					"as": "agent"
				} 
			},
			{ "$unwind": "$agent" },
			{ "$lookup": {
					"localField": "user_id",
					"from": "users",
					"foreignField": "_id",
					"as": "user"
				} 
			},
			{ "$unwind": "$user" }
		], (err, result) => {
			if (!err) {

				if (result.length > 0) {

					// Set the header
					let header = [
				        { id: 'created', title: 'Date Created' },				        
				        { id: 'user', title: 'Customer' },
				        { id: 'agent', title: 'Agent Email' },
				        { id: 'agentname', title: 'Agent Name' },
				        { id: 'closed', title: 'Date Closed' },
				        { id: 'remark', title: 'Closing Remarks' },
				    ];

					// Format the data
					let data = result.map(r => { return {
							'created': r.created.toISOString().substr(0, 19),							
							'user': r.user.email,
							'agent': r.agent.email,
							'agentname': r.agent.fname + " " + r.agent.lname,
							'closed': r.date_closed.toISOString().substr(0, 19),
							'remark': r.remark
						}						
					})

					// Write to csv
					let fname = randomStr() + '_' + new Date().getTime() + '.csv';
					_generateCSV(fname, header, data, (err) => {
						if (!err) {
							res.json({
								status: true,
								data: {
									file: `/public/${fname}`
								}
							})
						} else {
							log(err);
							res.json({
								status: false,
								err: "file-failed"
							})
						}
					})

				} else res.json({
					status: false,
					err: "no-data"
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


function _generateCSV(fname, header, data, callback){
	const newCsv = csv({
	    path: path.join(process.cwd(), 'public', fname),
	    header
	});

	newCsv.writeRecords(data)
		  .then(callback)
}