const cds = require("@sap/cds");

const { GET, expect, data } = cds.test();

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

describe("Request Hub service-level authorization", () => {
  beforeEach(data.reset);

  it("blocks anonymous access to ProcessorService", async () => {
    let anonymousError;

    try {
      await GET("/processor/Requests");
    } catch (error) {
      anonymousError = error;
    }

    expect(anonymousError.status).to.equal(401);
  });

  it("allows requester access to RequesterService", async () => {
    const response = await GET("/requester/Requests", requesterAuth);

    expect(response.status).to.equal(200);
    expect(response.data.value).to.be.an("array");
  });

  it("allows processor access to ProcessorService", async () => {
    const response = await GET("/processor/Requests", processorAuth);

    expect(response.status).to.equal(200);
    expect(response.data.value).to.be.an("array");
  });

  it("allows admin access to requester and processor services", async () => {
    const requesterResponse = await GET("/requester/Requests", adminAuth);
    const processorResponse = await GET("/processor/Requests", adminAuth);

    expect(requesterResponse.status).to.equal(200);
    expect(processorResponse.status).to.equal(200);
  });
});