var  fs = require('fs'),
    csv = require('csv'),
     pg = require('pg'),
request = require('request');
cheerio = require('cheerio');
      _ = require('underscore');

var parseAccNum = function(path) {
	var regexp = /edgar\/data\/\d*\/(\S*)\.txt/g;
	var match = regexp.exec(path);
	return match[1];
};

var parseMasterIdxRow = function(row) {
	// Takes a row from the IDX file and Returns a 'filing' object
	var filing = {};
	filing.issuer = row[0];
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
	console.log("Scanned file " + filename + ":");
	console.log("-> "+linesSkipped+" non-delimited lines skipped");
	console.log(lastCount + " rows scanned (" + (firstCount-lastCount) + " duplicates found/removed).");
};

var insertFilingIfUnknown = function(client, filing) {
	// var query = client.query('SELECT 1 FROM filings WHERE acc_num=$1 AND issuer=$2', [filing.acc_num, filing.issuer]);
	var query = client.query('SELECT 1 FROM filings WHERE acc_num=$1', [filing.acc_num]);
	query.on('error', function(err) {
		console.log("Error verifying filing exists: " + err);
	});
	query.on('end', function(result) {
		// If filing is not already in DB
		if (result.rowCount === 0) {

			console.log("FILING: Fetching details for acc_num " + filing.acc_num);
			request("http://www.sec.gov/Archives/edgar/data/" + filing.issuer + "/" + filing.acc_num + "-index.htm",
				function(err, response, body) {
					if (err) throw err;
					$ = cheerio.load(body);
					var descr = $('#formName').text();
					var regex_trim = /\S.*\S/;
					var match = regex_trim.exec(descr);
					if(match !== null) { filing.descr = match[0]; }

					var formHeaders = $('.infoHead').map(function () { return $(this).text(); });
					var formInfo = $('.info').map(function () { return $(this).text(); });
					var form = _.object(formHeaders, formInfo);
					if(form['Filing Date']) { filing.file_date = form['Filing Date']; }
					if(form['Filing Date Changed']) { filing.file_date_ch = form['Filing Date Changed']; }
					if(form['Accepted']) { filing.acc_date = form['Accepted']; }
					if(form['Documents']) { filing.documents = form['Documents']; }
					if(form['Group Members']) { filing.group_members = form['Group Members']; }
					if(form['Items']) { filing.items = form['Items']; }

					var numDocs = parseInt(filing.documents, 10);
					for (var i = 2; i <= (numDocs + 2); i++) {
						var doc = {};
						doc.acc_num = filing.acc_num;
						docArray = $('.tableFile tr:nth-child('+i+') td').map(function () { return $(this).text(); });
						if(docArray[0] > 0) { doc.seq = docArray[0]; }
						else { doc.seq = 0; }
						doc.descr = docArray[1];
						doc.file_name= docArray[2];
						doc.ftype = docArray[3];
						if(docArray[4] > 0) { doc.fsize = docArray[4]; }
						client.query('INSERT INTO documents (seq, descr, file_name, type, size, acc_num) VALUES ($1, $2, $3, $4, $5, $6)', [doc.seq, doc.descr, doc.file_name, doc.ftype, doc.fsize, doc.acc_num], function(err, result) {
							if (err) console.log("Error INSERTing document " + doc.acc_num + " in " + doc.seq + ": " + err);
						});
					}

					client.query('INSERT INTO filings (acc_num, descr, form_type, file_date, file_date_ch, acc_date, rep_period, eff_date, documents, group_members, items, issuer, reporter) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)', [filing.acc_num, filing.descr, filing.form_type, filing.file_date, filing.file_date_ch, filing.acc_date, filing.rep_period, filing.eff_date, filing.documents, filing.group_members, filing.items, filing.issuer, filing.reporter], function(err, result) {
						if (err) console.log("Error INSERTing filing" + filing.cik + " / " + filing.acc_num + ": " + err);
					});
			});
		} else {
			console.log("Filing " + filing.acc_num + " already in DB.");
		}
	});
};

var insertCompany = function(client, company) {
	var query = client.query('SELECT 1 FROM companies where cik=$1', [company.cik]);
	client.query('INSERT INTO companies (cik, name, incorp_st, fy_end, bus_addr1, bus_addr2, bus_addr3, bus_phone, mail_addr1, mail_addr2, mail_addr3, sic) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
		[company.cik, company.name, company.incorp_st, company.fy_end, company.bus_addr1, company.bus_addr2, company.bus_addr3, company.bus_phone, company.mail_addr1, company.mail_addr2, company.mail_addr3, company.sic],
		function(err, result) {
			console.log("Error INSERTing company " + company.cik + ": " + err);
			console.log(company);
		});
};

var fetchCompanyIfUnknown = function(client, company) {
	var query = client.query('SELECT 1 FROM companies WHERE cik=$1', [company.cik]);
	query.on('end', function(result) {
		// If company is not already in DB
		if (result.rowCount === 0) {
			console.log("COMPANY: Fetching details for CIK " + company.cik);
			request("http://www.sec.gov/cgi-bin/own-disp?CIK=" + company.cik + "&action=getissuer",
				function(err, response, body) {
					if (err) {
						console.log("REQUEST ERROR: " + err);
					}
					$ = cheerio.load(body);
					var busAddress = $('b.blue:contains("Business Address")').parent().html();
					if(busAddress !== null) {
						busAddress = busAddress.split("<br>\n");

						company.bus_addr1 = busAddress[1];
						company.bus_addr2 = busAddress[2];
						// if there's a next and it contains only #
						regexpNotPhone = /[a-zA-Z]+/;
						for (var i = 3; i < busAddress.length; i++) {
							if(busAddress[i] !== undefined) {
								if (regexpNotPhone.exec(busAddress)) {
									company['bus_addr'+i] = busAddress[i];
								} else {
									company.bus_phone = busAddress[i];
								}
							}
						}
					}
					var mailAddress = $('b.blue:contains("Mailing Address")').parent().html();
					if(mailAddress !== null) {
						mailAddress = mailAddress.split("<br>\n");
						company.mail_addr1 = mailAddress[1];
						company.mail_addr2 = mailAddress[2];
						company.mail_addr3 = mailAddress[3];
					}

					var details = $('a[href*="State"]').parent().text().split('|');
					var regexp = /(\d{3,}).*location:\s(\w{2,})/m;
					var regexp2 = /Inc.:\s(\w*)\s/g;
					var regexp3 = /End:\s(\d*)/g;
					details[0] = details[0].replace(/\n/g,"");

					var match = regexp.exec(details[0]);
					if(match !== null) { company.sic = match[1]; }
					else { company.sic = null; }
					// Could also capture state location from match[2]

					match = regexp2.exec(details[1]);
					if(match !== null) { company.incorp_st = match[1]; }
					else { company.incorp_st = null; }

					match = regexp3.exec(details[2]);
					if(match !== null) { company.fy_end = match[1]; }
					else { company.fy_end = null; }

					// console.log(company);
					insertCompany(client, company);
			});
		} else {
			console.log("Company "+company.cik+" already in DB.");
		}
	});
};

var conString = "pg://tony:@127.0.0.1/cauguste";
// var filename = "master.20130307.idx";
var filename = "test.idx";
var filingsArray = [];
var companiesArray = [];
var client = new pg.Client(conString);
var linesSkipped = 0;

client.connect(function(err) {
	if (err) throw err;
	csv()
	.from.stream(fs.createReadStream(__dirname + '/data/' + filename), {delimiter:'|'})
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
			insertFilingIfUnknown(client, filing);
			companiesArray.push({cik: filing.issuer, name: filing.company_name});
		});

		// Try and insert all unique companies from this file into the companies table
		companiesArray = removeDupesFromArray(companiesArray);
		_.each(companiesArray, function(company){
			fetchCompanyIfUnknown(client, company);
		});
	})
	.on('error', function(error){
		console.log("Error parsing text file: " + error);
	});

});

