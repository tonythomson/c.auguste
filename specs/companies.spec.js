var request = require("request");

describe("C.Auguste API: Companies", function() {

  it("Should respond to get requests for /companies", function(done) {
    request("http://127.0.0.1:8080/companies",
      function(error, response, body) {
        expect(body).toEqual("[]");
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