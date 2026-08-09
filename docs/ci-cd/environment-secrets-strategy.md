# Day 54 — Environment and Secrets Strategy

## Goal
Separate environment-specific configuration from source code and avoid storing long-lived deployment credentials in Git.

## Current Environment
The project currently deploys only to `DEV = SAP BTP Trial / d93fd169trial / dev`.

TEST and PROD are not provisioned in this learning track. They are treated as future environments that would use the same variable contract with different values.

## GitHub Environment
Deployment uses `btp-trial-dev`.

## Environment Variables
The deployment workflow uses:
- `CF_API`
- `CF_ORG`
- `CF_SPACE`
- `CF_ORIGIN`
- `IAS_ISSUER`
- `APP_URL`

## Authentication Strategy
GitHub Actions requests a short-lived OIDC JWT. The token is federated through SAP Cloud Identity Services and mapped to a dedicated helper user with Cloud Foundry `Space Developer` access.

Long-lived credentials are intentionally not used for deployment.

Not stored in GitHub for this flow:
- Cloud Foundry user password
- permanent BTP password
- XSUAA service key
- persistent OAuth client secret

## Repository Hygiene
The project baseline already established that `.env`, `node_modules` and secret files are excluded from Git tracking.

Environment-specific runtime values belong in platform or CI environment configuration, not in committed source files.

## Future DEV / TEST / PROD Model
Each environment should have its own CI/CD environment boundary while keeping the same variable names. Values and deployment permissions differ per environment; application source code does not.
