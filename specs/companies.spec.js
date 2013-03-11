var request = require("request");

describe("C.Auguste API: Companies", function() {

  it("Should respond to get requests for /companies", function(done) {
    request("http://127.0.0.1:3000/v0/companies",
      function(error, response, body) {
        expect(response.statusCode).toEqual(200);
        var companies = JSON.parse(body);
        expect(companies.length).toEqual(3188);
        expect(companies[0].cik).toEqual('1000275');
        done();
      });
  });

  it("Should return the correct result to a get request for /companies/1000275", function(done) {
    request("http://127.0.0.1:3000/v0/companies/1000275",
      function(error, response, body) {
        expect(response.statusCode).toEqual(200);
        var companies = JSON.parse(body);
        expect(companies.length).toEqual(1);
        expect(companies[0].name).toEqual('ROYAL BANK OF CANADA');
        done();
      });
  });

  it("Should return an error message to a get request for /companies/9999", function(done) {
    request("http://127.0.0.1:3000/v0/companies/9999",
      function(error, response, body) {
        expect(response.statusCode).toEqual(404);
        var result = JSON.parse(body);
        expect(result.message).toEqual('No company found for CIK 9999');
        done();
      });
  });

  xit("Should accept posts to /companies", function(done) {
    request({method: "POST",
    uri: "http://127.0.0.1:8080/companies",
    form: {
      username: "Jono",
      message: "Do my bidding!"}
    },
    function(error, response, body) {
      expect(response.statusCode).toEqual(302);
      request("http://127.0.0.1:8080/classes/messages",
        function(error, response, body) {
          var messageLog = JSON.parse(body);
          expect(messageLog[0].username).toEqual("Jono");
          expect(messageLog[0].message).toEqual("Do my bidding!");
          done();
        });
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