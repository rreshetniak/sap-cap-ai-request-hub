# Day 65 — Request Hub Deployment Evidence

## Purpose

Record what is actually deployed and verified, what is only prepared, what remains intentionally unavailable in the personal Trial landscape, and how the result can be reproduced.

## Verified Release

| Item | Verified value |
| --- | --- |
| Release | Request Hub Portfolio MVP `v1.0.0` |
| MTA ID | `sap-cap-ai-request-hub` |
| MTA version | `1.0.0` |
| Environment | SAP BTP Trial, Cloud Foundry |
| Org / space | `d93fd169trial` / `dev` |
| CAP application | `sap-cap-ai-request-hub-srv` |
| Runtime state | `STARTED`, `1/1` instance running |
| Stack | `cflinuxfs4` |
| Buildpack | `nodejs_buildpack` |
| Deployment time | 17 August 2026, approximately 21:21 UTC |
| Automated tests | `26/26` passed |

Application route:

```text
https://d93fd169trial-dev-sap-cap-ai-request-hub-srv.cfapps.us10-001.hana.ondemand.com
```

## Deployed Components

### Applications

- `sap-cap-ai-request-hub-srv`: continuously running CAP Node.js service.
- `sap-cap-ai-request-hub-db-deployer`: one-time HDI deployment module; stopped after successful execution as expected.

### Services

- `request-hub-auth`: XSUAA, `application` plan, bound to the CAP service.
- `request-hub-hana`: SAP HANA Cloud, `hana-free` plan.
- `sap-cap-ai-request-hub-db`: HDI container, `hdi-shared` plan, bound to the CAP service and database deployer.
- `sap-cap-ai-request-hub-destination`: Destination service, `lite` plan, bound to the CAP service.

## Verified Delivery Flow

The GitHub Actions pipeline executes:

1. checkout of the selected `main` revision;
2. Node.js setup;
3. deterministic dependency installation with `npm ci`;
4. automated tests;
5. MTA archive build;
6. artifact verification and upload;
7. short-lived GitHub OIDC authentication for a manual deployment run;
8. Cloud Foundry target verification;
9. MTA deployment;
10. unauthenticated API smoke check;
11. Cloud Foundry logout.

Deployment is intentionally manual through `workflow_dispatch`; a normal push performs CI checks and package creation without changing the Trial environment.

## Verified Operational Evidence

- GitHub Actions completed all three jobs successfully: test, package, and deploy.
- `cf mta sap-cap-ai-request-hub` reported version `1.0.0`.
- `cf app sap-cap-ai-request-hub-srv` reported `1/1` running instance.
- Cloud Foundry events showed build, staging, start, and `process.ready` without a crash loop.
- The protected Request endpoint returned `401 Unauthorized` without a token.
- Application and router logs recorded the same request with correlation metadata.
- The technical `Postman-Token` header was masked as `***` after the Day 64 logging hardening change.
- Production authentication resolves to `xsuaa`; development authentication resolves to explicitly configured mock users.
- Unknown development mock users are rejected; the regression test is part of the `26/26` suite.

## Business Partner Integration Status

Verified:

- imported OData V2 model;
- local mock service and deterministic CSV data;
- Business Partner response normalization;
- `404`, `409`, `502`, and `503` error mapping;
- five-second production request timeout;
- backend diagnostic logging;
- logical production destination name `S4HANA_BUSINESS_PARTNER`.

Prepared but not verified against a real backend:

- destination-based call to SAP S/4HANA;
- target-system authentication and trust;
- Cloud Connector path for a possible on-premise landscape.

The named destination `S4HANA_BUSINESS_PARTNER` is absent from the Trial subaccount because no authorized SAP S/4HANA endpoint is available. No fake destination or repository credential is used.

## UI Status

The Fiori Elements List Report and Object Page are implemented and verified locally through `cds watch` with mock authentication and test data.

The current MTA deploys the CAP service and database deployer but does not deploy an Application Router or HTML5 application module. Therefore, the portfolio must not claim that the Fiori UI is currently hosted in SAP BTP. Cloud UI deployment and interactive XSUAA login remain separate future work.

## Security and Secret Handling

- No S/4HANA URL, user password, client secret, private key, or OAuth token is tracked in Git.
- `.env`, `.env.*`, `.cdsrc-private.json`, `default-*.json`, service keys, generated MTAR files, and build output are excluded from version control.
- The production profile uses XSUAA; mock credentials remain development-only.
- The Destination service is referenced by logical name rather than hard-coded backend credentials.
- Authorization, cookie, certificate, SSL, and Postman technical header values are masked in production application logs.

## Reproducible Verification

### Local quality gates

```bash
npm ci
npm test
mbt build -t mta_archives --mtar sap-cap-ai-request-hub_1.0.0.mtar
```

### Cloud Foundry verification

```bash
cf target
cf mta sap-cap-ai-request-hub
cf app sap-cap-ai-request-hub-srv
cf services
cf events sap-cap-ai-request-hub-srv
cf logs sap-cap-ai-request-hub-srv --recent
```

### Protected-route smoke check

```http
GET https://d93fd169trial-dev-sap-cap-ai-request-hub-srv.cfapps.us10-001.hana.ondemand.com/odata/v4/request/Requests
```

Expected without authentication:

```text
401 Unauthorized
```

## Known Limitations

- Single personal Trial DEV environment; no corporate DEV, TEST, or PROD landscape.
- No real SAP S/4HANA destination or backend credentials.
- Fiori UI is not deployed to SAP BTP by the current MTA.
- No cloud UI end-to-end test yet.
- No automatic production promotion, approval workflow, blue-green deployment, or automatic rollback.
- Trial lifecycle and quotas may stop or remove resources independently of the application.

## Evidence-Based Portfolio Claim

Accurate claim:

> Request Hub v1.0.0 is deployed as a CAP Node.js backend on SAP BTP Cloud Foundry with SAP HANA Cloud/HDI persistence, XSUAA protection, Destination service binding, GitHub Actions delivery, automated API tests, deployment smoke checks, and structured operational logging. The Fiori UI and SAP S/4HANA Business Partner integration are implemented and verified locally or through mocks but are not claimed as productive cloud integrations.

## Official References

- SAP CAP — Deploy to Cloud Foundry: https://cap.cloud.sap/docs/guides/deploy/to-cf
- SAP CAP — Authentication: https://cap.cloud.sap/docs/node.js/authentication
- SAP CAP — Consuming Services: https://cap.cloud.sap/docs/guides/services/consuming-services
- SAP CAP — Logging: https://cap.cloud.sap/docs/node.js/cds-log
- SAP BTP — MTA Commands: https://help.sap.com/docs/btp/sap-business-technology-platform/multitarget-application-commands-for-cloud-foundry-environment
- GitHub — Manually Running a Workflow: https://docs.github.com/actions/managing-workflow-runs/manually-running-a-workflow
