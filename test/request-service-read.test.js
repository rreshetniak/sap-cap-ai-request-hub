const cds = require("@sap/cds");

const { GET, expect } = cds.test();

describe("RequestService read API", () => {

  it("reads an existing request from test data", async () => {
    const requestId = "11111111-1111-1111-1111-111111111111";
    const response = await GET(`/odata/v4/request/Requests(${requestId})`);

    expect(response.data.ID).to.equal(requestId);
    expect(response.data.title).to.equal("Invoice amount clarification");
    expect(response.data.status_code).to.equal("DRAFT");
    expect(response.status).to.equal(200);
  });

  it("returns 404 for a request that does not exist", async () => {

    const missingRequestId = "99999999-9999-9999-9999-999999999999";
    let missingRequestError;

    try{
      await GET(
        `/odata/v4/request/Requests(${missingRequestId})`,
      );
    } catch(error) {
      missingRequestError = error;
    }

    expect(missingRequestError.status).to.equal(404);
  });
});
