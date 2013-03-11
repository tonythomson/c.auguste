var express = require('express'),
  companies = require('./routes/companies'),
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

app.listen(3000);
console.log('Listening on port 3000...');