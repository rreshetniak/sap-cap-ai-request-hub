const cds = require("@sap/cds");

const { GET, expect } = cds.test();
const adminAuth = {
  auth: {
    username: "0001_admin@scarh.com",
    password: "admin",
  },
};

describe("RequestService read API", () => {

  it("reads an existing request from test data", async () => {
    const requestId = "11111111-1111-1111-1111-111111111111";
    const response = await GET(
      `/odata/v4/request/Requests(${requestId})`, 
      adminAuth
    );

    expect(response.data.ID).to.equal(requestId);
    expect(response.data.title).to.equal("Invoice amount clarification");
    expect(response.data.status_code).to.equal("DRAFT");
    expect(response.status).to.equal(200);
  });

  it("expands the request status details", async () => {
    const requestId = "22222222-2222-2222-2222-222222222222";

    const response = await GET(
      `/odata/v4/request/Requests(${requestId})` +
        "?$select=ID,title,status_code&$expand=status($select=code,name)",
      adminAuth,
    );

    expect(response.status).to.equal(200);
    expect(response.data.status_code).to.equal("SUBMITTED");
    expect(response.data.status).to.deep.equal({
      code: "SUBMITTED",
      name: "Submitted",
    });
  });

  it("returns 404 for a request that does not exist", async () => {

    const missingRequestId = "99999999-9999-9999-9999-999999999999";
    let missingRequestError;

    try{
      await GET(
        `/odata/v4/request/Requests(${missingRequestId})`, 
        adminAuth
      );
    } catch(error) {
      missingRequestError = error;
    }

    expect(missingRequestError.status).to.equal(404);
  });
});
