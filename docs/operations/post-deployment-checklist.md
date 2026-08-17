# Day 64 — Post-Deployment Operations Checklist

## Purpose

Use this checklist after every Request Hub deployment to SAP BTP Cloud Foundry. It separates application health, security, service bindings, logging, and functional limitations into reproducible first-line checks.

## Current Environment

- Environment: SAP BTP Trial
- Cloud Foundry org: `d93fd169trial`
- Cloud Foundry space: `dev`
- MTA ID: `sap-cap-ai-request-hub`
- CAP application: `sap-cap-ai-request-hub-srv`
- Protected endpoint: `/odata/v4/request/Requests`

## 1. Delivery Pipeline

| Check | Expected result |
| --- | --- |
| Install and test | Successful |
| Build MTA archive | Successful |
| Deploy to BTP Trial | Successful for a manual `workflow_dispatch` run |
| Automated smoke check | `401 Unauthorized` without a token |

The `401` result is intentional: it proves that the route is reachable and XSUAA protects the CAP service.

## 2. Deployment and Runtime State

Run:

```bash
cf target
cf mta sap-cap-ai-request-hub
cf app sap-cap-ai-request-hub-srv
cf services
```

Verify:

- the target is org `d93fd169trial`, space `dev`;
- the MTA version matches the release version;
- `sap-cap-ai-request-hub-srv` is `STARTED` with `1/1` instance running;
- the HDI container is bound to the CAP service;
- XSUAA and Destination service instances are bound;
- the HANA Cloud database exists;
- the database deployer is stopped after successful execution.

The stopped database deployer is normal because it is a one-time deployment module, not a continuously running application.

## 3. Cloud Foundry Events

Run:

```bash
cf events sap-cap-ai-request-hub-srv
```

Healthy sequence:

```text
build.create → build.staged → droplet.mapped → app.start → process.ready
```

Investigate unexpected `crash`, repeated `stop/start`, failed staging, or a missing `process.ready` event.

## 4. API Smoke Check

Send without authentication:

```http
GET https://d93fd169trial-dev-sap-cap-ai-request-hub-srv.cfapps.us10-001.hana.ondemand.com/odata/v4/request/Requests
```

Expected result:

```text
401 Unauthorized
```

An unexpected `404` suggests an incorrect route or service path. A `5xx` response requires application and platform log analysis.

## 5. Live Log Check

Start the stream:

```bash
cf logs sap-cap-ai-request-hub-srv
```

Repeat the smoke request, correlate the application and router entries, and stop the stream with `Ctrl+C`.

Verify:

- application and router logs share request-correlation data;
- the response is `401` without authentication;
- `failed_attempts` is `0` for a normal routed request;
- no crash, stack trace, or unhandled exception appears;
- sensitive headers remain masked;
- `postman_token` is logged as `***` after the Day 64 hardening change.

Production masking keeps the CAP defaults for authorization, cookies, certificates, and SSL-related headers and adds masking for `Postman-Token`.

## 6. Functional Boundaries

| Capability | Current verification |
| --- | --- |
| CAP backend deployment | Verified in SAP BTP Trial |
| HANA/HDI deployment | Verified |
| XSUAA protection | Verified with unauthenticated `401` |
| Local Fiori Elements UI | Verified through local development flow |
| Cloud Fiori UI | Not deployed by the current MTA |
| Local Business Partner mock | Verified by automated tests |
| Real SAP S/4HANA Business Partner service | Not connected; named destination is absent |

## 7. First-Line Incident Response

1. Confirm the correct org and space with `cf target`.
2. Check `cf app` for requested state, instance count, memory, and recent start time.
3. Check `cf events` for crash, staging, and restart events.
4. Use `cf logs --recent` and then live `cf logs` if the buffer is empty.
5. Correlate application and router entries using the correlation/request ID.
6. Verify service bindings with `cf services` without printing credentials.
7. Reproduce the smallest safe smoke request.
8. Record the observed status and avoid claiming functionality that has not been tested in the current environment.

## Verified Day 64 Result

- Deployment pipeline successful.
- MTA version `1.0.0` running with one healthy instance.
- No crash events observed.
- Protected endpoint returned `401` as expected.
- Live application and router logging verified.
- Technical `Postman-Token` header masked after hardening.
- Automated test suite passed: `26/26`.

## Official References

- SAP BTP — Logging and Tracing: https://help.sap.com/docs/btp/sap-business-technology-platform/logging-and-tracing
- SAP CAP — Logging and Header Masking: https://cap.cloud.sap/docs/node.js/cds-log#header-masking
- SAP BTP — MTA Commands: https://help.sap.com/docs/btp/sap-business-technology-platform/multitarget-application-commands-for-cloud-foundry-environment

