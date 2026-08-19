const cds = require("@sap/cds");

const test = cds.test(__dirname + "/..", "--with-mocks");
const { GET, POST, expect, data } = test;

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

describe("RequestService AI summary suggestion", () => {
  beforeEach(data.reset);

  it("generates a summary suggestion for the request owner", async () => {
    const requestId = "11111111-1111-1111-1111-111111111111";

    const actionUrl =
      `/odata/v4/request/Requests(${requestId})/` +
      "RequestService.generateAiSummary";

    const response = await POST(actionUrl, {}, requesterOneAuth);

    expect(response.status).to.equal(200);
    expect(response.data.provider).to.equal("mock");
    expect(response.data.summary).to.include(
      "Invoice amount clarification",
    );
    expect(response.data.generatedAt).to.be.a("string");

    const requestResponse = await GET(
      `/odata/v4/request/Requests(${requestId})`,
      requesterOneAuth,
    );

    expect(requestResponse.data.aiSummary).to.equal(null);
  });

  it("blocks generation for another requester's request", async () => {
    const requestId = "22222222-2222-2222-2222-222222222222";

    const actionUrl =
      `/odata/v4/request/Requests(${requestId})/` +
      "RequestService.generateAiSummary";

    let requestError;

    try {
      await POST(actionUrl, {}, requesterOneAuth);
    } catch (error) {
      requestError = error;
    }

    expect(requestError).to.not.equal(undefined);
    expect([403, 404]).to.include(requestError.status);
  });

  it("saves an accepted summary and creates an audit entry", async () => {
    const requestId = "11111111-1111-1111-1111-111111111111";
    const acceptedSummary =
      "The supplier invoice amount requires clarification.";

    const actionUrl =
      `/odata/v4/request/Requests(${requestId})/` +
      "RequestService.acceptAiSummary";

    const response = await POST(
      actionUrl,
      {
        summary: acceptedSummary,
      },
      requesterOneAuth,
    );

    expect(response.status).to.equal(200);
    expect(response.data.aiSummary).to.equal(acceptedSummary);

    const requestResponse = await GET(
      `/odata/v4/request/Requests(${requestId})?$expand=history`,
      requesterOneAuth,
    );

    expect(requestResponse.data.aiSummary).to.equal(acceptedSummary);

    const aiHistoryEntries = requestResponse.data.history.filter(
      (entry) => entry.eventType === "AI_SUMMARY_ACCEPTED",
    );

    expect(aiHistoryEntries).to.have.lengthOf(1);
    expect(aiHistoryEntries[0].comment).to.equal(
      "AI summary accepted by the user.",
    );
  });

  it("rejects summary acceptance for a submitted request", async () => {
    const requestId = "22222222-2222-2222-2222-222222222222";

    const actionUrl =
      `/odata/v4/request/Requests(${requestId})/` +
      "RequestService.acceptAiSummary";

    let requestError;

    try {
      await POST(
        actionUrl,
        {
          summary: "This summary must not be saved.",
        },
        requesterTwoAuth,
      );
    } catch (error) {
      requestError = error;
    }

    expect(requestError).to.not.equal(undefined);
    expect(requestError.status).to.equal(409);
    expect(requestError.code).to.equal("AI_SUMMARY_NOT_EDITABLE");

    const requestResponse = await GET(
      `/odata/v4/request/Requests(${requestId})`,
      requesterTwoAuth,
    );

    expect(requestResponse.data.aiSummary).to.equal(null);
  });
});