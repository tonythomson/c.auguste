var express = require('express'),
  companies = require('./routes/companies'),
    filings = require('./routes/filings'),
			files = require('./routes/files');

var app = express();

app.configure(function () {
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
});

// Static web pages
app.get('/', files.serveIndex);

// REST operations for companies
app.get('/v0/companies', companies.findAll);
app.get('/v0/companies/:cik', companies.findByCIK);
app.post('/v0/companies', companies.addCompany);
app.put('/v0/companies/:cik', companies.updateCompany);
app.delete('/v0/companies/:cik', companies.deleteCompany);

// REST operations for filings
app.get('/v0/filings', filings.findAll);
app.get('/v0/filings/:acc_num', filings.findByAccNum);

console.log("Environment: " + process.env.NODE_ENV);
var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Listening on " + port);
});