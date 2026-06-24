module.exports = (srv) => {
  srv.before("CREATE", "Requests", (req) => {
    if (req.data.status_code !== "DRAFT") {
      req.reject(
        400,
        'Only requests with status "DRAFT" can be created',
        "status_code",
      );
    }
  });

  srv.before("UPDATE", "Requests", async (req) => {
    if (req.data.status_code === undefined) {
      return; // No status_code update, so no need to check
    }

    const currentRequest = await SELECT.one
    .from(req.subject);

    if (
      currentRequest.status_code === "APPROVED" &&
      req.data.status_code === "DRAFT"
    ) {
      req.reject(
        400,
        "An approved request cannot be moved back to DRAFT.",
        "status_code",
      );
    }
  });
};
