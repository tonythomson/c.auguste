var  fs = require ("fs"),
    csv = require('csv'),
     pg = require('pg'),
      _ = require("underscore");

var parseAccNum = function(path) {
	var regexp = /edgar\/data\/\d*\/(\S*)\.txt/g;
	var match = regexp.exec(path);
	return match[1];
};

var parseMasterIdxRow = function(row) {
	// Takes a row from the IDX file and Returns a 'filing' object
	var filing = {};
	filing.cik = row[0];
	filing.company_name = row[1];
	filing.form_type = row[2];
	filing.file_date = row[3];
	filing.acc_num = parseAccNum(row[4]);
	return filing;
};

var removeDupesFromArray = function (recordsArray) {
	// Takes an array of objects and returns an array with duplicate objects removed
	recordsArray = _.uniq( _.map( recordsArray, function( filing ){
		return JSON.stringify( filing );
	}));
	recordsArray = _.map( recordsArray, function( filing ){
		return JSON.parse( filing );
	});
	return recordsArray;
};

var logFileResults = function(filename, linesSkipped, firstCount, lastCount){
		// Logs some simple stats to console
		console.log("Scanned file "+filename+":");
		console.log("-"+linesSkipped+" non-delimited lines skipped");
		console.log(lastCount + " rows scanned ("+(firstCount-lastCount) + " duplicates found/removed).");
};

var conString = "pg://tony:@127.0.0.1/cauguste";
var filename = "master.20130307.idx";
var filingsArray = [];
var companiesArray = [];
var client = new pg.Client(conString);
var linesSkipped = 0;

client.connect(function(err) {
	if (err) throw err;
	csv()
	.from.stream(fs.createReadStream(__dirname+'/data/'+filename), {delimiter:'|'})
	.transform(function(data){
		// Ignore rows in the file that are not delimited data
		if((data.length < 5)||(data[0] === "CIK")) { linesSkipped++; return null; }
		else { return data; }
	})
	.on('record', function(row,index){
		// Build an array of filing objects based on parsed rows
		filingsArray.push(parseMasterIdxRow(row));
	})
	.on('end', function(count){
		var firstCount = filingsArray.length;
		filingsArray = removeDupesFromArray(filingsArray);
		var lastCount = filingsArray.length;
		logFileResults(filename, linesSkipped, firstCount, lastCount);

		// Try and insert all unique filings from this file into the filings table (log & ignore INSERT errors);
		_.each(filingsArray, function(filing, line) {
			client.query('INSERT INTO filings (acc_num, form_type, file_date, issuer) VALUES ($1, $2, $3, $4)', [filing.acc_num, filing.form_type, filing.file_date, filing.cik], function(err, result) {
				if (err) console.log("Error at "+ filing.cik + " / " + filing.acc_num + ": " + err);
			});
			companiesArray.push({cik: filing.cik, name: filing.company_name});
		});

		// Try and insert all unique companies from this file into the companies table (ignore INSERT errors);
		companiesArray = removeDupesFromArray(companiesArray);
		_.each(companiesArray, function(company){
			client.query('INSERT INTO companies (cik, name) VALUES ($1, $2)', [company.cik, company.name], function(err, result) {});
		});
	})
	.on('error', function(error){
		console.log(error.message);
	});

});

