var http = require('http'),
 express = require('express'),
      pg = require('pg'),
       _ = require("underscore");

var app = express();

app.get('/companies', function(req, res) {
    res.send([{name:'company1'}, {name:'company2'}]);
});
app.get('/companies/:cik', function(req, res) {
    res.send({id:req.params.cik, name: "some CIK", description: "description"});
});

app.listen(3000);
console.log('Listening on port 3000...');