var request = require("request");

describe("C.Auguste API: Companies", function() {

  xit("Should respond to get requests for /companies", function(done) {
    request("http://127.0.0.1:3000/v0/companies",
      function(error, response, body) {
        expect(response.statusCode).toEqual(200);
        var companies = JSON.parse(body);
        expect(companies.length).toEqual(3188);
        expect(companies[0].cik).toEqual('1000275');
        done();
      });
  });

  xit("Should return the correct result to a get request for /companies/1000275", function(done) {
    request("http://127.0.0.1:3000/v0/companies/1000275",
      function(error, response, body) {
        expect(response.statusCode).toEqual(200);
        var companies = JSON.parse(body);
        expect(companies.length).toEqual(1);
        expect(companies[0].name).toEqual('ROYAL BANK OF CANADA');
        done();
      });
  });

  xit("Should return an error message to a get request for /companies/9999", function(done) {
    request("http://127.0.0.1:3000/v0/companies/9999",
      function(error, response, body) {
        expect(response.statusCode).toEqual(404);
        var result = JSON.parse(body);
        expect(result.message).toEqual('No company found for CIK 9999');
        done();
      });
  });

  it("Should accept posts to /companies", function(done) {
    request.post("http://127.0.0.1:3000/v0/companies", {form:{cik:'5555', name:'BLACK SUN CORP.'}},
      function(error, response, body) {
        expect(response.statusCode).toEqual(200);
        var result = JSON.parse(body);
        expect(result.message).toEqual('New company created with cik 5555');
        done();
      });
    request("http://127.0.0.1:3000/v0/companies/5555",
      function(error, response, body) {
        expect(response.statusCode).toEqual(200);
        var companies = JSON.parse(body);
        expect(companies.length).toEqual(1);
        expect(companies[0].name).toEqual('BLACK SUN CORP.');
        done();
      });
  });


  xit("Should 404 when asked for a nonexistent file", function(done) {
    request("http://127.0.0.1:8080/arglebargle",
      function(error, response, body) {
        expect(response.statusCode).toEqual(404);
        done();
      });
  });

});