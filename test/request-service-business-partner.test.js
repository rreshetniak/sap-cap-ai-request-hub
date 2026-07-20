const cds = require("@sap/cds");

const test = cds.test(__dirname + "/..", "--with-mocks");
const { GET, PATCH, expect, data } = test;

let businessPartnerMockMode = "default";

beforeEach(async () => {
  businessPartnerMockMode = "default";
  await data.reset();
});

const adminAuth = {
  auth: {
    username: "0001_admin@scarh.com",
    password: "admin",
  },
};

// beforeAll(async () => {
//   const businessPartnerService = await cds.connect.to("API_BUSINESS_PARTNER");

//   const { A_BusinessPartner } = businessPartnerService.entities;

//   businessPartnerService.prepend(() => {
//     businessPartnerService.on("READ", A_BusinessPartner, async (_req, next) => {
//       if (businessPartnerMockMode === "invalid-response") {
//         return {
//           BusinessPartner: "1000000001",
//           BusinessPartnerCategory: "2",
//           BusinessPartnerName: " ",
//         };
//       }

//       return next();
//     });
//   });
// });

cds.on("served", () => {
  const businessPartnerService = cds.services["API_BUSINESS_PARTNER"];

  const { A_BusinessPartner } = businessPartnerService.entities;

  businessPartnerService.prepend(() => {
    businessPartnerService.on("READ", A_BusinessPartner, async (_req, next) => {
      if (businessPartnerMockMode === "invalid-response") {
        return {
          BusinessPartner: "1000000001",
          BusinessPartnerCategory: "2",
          BusinessPartnerName: " ",
        };
      }

      if (businessPartnerMockMode === "service-unavailable") {
        throw new Error("Simulated Business Partner service failure.");
      }

      return next();
    });
  });
});

describe("RequestService Business Partner integration", () => {
  it("returns Business Partner details for a linked request", async () => {
    const requestId = "22222222-2222-2222-2222-222222222222";

    const response = await GET(
      `/odata/v4/request/Requests(${requestId})/RequestService.getBusinessPartnerDetails()`,
      adminAuth,
    );
    expect(response.status).to.equal(200);
    expect(response.data.id).to.equal("1000000001");
    expect(response.data.category).to.equal("2");
    expect(response.data.displayName).to.equal("Northwind Supplies GmbH");
  });

  it("returns 409 when the request has no Business Partner identifier", async () => {
    const requestId = "11111111-1111-1111-1111-111111111111";
    let requestError;

    try {
      await GET(
        `/odata/v4/request/Requests(${requestId})/RequestService.getBusinessPartnerDetails()`,
        adminAuth,
      );
    } catch (error) {
      requestError = error;
    }

    expect(requestError).to.not.equal(undefined);
    expect(requestError.status).to.equal(409);
    expect(requestError.code).to.equal("BUSINESS_PARTNER_ID_REQUIRED");
    expect(requestError.response.data.error.target).to.equal(
      "businessPartnerId",
    );
  });

  it("returns 404 when the Business Partner does not exist", async () => {
    const requestId = "33333333-3333-3333-3333-333333333333";

    await PATCH(
      `/odata/v4/request/Requests(${requestId})`,
      {
        businessPartnerId: "9999999999",
      },
      adminAuth,
    );

    const updatedRequestResponse = await GET(
      `/odata/v4/request/Requests(${requestId})`,
      adminAuth,
    );

    expect(updatedRequestResponse.data.businessPartnerId).to.equal(
      "9999999999",
    );

    //expect(updateResponse.status).to.equal(204);

    let requestError;

    try {
      await GET(
        `/odata/v4/request/Requests(${requestId})/RequestService.getBusinessPartnerDetails()`,
        adminAuth,
      );
    } catch (error) {
      requestError = error;
    }

    expect(requestError).to.not.equal(undefined);
    expect(requestError.status).to.equal(404);
    expect(requestError.code).to.equal("BUSINESS_PARTNER_NOT_FOUND");
  });

  it("returns 502 when the Business Partner response is invalid", async () => {
    const requestId = "22222222-2222-2222-2222-222222222222";
    businessPartnerMockMode = "invalid-response";

    let requestError;

    try {
      await GET(
        `/odata/v4/request/Requests(${requestId})/RequestService.getBusinessPartnerDetails()`,
        adminAuth,
      );
    } catch (error) {
      requestError = error;
    }

    expect(requestError).to.not.equal(undefined);
    expect(requestError.status).to.equal(502);
    expect(requestError.code).to.equal("BUSINESS_PARTNER_RESPONSE_INVALID");
  });

  it("returns 503 when the Business Partner service is unavailable", async () => {
    const requestId = "22222222-2222-2222-2222-222222222222";
    businessPartnerMockMode = "service-unavailable";

    let requestError;

    try {
      await GET(
        `/odata/v4/request/Requests(${requestId})/RequestService.getBusinessPartnerDetails()`,
        adminAuth,
      );
    } catch (error) {
      requestError = error;
    }

    expect(requestError).to.not.equal(undefined);
    expect(requestError.status).to.equal(503);
    expect(requestError.code).to.equal("BUSINESS_PARTNER_SERVICE_UNAVAILABLE");
  });
});
