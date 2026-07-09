const cds = require("@sap/cds");

const { GET, expect, data } = cds.test();

const requesterOneAuth = {
  auth: {
    username: "0001_requester@scarh.com",
    password: "requester",
  },
};

const requesterTwoAuth = {
  auth: {
    username: "0002_requester@scarh.com",
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

describe("Request Hub instance-level authorization", () => {
  beforeEach(data.reset);

  it("allows requester 0001 to read only own requests", async () => {
    const response = await GET("/requester/Requests", requesterOneAuth);

    expect(response.status).to.equal(200);

    const requestIds = response.data.value.map((request) => request.ID);

    expect(requestIds).to.include("11111111-1111-1111-1111-111111111111");
    expect(requestIds).to.include("33333333-3333-3333-3333-333333333333");
    expect(requestIds).to.not.include("22222222-2222-2222-2222-222222222222");
  });

  it("allows requester 0002 to read only own requests", async () => {
    const response = await GET("/requester/Requests", requesterTwoAuth);

    expect(response.status).to.equal(200);

    const requestIds = response.data.value.map((request) => request.ID);

    expect(requestIds).to.include("22222222-2222-2222-2222-222222222222");
    expect(requestIds).to.not.include("11111111-1111-1111-1111-111111111111");
    expect(requestIds).to.not.include("33333333-3333-3333-3333-333333333333");
  });

  it("allows processor to read only assigned requests", async () => {
    const response = await GET("/processor/Requests", processorAuth);

    expect(response.status).to.equal(200);

    const requestIds = response.data.value.map((request) => request.ID);

    expect(requestIds).to.include("33333333-3333-3333-3333-333333333333");
    expect(requestIds).to.not.include("11111111-1111-1111-1111-111111111111");
    expect(requestIds).to.not.include("22222222-2222-2222-2222-222222222222");
  });

  it("allows admin to read all requests through requester and processor services", async () => {
    const requesterResponse = await GET("/requester/Requests", adminAuth);
    const processorResponse = await GET("/processor/Requests", adminAuth);

    expect(requesterResponse.status).to.equal(200);
    expect(processorResponse.status).to.equal(200);

    expect(requesterResponse.data.value).to.have.lengthOf(3);
    expect(processorResponse.data.value).to.have.lengthOf(3);
  });
});