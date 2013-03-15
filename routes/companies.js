var pg = require('pg');


var conString = "pg://tony:@127.0.0.1/cauguste";

exports.findAll = function(req, res) {
	// Return all companies
	var returnObj = {
		object: "list",
		url: req.path,
		count: 0
	};
	pg.connect(conString, function(err, client) {
		if (err) throw err;
		console.log("Connected to DB...");
		var query = client.query('SELECT * FROM companies');
		query.on('row', function(row, result) {
			result.addRow(row);
		});
		query.on('end', function(result) {
			returnObj['data'] = result.rows;
			returnObj['count'] = result.rows.length;
			console.log("Returning "+result.rows.length+" rows.");
			res.send(returnObj);
			console.log('Connection to DB closed.');
    });
	});
};

exports.findByCIK = function(req, res) {
	// Return data for company specified by CIK
	var company = {};
	pg.connect(conString, function(err, client) {
		if (err) throw err;
		console.log("Connected to DB...");
		var query = client.query('SELECT * FROM companies WHERE CIK=$1', [req.params.cik]);
		query.on('row', function(row) {
			company = row;
		});
		query.on('end', function() {
			if(company.cik === undefined) {
				res.send(404, {message:"No company found for CIK "+req.params.cik});
			} else {
				res.send(company);
				console.log('Connection to DB closed.');
			}
    });
	});
};

exports.addCompany = function(req, res) {
	// Add a new company entry to companies table;
	var newCompany = req.body;
	if (!newCompany.cik || !newCompany.name) {
		res.send(400, {message:"Company objects must include values for 'cik' and 'name'"});
	} else {
		pg.connect(conString, function(err, client) {
			if (err) throw err;
			console.log("Connected to DB...");
			// TO-DO: Insert data for other fields if they are present
			var query = client.query('INSERT INTO companies (cik, name) VALUES ($1, $2)', [newCompany.cik, newCompany.name]);
			query.on('error', function(err) {
				console.log(err);
			});
			query.on('end', function(result) {
				console.log("INSERT successful");
				res.send(200, {message:"New company created with cik "+newCompany.cik});
				console.log('Connection to DB closed.');
			});
		});
	}
};

exports.updateCompany = function(req, res) {
	// Update fields for company specified by CIK
	var companyInfo = req.body;
	pg.connect(conString, function(err, client) {
		if (err) throw err;
		console.log("Connected to DB...");
		var query = client.query('UPDATE companies SET incorp_st = $1, fy_end = $2 WHERE CIK=$3', [companyInfo.incorp_st, companyInfo.fy_end, req.params.cik]);
		query.on('error', function(err) {
			console.log("Error: " + err);
		});
		query.on('end', function() {
			console.log("UPDATE successful");
			res.send(200, {message:"Company at cik " + req.params.cik + " updated."});
			console.log('Connection to DB closed.');
    });
	});
};

exports.deleteCompany = function(req, res) {
	// Deletes company specified by CIK
	pg.connect(conString, function(err, client) {
		if (err) throw err;
		console.log("Connected to DB...");
		var query = client.query('DELETE FROM companies WHERE CIK = $1',[req.params.cik]);
		query.on('error', function(err) {
			console.log("Error: " + err);
		});
		query.on('end', function() {
			console.log("DELETE successful");
			res.send(200, {message:"Company at cik " + req.params.cik + " deleted."});
			console.log('Connection to DB closed.');
    });
	});
};