const cds = require("@sap/cds");

const { POST, expect, data } = cds.test();

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

describe("RequestService action-level authorization", () => {
  beforeEach(data.reset);

  it("blocks requester from assigning a request", async () => {
    const requestId = "11111111-1111-1111-1111-111111111111";

    const submitUrl =
      `/odata/v4/request/Requests(${requestId})/RequestService.submit`;

    const assignUrl =
      `/odata/v4/request/Requests(${requestId})/RequestService.assign`;

    const submitResponse = await POST(submitUrl, {}, requesterAuth);

    expect(submitResponse.status).to.equal(204);

    let assignError;

    try {
      await POST(
        assignUrl,
        {
          processorId: "processor.demo@example.com",
        },
        requesterAuth,
      );
    } catch (error) {
      assignError = error;
    }

    expect(assignError.status).to.equal(403);
  });

  it("blocks requester from approving a request", async () => {
    const requestId = "33333333-3333-3333-3333-333333333333";

    const approveUrl =
      `/odata/v4/request/Requests(${requestId})/RequestService.approve`;

    let approveError;

    try {
      await POST(
        approveUrl,
        {
          approvalComment: "Requester must not approve this request.",
        },
        requesterAuth,
      );
    } catch (error) {
      approveError = error;
    }

    expect(approveError.status).to.equal(403);
  });

  it("blocks processor from submitting a request", async () => {
    const requestId = "11111111-1111-1111-1111-111111111111";

    const submitUrl =
      `/odata/v4/request/Requests(${requestId})/RequestService.submit`;

    let submitError;

    try {
      await POST(
        submitUrl,
        {},
        processorAuth,
      );
    } catch (error) {
      submitError = error;
    }

    expect(submitError.status).to.equal(403);
  });
});