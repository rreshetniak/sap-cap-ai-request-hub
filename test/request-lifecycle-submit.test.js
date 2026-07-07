const cds = require ("@sap/cds");
const { GET, POST, expect, data } = cds.test();
const { before } = require("@sap/cds/lib/srv/middlewares");

describe ("RequestService submit lifecycle API", () => {
  beforeEach (data.reset);
  
  it("submits a draft request and creates a history entry", async () => {
    const requestId = "11111111-1111-1111-1111-111111111111";
    const processorRequestUrl = `/processor/Requests(${requestId})?$expand=history`;

    const beforeResponse = await GET(processorRequestUrl);

    expect(beforeResponse.status).to.equal(200);
    expect(beforeResponse.data.status_code).to.equal("DRAFT");
    expect(beforeResponse.data.history).to.have.lengthOf(0);

    const submitResponse = await POST
    (
      `/odata/v4/request/Requests(${requestId})/RequestService.submit`,
      {},
    );

    expect(submitResponse.status).to.equal(204);

    const afterResponse = await GET(processorRequestUrl);
    expect(afterResponse.status).to.equal(200);
    expect(afterResponse.data.status_code).to.equal("SUBMITTED");
    expect(afterResponse.data.history).to.have.lengthOf(1);
  })
})