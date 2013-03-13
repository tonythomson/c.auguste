var request = require("request");
// Tests are based on the dataset loaded from the text.idx file

describe("C.Auguste API: Companies", function() {

  it("Should respond to GET requests for /companies", function(done) {
    request("http://127.0.0.1:3000/v0/companies",
      function(error, response, body) {
        expect(response.statusCode).toEqual(200);
        var companies = JSON.parse(body);
        expect(companies.data.length).toEqual(305);
        expect(companies.data.length).toEqual(companies.count);
        expect(companies.data[0].cik).toEqual('0001004980');
        done();
      });
  });

  it("Should return the correct result to a GET request for /companies/1000275", function(done) {
    request("http://127.0.0.1:3000/v0/companies/1000275",
      function(error, response, body) {
        expect(response.statusCode).toEqual(200);
        var company = JSON.parse(body);
        expect(company.cik).toEqual('1000275');
        expect(company.name).toEqual('ROYAL BANK OF CANADA');
        done();
      });
  });

  it("Should return an error message to a GET request for /companies/9999", function(done) {
    request("http://127.0.0.1:3000/v0/companies/9999",
      function(error, response, body) {
        expect(response.statusCode).toEqual(404);
        var result = JSON.parse(body);
        expect(result.message).toEqual('No company found for CIK 9999');
        done();
      });
  });

  it("Should accept POSTs to /companies", function(done) {
    request.post("http://127.0.0.1:3000/v0/companies", {form:{cik:'5555', name:'BLACK SUN CORP.'}},
      function(error, response, body) {
        expect(response.statusCode).toEqual(200);
        var result = JSON.parse(body);
        expect(result.message).toEqual('New company created with cik 5555');
        done();

      request("http://127.0.0.1:3000/v0/companies/5555",
        function(error, response, body) {
          expect(response.statusCode).toEqual(200);
          var company = JSON.parse(body);
          expect(company.cik).toEqual('5555');
          expect(company.name).toEqual('BLACK SUN CORP.');
          done();
        });
      });
  });

  it("Should accept PUTs to /companies", function(done) {
    request.put("http://127.0.0.1:3000/v0/companies/5555", {form:{fy_end:'1231', incorp_st:'CA'}},
      function(error, response, body) {
        expect(response.statusCode).toEqual(200);
        var result = JSON.parse(body);
        expect(result.message).toEqual('Company at cik 5555 updated.');
        done();

        request("http://127.0.0.1:3000/v0/companies/5555",
          function(error, response, body) {
            expect(response.statusCode).toEqual(200);
            var company = JSON.parse(body);
            expect(company.fy_end).toEqual(1231);
            expect(company.incorp_st).toEqual('CA');
            done();
          });
        });
  });

  it("Should accept DELETEs to /companies", function(done) {
    request.del("http://127.0.0.1:3000/v0/companies/5555",
      function(error, response, body) {
        expect(response.statusCode).toEqual(200);
        var result = JSON.parse(body);
        expect(result.message).toEqual('Company at cik 5555 deleted.');
        done();

        request("http://127.0.0.1:3000/v0/companies/5555",
          function(error, response, body) {
            expect(response.statusCode).toEqual(404);
            var result = JSON.parse(body);
            expect(result.message).toEqual('No company found for CIK 5555');
            done();
          });
        });
  });

});