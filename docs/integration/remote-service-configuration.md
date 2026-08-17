# Day 63 — Remote Service Configuration Evidence

## Goal

Validate the environment-specific configuration of the external SAP S/4HANA Business Partner service and distinguish verified behavior from destination-ready design.

## Current Status

The Request Hub application uses the imported `API_BUSINESS_PARTNER` OData V2 model in both environments, but resolves the service differently:

| Area | Development | Production |
| --- | --- | --- |
| Service kind | `odata-v2` | `odata-v2` |
| Model | `srv/external/API_BUSINESS_PARTNER` | `srv/external/API_BUSINESS_PARTNER` |
| Data source | Local CAP mock and CSV test data | SAP BTP Destination service |
| Destination name | Not used | `S4HANA_BUSINESS_PARTNER` |
| Service path | Not used | `/sap/opu/odata/sap/API_BUSINESS_PARTNER` |
| Request timeout | Not required for the local mock | `5000` ms |

Verified effective production configuration:

```text
{
  impl: '@sap/cds/srv/remote-service.js',
  external: true,
  kind: 'odata-v2',
  model: 'srv/external/API_BUSINESS_PARTNER',
  credentials: {
    destination: 'S4HANA_BUSINESS_PARTNER',
    path: '/sap/opu/odata/sap/API_BUSINESS_PARTNER',
    requestTimeout: 5000
  }
}
```

## SAP BTP Verification

The SAP BTP Destination service instance `sap-cap-ai-request-hub-destination` exists and is bound to `sap-cap-ai-request-hub-srv`.

The named destination `S4HANA_BUSINESS_PARTNER` is not configured in the Trial subaccount. Therefore, the current deployment is destination-ready but is not connected to a real SAP S/4HANA backend.

No placeholder destination is created because there is no authorized S/4HANA endpoint or authentication configuration in the personal Trial landscape.

## Security Boundary

- No backend URL, username, password, client secret, certificate, or token is stored in the repository.
- The repository contains only the logical destination name, OData service path, and timeout.
- Authentication and target-system details must be maintained in SAP BTP Destination service for a real landscape.
- If the target system is on-premise, the final setup may additionally require SAP Cloud Connector and an on-premise destination configuration.

## Runtime Behavior

The Request Hub service maps external-service outcomes to controlled API responses:

| Situation | Request Hub response |
| --- | --- |
| Business Partner found | `200 OK` with normalized partner details |
| Request has no Business Partner ID | `409 Conflict` |
| Business Partner does not exist | `404 Not Found` |
| External response is invalid | `502 Bad Gateway` |
| Remote service is unavailable or cannot be resolved | `503 Service Unavailable` |

Automated tests cover the mock integration and failure mapping. They do not claim successful connectivity to a real SAP S/4HANA system.

## Steps Required in a Real Landscape

1. Create a subaccount destination with the exact name `S4HANA_BUSINESS_PARTNER`.
2. Configure the authorized SAP S/4HANA base URL and the authentication method required by that landscape.
3. Configure proxy, trust, certificates, and Cloud Connector settings when applicable.
4. Run the destination connection check in SAP BTP Cockpit.
5. Execute an authenticated Request Hub call for a known Business Partner.
6. Verify timeout, error mapping, authorization, and operational logs without exposing credentials.

## Evidence-Based Conclusion

The CAP application is correctly prepared to resolve an SAP BTP Destination in production. Local mock behavior, normalization, error mapping, logging, and timeout configuration are verified. Real SAP S/4HANA connectivity remains intentionally unverified because the Trial subaccount has no configured `S4HANA_BUSINESS_PARTNER` destination and no authorized backend.

## Official References

- SAP CAP — Consuming Services: https://cap.cloud.sap/docs/guides/services/consuming-services
- SAP CAP — Deploy to Cloud Foundry: https://cap.cloud.sap/docs/guides/deploy/to-cf
- SAP CAP — Outbound Authentication: https://cap.cloud.sap/docs/guides/security/remote-authentication
