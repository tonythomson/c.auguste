var pg = require('pg');

exports.findAll = function(req, res) {
    res.send([{name:'company1'}, {name:'company2'}, {name:'company3'}]);
};

exports.findByCIK = function(req, res) {
    res.send({id:req.params.cik, name: "some CIK", description: "description"});
};