# Day 53 — Pipeline Quality Gates

## Goal
Ensure that invalid code cannot proceed to packaging or deployment.

## Implemented Gates
### Test Gate
The `test` job runs before packaging. If `npm test` fails, the package job does not run.

### Package Gate
The `package` job depends on the test job. The MTAR build must succeed and the expected archive must exist.

### Artifact Gate
The MTAR is transferred as a GitHub Actions artifact. Deployment consumes the produced artifact instead of rebuilding from an unrelated state.

### Deployment Gate
The `deploy` job depends on the successful package job, runs only for `workflow_dispatch`, and uses the protected GitHub Environment `btp-trial-dev`.

### Authentication Gate
Deployment uses a short-lived GitHub OIDC token and SAP Cloud Identity Services federation. No permanent Cloud Foundry password is stored in GitHub for deployment.

### Post-Deployment Gate
After `cf deploy`, the workflow calls `/odata/v4/request/Requests` without authentication. Expected status: `401`. Any other status causes the smoke-test step to fail.

## Result
The pipeline prevents failed tests, failed builds and failed deployment verification from being treated as successful delivery.
