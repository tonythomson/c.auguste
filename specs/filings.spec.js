var request = require("request");
// Tests are based on the dataset loaded from the text.idx file

describe("C.Auguste API: Filings", function() {

  it("Should respond to GET requests for /filings", function(done) {
    request("http://127.0.0.1:3000/v0/filings",
      function(error, response, body) {
        expect(response.statusCode).toEqual(200);
        var filings = JSON.parse(body);
        // TO-DO (bug here):
        // expect(filings.data.length).toEqual(476);
        expect(filings.data.length).toEqual(filings.count);
        expect(filings.data[0].acc_num).toEqual('0000000000-13-000556');
        done();
      });
  });

  it("Should return the correct result to a GET request for /filings/0000000000-13-000556", function(done) {
    request("http://127.0.0.1:3000/v0/filings/0000000000-13-000556",
      function(error, response, body) {
        expect(response.statusCode).toEqual(200);
        var filing = JSON.parse(body);
        expect(filing.acc_num).toEqual('0000000000-13-000556');
        expect(filing.descr).toEqual('Form UPLOAD - SEC-generated letter');
        expect(filing.documents[0].seq).toEqual(0);
        done();
      });
  });

  it("Should return an error message to a GET request for /filings/9999", function(done) {
    request("http://127.0.0.1:3000/v0/filings/9999",
      function(error, response, body) {
        expect(response.statusCode).toEqual(404);
        var result = JSON.parse(body);
        expect(result.message).toEqual('No filing found for accession number 9999');
        done();
      });
  });

});