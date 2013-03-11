var request = require("request");

describe("C.Auguste API: static files", function() {

  it("Should respond to get requests for /", function(done) {
    request("http://127.0.0.1:3000/",
      function(error, response, body) {
				console.log(response);
      	expect(response.statusCode).toEqual(200);
        expect(body).toEqual("hello world");
        done();
      });
  });

});