const UPDATE = require("@sap/cds/lib/ql/UPDATE");

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
      return;
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

  srv.on("submit", "Requests", async(req) => {
    
    const currentRequest = await SELECT.one.from(req.subject);

    if (!currentRequest) {
      req.reject(404, 'Request was not found');
    }

    if (currentRequest.status_code !== 'DRAFT') {
      req.reject(400, 'Only requests with status "DRAFT" can be submitted.')
    }

    await UPDATE(req.subject).with({status_code: "SUBMITTED"});

    return SELECT.one.from(req.subject);

  })
};
