# Day 55 — Delivery Runbook

## Goal
Document the verified release flow, verification checkpoints and rollback assumptions for the Request Hub application.

## Release Trigger
Deployment is not triggered by every push. For the current DEV environment, deployment starts manually with GitHub Actions `workflow_dispatch`.

## Release Flow
1. Run automated tests.
2. Build `sap-cap-ai-request-hub_0.1.0.mtar`.
3. Upload the MTAR artifact.
4. Start the deployment job in `btp-trial-dev`.
5. Install Cloud Foundry CLI.
6. Install MultiApps plugin.
7. Request a short-lived GitHub OIDC token.
8. Authenticate to SAP BTP Cloud Foundry through IAS federation.
9. Target org `d93fd169trial`, space `dev`.
10. Deploy the exact MTAR artifact with `cf deploy`.
11. Let the HDI deployer update the database artifacts.
12. Start the CAP service.
13. Execute the HTTP smoke test.
14. Log out of Cloud Foundry.

## Verification Checkpoints
A delivery is successful only when:
- tests pass;
- MTAR build succeeds;
- expected artifact exists;
- OIDC authentication succeeds;
- correct org and space are targeted;
- `cf deploy` finishes successfully;
- CAP service starts;
- protected Request endpoint returns expected `401` without authentication.

## Deployment Evidence
A verified GitHub Actions deployment completed successfully with Cloud Foundry authentication as the dedicated helper user, HDI deployer execution, CAP service restart, application route available and smoke test result `HTTP 401`.

## Rollback Assumptions
The current workflow uses standard MTA deployment, not blue-green deployment. There is no automatic rollback stage.

If a release must be reverted:
1. identify the last known-good Git commit and MTAR;
2. run the CI pipeline for that state or obtain its preserved artifact;
3. redeploy the known-good MTAR to the same DEV space;
4. repeat the smoke test and application verification.

Database compatibility must be considered before rollback if a newer deployment introduced destructive schema changes.

## Operational Note
The current project is a single DEV Trial environment. TEST/PROD promotion, formal approvals and automated production rollback are intentionally outside the current environment scope.
