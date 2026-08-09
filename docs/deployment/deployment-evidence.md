# Day 50 — Deployment Evidence

## Goal
Demonstrate a real SAP BTP Cloud Foundry deployment of the Request Hub application and verify that the deployed runtime is reachable and protected.

## Environment
- SAP BTP Trial
- Cloud Foundry org: `d93fd169trial`
- Cloud Foundry space: `dev`
- CAP application: `sap-cap-ai-request-hub-srv`
- HANA Cloud instance: `request-hub-hana`
- XSUAA service: `request-hub-auth`
- Route: `https://d93fd169trial-dev-sap-cap-ai-request-hub-srv.cfapps.us10-001.hana.ondemand.com`

## Deployment Artifact
The application is packaged as `mta_archives/sap-cap-ai-request-hub_0.1.0.mtar` and deployed with the Cloud Foundry MultiApps plugin.

## Verified Deployment Flow
1. Build MTAR.
2. Target the SAP BTP Cloud Foundry org and space.
3. Deploy with `cf deploy`.
4. Execute the HDI database deployer task.
5. Stage and start the CAP service.
6. Verify the application route.
7. Execute an HTTP smoke test.

## Evidence
Observed deployment output confirmed:
- MTA `sap-cap-ai-request-hub` detected.
- HDI deployer task executed.
- CAP service staged and started.
- Application route became available.
- Deployment process finished successfully.
- Unauthenticated request to `/odata/v4/request/Requests` returned `401`.

Expected negative smoke-test result: `401 Unauthorized`.

This proves that the route is reachable and that XSUAA protection is active for the Request service.

## Result
Day 50 deployment requirement is satisfied with real DEV deployment evidence rather than a dry-run.
