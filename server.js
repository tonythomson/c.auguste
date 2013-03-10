var express = require('express'),
          // _ = require("underscore"),
  companies = require('./routes/companies');

var app = express();

app.configure(function () {
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
});

app.get('/companies', companies.findAll);
app.get('/companies/:cik', companies.findByCIK);
app.post('/companies', companies.addWine);
app.put('/companies/:id', companies.updateWine);
app.delete('/companies/:id', companies.deleteWine);

app.listen(3000);
console.log('Listening on port 3000...');