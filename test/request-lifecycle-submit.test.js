const cds = require ("@sap/cds");
const { GET, POST, expect, data } = cds.test();
const requesterAuth = {
  auth: {
    username: "0001_requester@scarh.com",
    password: "requester",
  },
};
const processorAuth = {
  auth: {
    username: "0001_processor@scarh.com",
    password: "processor",
  },
};

const adminAuth = {
  auth: {
    username: "0001_admin@scarh.com",
    password: "admin",
  },
};

const { before } = require("@sap/cds/lib/srv/middlewares");

describe ("RequestService submit lifecycle API", () => {
  beforeEach (data.reset);
  
  it("submits a draft request and creates a history entry", async () => {
    const requestId = "11111111-1111-1111-1111-111111111111";
    // const processorRequestUrl = `/processor/Requests(${requestId})?$expand=history`;
    const adminRequestUrl = `/odata/v4/request/Requests(${requestId})?$expand=history`;

    // const beforeResponse = await GET(processorRequestUrl, processorAuth);
    const beforeResponse = await GET(adminRequestUrl, adminAuth);

    expect(beforeResponse.status).to.equal(200);
    expect(beforeResponse.data.status_code).to.equal("DRAFT");
    expect(beforeResponse.data.history).to.have.lengthOf(0);

    const submitResponse = await POST
    (
      `/odata/v4/request/Requests(${requestId})/RequestService.submit`,
      {},
      requesterAuth,
    );

    expect(submitResponse.status).to.equal(204);

    // const afterResponse = await GET(processorRequestUrl, processorAuth);
    const afterResponse = await GET(adminRequestUrl, adminAuth);
    expect(afterResponse.status).to.equal(200);
    expect(afterResponse.data.status_code).to.equal("SUBMITTED");
    expect(afterResponse.data.history).to.have.lengthOf(1);
  })
})