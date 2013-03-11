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
    // res.send({id:req.params.cik, name: "some CIK", description: "description"});
};

exports.updateCompany = function(req, res) {
    // res.send({id:req.params.cik, name: "some CIK", description: "description"});
};

exports.deleteCompany = function(req, res) {
    // res.send({id:req.params.cik, name: "some CIK", description: "description"});
};