var pg = require('pg');

exports.findAll = function(req, res) {
	// Return all filings
	var returnObj = {
		object: "list",
		url: req.path,
		count: 0
	};
	var filingArray = [];
	pg.connect(process.env.DATABASE_URL, function(err, client) {
		if (err) throw err;
		console.log("Connected to DB...");
		var nextFiling = true;
		var query = client.query('SELECT * FROM filings, documents WHERE filings.acc_num = documents.acc_num ORDER BY filings.acc_num, documents.seq');
		query.on('row', function(row) {
			if (nextFiling === true) {
				row.documents = [];
				row.documents[row.seq] = {
					seq: row.seq,
					descr: row.f_descr,
					f_name: row.f_name,
					f_type: row.f_type,
					f_size: row.f_size
				};
				delete row.id;
				delete row.seq;
				delete row.f_name;
				delete row.f_type;
				delete row.f_size;
				delete row.f_descr;
				filingArray.push(row);
			} else {
				var doc = {
					seq: row.seq,
					f_descr: row.f_descr,
					f_name: row.f_name,
					f_type: row.f_type,
					f_size: row.f_size
				};
				filingArray[filingArray.length-1].documents[row.seq] = doc;
			}
			if(row.seq === row.num_docs) {
				nextFiling = true;
			} else {
				nextFiling = false;
			}
		});
		query.on('end', function() {
			returnObj['data'] = filingArray;
			returnObj['count'] = filingArray.length;
			console.log("Returning " + (filingArray.length) + " rows.");
			res.send(returnObj);
			console.log('Connection to DB closed.');
    });
	});
};

exports.findByAccNum = function(req, res) {
	// Return data for filing specified by acc_num
	var filing = {};
	pg.connect(process.env.DATABASE_URL, function(err, client) {
		if (err) throw err;
		console.log("Connected to DB...");
		var nextFiling = true;
		var query = client.query('SELECT * FROM filings, documents WHERE filings.acc_num = $1 AND documents.acc_num = $1 ORDER BY documents.seq', [req.params.acc_num]);
		query.on('row', function(row) {
			if (nextFiling === true) {
				row.documents = [];
				row.documents[row.seq] = {
					seq: row.seq,
					descr: row.f_descr,
					f_name: row.f_name,
					f_type: row.f_type,
					f_size: row.f_size
				};
				delete row.id;
				delete row.seq;
				delete row.f_name;
				delete row.f_type;
				delete row.f_size;
				delete row.f_descr;
				// filingArray.push(row);
				filing = row;
			} else {
				var doc = {
					seq: row.seq,
					f_descr: row.f_descr,
					f_name: row.f_name,
					f_type: row.f_type,
					f_size: row.f_size
				};
				filing.documents[row.seq] = doc;
			}
			if(row.seq === row.num_docs) {
				nextFiling = true;
			} else {
				nextFiling = false;
			}
		});
		query.on('end', function() {
			if(filing.acc_num === undefined) {
				res.send(404, {message:"No filing found for accession number "+req.params.acc_num});
			} else {
				res.send(filing);
				console.log('Connection to DB closed.');
			}
    });
	});
};