var pg = require('pg');


var conString = "pg://tony:@127.0.0.1/cauguste";

exports.findAll = function(req, res) {
	var companyArray = [];
	pg.connect(conString, function(err, client) {
		if (err) throw err;
		console.log("Connected to DB...");
		var query = client.query('SELECT * FROM companies');
		query.on('row', function(row) {
			companyArray.push(row);
		});
		query.on('end', function() {
			console.log("Returning "+companyArray.length+" rows.");
			res.send(companyArray);
			console.log('Connection to DB closed.');
    });
	});
};

exports.findByCIK = function(req, res) {
	var companyArray = [];
	pg.connect(conString, function(err, client) {
		if (err) throw err;
		console.log("Connected to DB...");
		var query = client.query('SELECT * FROM companies WHERE CIK=$1', [req.params.cik]);
		query.on('row', function(row) {
			companyArray.push(row);
		});
		query.on('end', function() {
			if(companyArray.length === 0) {
				res.send(404, {message:"No company found for CIK "+req.params.cik});
			} else {
				res.send(companyArray);
				console.log('Connection to DB closed.');
			}
    });
	});
};

exports.addCompany = function(req, res) {
	// delete from companies where cik = '5555';
	var newCompany = req.body;
	console.log(newCompany);
	if (!newCompany.cik || !newCompany.name) {
		res.send(400, {message:"Company objects must include values for 'cik' and 'name'"});
	} else {
		console.log("Adding company: " + JSON.stringify(newCompany));
		pg.connect(conString, function(err, client) {
			if (err) throw err;
			console.log("Connected to DB...");
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
    // res.send({id:req.params.cik, name: "some CIK", description: "description"});
};

exports.deleteCompany = function(req, res) {
    // res.send({id:req.params.cik, name: "some CIK", description: "description"});
};