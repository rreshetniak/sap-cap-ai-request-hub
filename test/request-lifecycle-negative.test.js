const cds = require("@sap/cds");

const { GET, POST, expect, data } = cds.test();

describe("RequestService negative lifecycle API", () => {
  beforeEach(data.reset);

  it("rejects a repeated submit without changing the request history", async () => {
    const requestId = "11111111-1111-1111-1111-111111111111";

    const submitUrl =
      `/odata/v4/request/Requests(${requestId})/RequestService.submit`;

    const processorRequestUrl =
      `/processor/Requests(${requestId})?$expand=history`;

    const firstSubmitResponse = await POST(submitUrl, {});

    expect(firstSubmitResponse.status).to.equal(204);

    let repeatedSubmitError;

    try {
      await POST(submitUrl, {});
    } catch (error) {
      repeatedSubmitError = error;
    }

    expect(repeatedSubmitError.status).to.equal(409);

    const afterResponse = await GET(processorRequestUrl);

    expect(afterResponse.status).to.equal(200);
    expect(afterResponse.data.status_code).to.equal("SUBMITTED");
    expect(afterResponse.data.history).to.have.lengthOf(1);

    const [historyEntry] = afterResponse.data.history;

    expect(historyEntry.eventType).to.equal("SUBMITTED");
    expect(historyEntry.previousStatus_code).to.equal("DRAFT");
    expect(historyEntry.newStatus_code).to.equal("SUBMITTED");
  });

  it("rejects an empty rejection reason without changing an in-process request", async () => {
    const requestId = "11111111-1111-1111-1111-111111111111";

    const submitUrl =
      `/odata/v4/request/Requests(${requestId})/RequestService.submit`;

    const assignUrl =
      `/odata/v4/request/Requests(${requestId})/RequestService.assign`;

    const rejectUrl =
      `/odata/v4/request/Requests(${requestId})/RequestService.rejectRequest`;

    const processorRequestUrl =
      `/processor/Requests(${requestId})?$expand=history`;

    const submitResponse = await POST(submitUrl, {});

    expect(submitResponse.status).to.equal(204);

    const assignResponse = await POST(assignUrl, {
      processorId: "processor.demo@example.com",
    });

    expect(assignResponse.status).to.equal(204);

    let rejectionError;

    try {
      await POST(rejectUrl, {
        rejectionReason: "   ",
      });
    } catch (error) {
      rejectionError = error;
    }

    expect(rejectionError.status).to.equal(400);
    expect(rejectionError.code).to.equal("ASSERT_MANDATORY");

    const afterResponse = await GET(processorRequestUrl);

    expect(afterResponse.status).to.equal(200);
    expect(afterResponse.data.status_code).to.equal("IN_PROCESS");
    expect(afterResponse.data.assignedProcessorId).to.equal(
      "processor.demo@example.com",
    );
    expect(afterResponse.data.history).to.have.lengthOf(2);

    expect(afterResponse.data.history[0].eventType).to.equal("SUBMITTED");
    expect(afterResponse.data.history[1].eventType).to.equal(
      "PROCESSING_STARTED",
    );
  });
});