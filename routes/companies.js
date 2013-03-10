var pg = require('pg');

exports.findAll = function(req, res) {
    res.send([{name:'company1'}, {name:'company2'}, {name:'company3'}]);
};

exports.findByCIK = function(req, res) {
    res.send({id:req.params.cik, name: "some CIK", description: "description"});
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