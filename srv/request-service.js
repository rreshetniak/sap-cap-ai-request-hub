const cds = require("@sap/cds");
const LOG = cds.log("request-service");
const { SELECT, UPDATE, INSERT } = cds.ql;
const {
  getAiSummaryProvider,
} = require("./ai/ai-summary-provider");

module.exports = (srv) => {
  const { Requests } = srv.entities;
  const { RequestHistory, ApprovalSteps } = cds.entities(
    "com.portfolio.requesthub",
  );

  const transitionSnapshots = new WeakMap();

  // Shared helper: read the current request

  const readCurrentRequest = async (req) => {
    const currentRequest = await SELECT.one.from(req.subject);

    if (!currentRequest) {
      req.reject({
        status: 404,
        code: "REQUEST_NOT_FOUND",
        message: "Request was not found.",
      });
    }

    return currentRequest;
  };

  // Shared helper: create a RequestHistory entry

  const createHistoryEntry = async (
    beforeActionRequest,
    afterActionRequest,
    detailsRequest,
  ) => {
    const {
      eventType,
      comment = null,
      assignedProcessorId = null,
    } = detailsRequest;

    await INSERT.into(RequestHistory).entries({
      request_ID: afterActionRequest.ID,
      eventType,
      previousStatus_code: beforeActionRequest.status_code,
      newStatus_code: afterActionRequest.status_code,
      assignedProcessorId,
      comment,
    });
  };

  // Generate an AI summary suggestion without saving it

  srv.on("generateAiSummary", Requests, async (req) => {
    const currentRequest = await readCurrentRequest(req);

    const title = currentRequest.title?.trim();
    const description = currentRequest.description?.trim();

    if (!title || !description) {
      return req.reject({
        status: 409,
        code: "AI_SUMMARY_INPUT_INCOMPLETE",
        message:
          "A title and description are required to generate an AI summary.",
      });
    }

    let suggestion;

    try {
      const aiSummaryProvider = getAiSummaryProvider();

      suggestion = await aiSummaryProvider.generateSummary({
        title,
        description,
        requestType: currentRequest.requestType_code,
        priority: currentRequest.priority_code,
      });
    } catch (error) {
      if (
        error.code === "AI_SUMMARY_PROVIDER_NOT_CONFIGURED" ||
        error.code === "GEMINI_API_KEY_MISSING"
      ) {
        return req.reject({
          status: 503,
          code: "AI_SUMMARY_PROVIDER_UNAVAILABLE",
          message: "The AI summary provider is not configured.",
        });
      }

      LOG.error("AI summary generation failed", {
        name: error.name,
        code: error.code,
        message: error.message,
      });

      return req.reject({
        status: 502,
        code: "AI_SUMMARY_GENERATION_FAILED",
        message: "The AI summary could not be generated.",
      });
    }

    const summary = suggestion?.summary?.trim();

    if (!summary || summary.length > 1000) {
      return req.reject({
        status: 502,
        code: "AI_SUMMARY_RESPONSE_INVALID",
        message: "The AI summary provider returned an invalid response.",
      });
    }

    return {
      summary,
      provider: suggestion.provider,
      generatedAt: req.timestamp,
    };
  });

  // Save an AI summary only after explicit user confirmation

  srv.on("acceptAiSummary", Requests, async (req) => {
    const currentRequest = await readCurrentRequest(req);
    const summary = req.data.summary?.trim();

    if (!summary) {
      return req.reject({
        status: 400,
        code: "AI_SUMMARY_REQUIRED",
        message: "An AI summary is required.",
        target: "summary",
      });
    }

    if (summary.length > 1000) {
      return req.reject({
        status: 400,
        code: "AI_SUMMARY_TOO_LONG",
        message: "The AI summary must not exceed 1000 characters.",
        target: "summary",
      });
    }

    if (
      !["DRAFT", "CLARIFICATION_REQUIRED"].includes(
        currentRequest.status_code,
      )
    ) {
      return req.reject({
        status: 409,
        code: "AI_SUMMARY_NOT_EDITABLE",
        message:
          "An AI summary can be accepted only for a draft or clarification request.",
      });
    }

    await UPDATE(req.subject).with({
      aiSummary: summary,
    });

    const updatedRequest = await readCurrentRequest(req);

    await createHistoryEntry(currentRequest, updatedRequest, {
      eventType: "AI_SUMMARY_ACCEPTED",
      comment: "AI summary accepted by the user.",
    });

    return updatedRequest;
  });

  /** Request before Submit **/

  srv.before("submit", Requests, async (req) => {
    const currentRequest = await readCurrentRequest(req);

    if (!currentRequest.title?.trim()) {
      req.error({
        status: 400,
        code: "TITLE_REQUIRED_FOR_SUBMISSION",
        message: "A title is required before submission.",
        target: "title",
      });
    }

    if (!currentRequest.description?.trim()) {
      req.error({
        status: 400,
        code: "DESCRIPTION_REQUIRED_FOR_SUBMISSION",
        message: "A description is required before submission.",
        target: "description",
      });
    }

    if (!currentRequest.requestType_code?.trim()) {
      req.error({
        status: 400,
        code: "REQUEST_TYPE_REQUIRED_FOR_SUBMISSION",
        message: "A request type is required before submission.",
        target: "requestType_code",
      });
    }

    if (!currentRequest.priority_code?.trim()) {
      req.error({
        status: 400,
        code: "PRIORITY_REQUIRED_FOR_SUBMISSION",
        message: "A priority is required before submission.",
        target: "priority_code",
      });
    }

    const beforeActionRequest = {
      ID: currentRequest.ID,
      status_code: currentRequest.status_code,
    };

    transitionSnapshots.set(req, beforeActionRequest);
  });

  /** Request after Submit **/

  srv.after("submit", Requests, async (_result, req) => {
    const beforeActionRequest = transitionSnapshots.get(req);

    try {
      const afterActionRequest = await readCurrentRequest(req);

      await createHistoryEntry(beforeActionRequest, afterActionRequest, {
        eventType: "SUBMITTED",
      });
    } finally {
      transitionSnapshots.delete(req);
    }
  });

  /** Request before Assign **/

  srv.before("assign", Requests, async (req) => {
    const processorId = req.data.processorId?.trim();

    if (!processorId) {
      req.reject({
        status: 400,
        code: "PROCESSOR_ID_REQUIRED",
        message: "A processor ID is required for assignment.",
        target: "processorId",
      });
    }

    req.data.processorId = processorId;

    const currentRequest = await readCurrentRequest(req);

    const beforeActionRequest = {
      ID: currentRequest.ID,
      status_code: currentRequest.status_code,
    };

    transitionSnapshots.set(req, beforeActionRequest);
  });

  /** Request after Assign **/

  srv.after("assign", Requests, async (_result, req) => {
    const beforeActionRequest = transitionSnapshots.get(req);

    try {
      await UPDATE(req.subject).with({
        assignedProcessorId: req.data.processorId,
      });

      const afterActionRequest = await readCurrentRequest(req);

      await createHistoryEntry(beforeActionRequest, afterActionRequest, {
        eventType: "PROCESSING_STARTED",
        assignedProcessorId: req.data.processorId,
      });

      const pendingApprovalSteps = await SELECT.from(
        ApprovalSteps,
      ).where({
        request_ID: beforeActionRequest.ID,
        decision: "PENDING",
      });

      if (pendingApprovalSteps.length === 0) {
        const lastApprovalStep = await SELECT.from(ApprovalSteps)
          .columns("stepNo")
          .where({
            request_ID: beforeActionRequest.ID,
          })
          .orderBy("stepNo desc")
          .limit(1);

        const nextStepNo =
          (lastApprovalStep[0]?.stepNo ?? 0) + 1;

        await INSERT.into(ApprovalSteps).entries({
          request_ID: beforeActionRequest.ID,
          stepNo: nextStepNo,
          approverId: req.data.processorId,
          decision: "PENDING",
        });
      }
    } finally {
      transitionSnapshots.delete(req);
    }
  });

  /** Request before Approve **/

  srv.before("approve", Requests, async (req) => {
    const currentRequest = await readCurrentRequest(req);

    const pendingApprovalSteps = await SELECT.from(
      ApprovalSteps,
    ).where({
      request_ID: currentRequest.ID,
      decision: "PENDING",
    });

    if (pendingApprovalSteps.length !== 1) {
      req.reject({
        status: 409,
        code: "FINAL_APPROVAL_STEP_REQUIRED",
        message:
          "The request can be approved only when exactly one pending approval step remains.",
      });
    }

    const beforeActionRequest = {
      ID: currentRequest.ID,
      status_code: currentRequest.status_code,
    };

    const pendingApprovalStep = pendingApprovalSteps[0];

    transitionSnapshots.set(req, {
      beforeActionRequest,
      pendingApprovalStep,
    });
  });

  /** Request after Approve **/

  srv.after("approve", Requests, async (_result, req) => {
    const approvalSnapshot = transitionSnapshots.get(req);

    try {
      const approvalComment =
        req.data.approvalComment?.trim() || null;

      await UPDATE(ApprovalSteps)
        .where({
          ID: approvalSnapshot.pendingApprovalStep.ID,
        })
        .with({
          decision: "APPROVED",
          decisionComment: approvalComment,
          decidedAt: req.timestamp,
        });

      const afterActionRequest = await readCurrentRequest(req);

      await createHistoryEntry(
        approvalSnapshot.beforeActionRequest,
        afterActionRequest,
        {
          eventType: "APPROVED",
          comment: approvalComment,
        },
      );
    } finally {
      transitionSnapshots.delete(req);
    }
  });

  /** Request before Reject **/

  srv.before("rejectRequest", Requests, async (req) => {
    const rejectionReason = req.data.rejectionReason?.trim();

    if (!rejectionReason) {
      req.reject({
        status: 400,
        code: "REJECTION_REASON_REQUIRED",
        message: "A rejection reason is required.",
        target: "rejectionReason",
      });
    }

    req.data.rejectionReason = rejectionReason;

    const currentRequest = await readCurrentRequest(req);

    const beforeActionRequest = {
      ID: currentRequest.ID,
      status_code: currentRequest.status_code,
    };

    transitionSnapshots.set(req, beforeActionRequest);
  });

  /** Request after Reject **/

  srv.after("rejectRequest", Requests, async (_result, req) => {
    const beforeActionRequest = transitionSnapshots.get(req);

    try {
      const afterActionRequest = await readCurrentRequest(req);

      await createHistoryEntry(beforeActionRequest, afterActionRequest, {
        eventType: "REJECTED",
        comment: req.data.rejectionReason,
      });
    } finally {
      transitionSnapshots.delete(req);
    }
  });

  /** Request before Clarification **/

  srv.before("requestClarification", Requests, async (req) => {
    const clarificationComment =
      req.data.clarificationComment?.trim();

    if (!clarificationComment) {
      req.reject({
        status: 400,
        code: "CLARIFICATION_COMMENT_REQUIRED",
        message: "A clarification comment is required.",
        target: "clarificationComment",
      });
    }

    req.data.clarificationComment = clarificationComment;

    const currentRequest = await readCurrentRequest(req);

    const beforeActionRequest = {
      ID: currentRequest.ID,
      status_code: currentRequest.status_code,
    };

    transitionSnapshots.set(req, beforeActionRequest);
  });

  /** Request after Clarification **/

  srv.after(
    "requestClarification",
    Requests,
    async (_result, req) => {
      const beforeActionRequest = transitionSnapshots.get(req);

      try {
        const afterActionRequest =
          await readCurrentRequest(req);

        await createHistoryEntry(
          beforeActionRequest,
          afterActionRequest,
          {
            eventType: "CLARIFICATION_REQUESTED",
            comment: req.data.clarificationComment,
          },
        );
      } finally {
        transitionSnapshots.delete(req);
      }
    },
  );

  // Function getBusinessPartnerDetails

  srv.on("getBusinessPartnerDetails", Requests, async (req) => {
    const currentRequest = await readCurrentRequest(req);
    const businessPartnerId =
      currentRequest.businessPartnerId?.trim();

    if (!businessPartnerId) {
      return req.reject({
        status: 409,
        code: "BUSINESS_PARTNER_ID_REQUIRED",
        message:
          "The request does not contain a Business Partner identifier.",
        target: "businessPartnerId",
      });
    }

    let businessPartner;

    try {
      const businessPartnerService =
        await cds.connect.to("API_BUSINESS_PARTNER");

      const { A_BusinessPartner } =
        businessPartnerService.entities;

      businessPartner = await businessPartnerService.run(
        SELECT.one
          .from(A_BusinessPartner)
          .columns(
            "BusinessPartner",
            "BusinessPartnerCategory",
            "BusinessPartnerName",
          )
          .where({
            BusinessPartner: businessPartnerId,
          }),
      );
    } catch (error) {
      LOG.warn("Business Partner service call failed.", {
        requestId: currentRequest.ID,
        businessPartnerId,
        reason: error.message,
      });

      return req.reject({
        status: 503,
        code: "BUSINESS_PARTNER_SERVICE_UNAVAILABLE",
        message:
          "The Business Partner service is currently unavailable.",
      });
    }

    if (!businessPartner) {
      return req.reject({
        status: 404,
        code: "BUSINESS_PARTNER_NOT_FOUND",
        message:
          `Business Partner ${businessPartnerId} was not found.`,
      });
    }

    const hasValidBusinessPartnerResponse =
      typeof businessPartner.BusinessPartner === "string" &&
      businessPartner.BusinessPartner === businessPartnerId &&
      typeof businessPartner.BusinessPartnerName === "string" &&
      businessPartner.BusinessPartnerName.trim().length > 0;

    if (!hasValidBusinessPartnerResponse) {
      return req.reject({
        status: 502,
        code: "BUSINESS_PARTNER_RESPONSE_INVALID",
        message:
          "The Business Partner service returned an invalid response.",
      });
    }

    return {
      id: businessPartner.BusinessPartner,
      category: businessPartner.BusinessPartnerCategory,
      displayName: businessPartner.BusinessPartnerName,
    };
  });
};