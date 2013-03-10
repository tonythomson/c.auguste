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
	var filing = {};
	filing.cik = row[0];
	filing.company_name = row[1];
	filing.form_type = row[2];
	filing.file_date = row[3];
	filing.acc_num = parseAccNum(row[4]);
	return filing;
};

var removeDupes = function (filingsArray) {
	filingsArray = _.uniq( _.map( filingsArray, function( filing ){
		return JSON.stringify( filing );
	}));
	filingsArray = _.map( filingsArray, function( filing ){
		return JSON.parse( filing );
	});
	return filingsArray;
};

var logFileResults = function(filename, linesSkipped, firstCount, lastCount){
		console.log("Scanned file "+filename+":");
		console.log("-"+linesSkipped+" non-delimited lines skipped");
		console.log(lastCount + " rows scanned ("+(firstCount-lastCount) + " duplicates found/removed).");
};

var conString = "pg://tony:@127.0.0.1/cauguste";
var filename = "master.20130307.idx";
var filingsArray = [];
var client = new pg.Client(conString);
var linesSkipped = 0;

client.connect(function(err) {
	if (err) throw err;
	csv()
	.from.stream(fs.createReadStream(__dirname+'/data/'+filename), {delimiter:'|'})
	.transform(function(data){
		if((data.length < 5)||(data[0] === "CIK")) { linesSkipped++; return null; }
		else { return data; }
	})
	.on('record', function(row,index){
		filingsArray.push(parseMasterIdxRow(row));
	})
	.on('end', function(count){
		var firstCount = filingsArray.length;
		filingsArray = removeDupes(filingsArray);
		var lastCount = filingsArray.length;
		logFileResults(filename, linesSkipped, firstCount, lastCount);
		_.each(filingsArray, function(filing, line) {
			client.query('INSERT INTO filings (acc_num, form_type, file_date, issuer) VALUES ($1, $2, $3, $4)', [filing.acc_num, filing.form_type, filing.date, filing.cik], function(err, result) {
				if (err) console.log("Error at "+filing.issuer+" / "+filing.acc_num+": "+err);
			});
		});
	})
	.on('error', function(error){
		console.log(error.message);
	});




});

