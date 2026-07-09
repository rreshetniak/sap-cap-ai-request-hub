const cds = require("@sap/cds");

const { GET, POST, expect, data } = cds.test();
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
  }
}

describe("RequestService approve lifecycle API", () => {
  beforeEach(data.reset);

  it("approves the final pending step and creates an approval history entry", async () => {
    const requestId = "33333333-3333-3333-3333-333333333333";
    const approvalComment = "Security approval completed.";

    const approveUrl = `/odata/v4/request/Requests(${requestId})/RequestService.approve`;

    // const processorRequestUrl = `/processor/Requests(${requestId})?$expand=approvalSteps,history`;
    const adminRequestUrl = `/odata/v4/request/Requests(${requestId})?$expand=approvalSteps,history`;

    const beforeResponse = await GET(adminRequestUrl, adminAuth);
    // const beforeResponse = await GET(processorRequestUrl, processorAuth);

    expect(beforeResponse.status).to.equal(200);
    expect(beforeResponse.data.status_code).to.equal("IN_PROCESS");
    expect(beforeResponse.data.history).to.have.lengthOf(1);

    const pendingApprovalStep = beforeResponse.data.approvalSteps.find(
      (step) => step.decision === "PENDING",
    );

    expect(pendingApprovalStep).to.exist;
    expect(pendingApprovalStep.stepNo).to.equal(2);

    const approveResponse = await POST(
      approveUrl,
      {
        approvalComment,
      },
      processorAuth,
    );

    expect(approveResponse.status).to.equal(204);

    const afterResponse = await GET(adminRequestUrl, adminAuth);
    // const afterResponse = await GET(processorRequestUrl, processorAuth);

    expect(afterResponse.status).to.equal(200);
    expect(afterResponse.data.status_code).to.equal("APPROVED");
    expect(afterResponse.data.history).to.have.lengthOf(2);

    const approvedStep = afterResponse.data.approvalSteps.find(
      (step) => step.ID === pendingApprovalStep.ID,
    );

    expect(approvedStep.decision).to.equal("APPROVED");
    expect(approvedStep.decisionComment).to.equal(approvalComment);
    expect(approvedStep.decidedAt).to.not.equal(null);

    const approvalHistoryEntry = afterResponse.data.history.find(
      (entry) => entry.eventType === "APPROVED",
    );

    expect(approvalHistoryEntry.request_ID).to.equal(requestId);
    expect(approvalHistoryEntry.previousStatus_code).to.equal("IN_PROCESS");
    expect(approvalHistoryEntry.newStatus_code).to.equal("APPROVED");
    expect(approvalHistoryEntry.comment).to.equal(approvalComment);
  });
});
