# SAP BTP Access Matrix

## Purpose

This document records the actual SAP BTP platform access available for the Request Hub project.

It distinguishes verified access from assumed or requested access and separates the personal trial environment from the corporate environment.

## Status Definitions

| Status | Meaning |
|---|---|
| Verified | Access has been confirmed through the UI or CLI. |
| Partially verified | Some access exists, but required permissions or functionality have not been fully confirmed. |
| Not verified | Access has not yet been checked. |
| Not available | The service, entitlement, subscription, role, or environment is unavailable. |
| Requested | Access has been requested but not yet granted. |

## Access Matrix

| Component | Environment | Entitlement / Availability | User Access | Verification Evidence | Owner | Next Action | Status |
|---|---|---|---|---|---|---|---|
| SAP BTP Cockpit | Personal trial |  |  |  | User |  |  |
| Cloud Foundry | Personal trial |  |  |  | User |  |  |
| SAP HANA Cloud | Personal trial |  |  |  | User |  |  |
| XSUAA | Personal trial |  |  |  | User |  |  |
| Destination Service | Personal trial |  |  |  | User |  |  |
| SAP Business Application Studio | Personal trial |  |  |  | User |  |  |
| Jenkins | Local / external |  |  |  | User |  |  |
| SAP BTP Cockpit | Corporate DEV |  |  |  | Corporate BTP administrator |  |  |
| Cloud Foundry | Corporate DEV |  |  |  | Corporate BTP administrator |  |  |
| SAP HANA Cloud | Corporate DEV |  |  |  | Corporate BTP administrator |  |  |
| XSUAA | Corporate DEV |  |  |  | Corporate BTP administrator |  |  |
| Destination Service | Corporate DEV |  |  |  | Corporate BTP administrator |  |  |
| SAP Business Application Studio | Corporate DEV |  |  |  | Corporate BTP administrator |  |  |
| Jenkins | Corporate environment |  |  |  | DevOps team |  |  |

## Current Result

- Verified: SAP BTP Cockpit in the personal trial environment.
- Partially verified: SAP Business Application Studio in the personal trial environment.
- Not verified: Cloud Foundry, SAP HANA Cloud, XSUAA, Destination Service, and Jenkins.
- Corporate DEV access has not yet been provided or verified.

## Main Access Gaps

1. Cloud Foundry organization, space, and user roles.
2. SAP HANA Cloud entitlement and instance access.
3. XSUAA and Destination Service entitlements.
4. Corporate SAP BTP subaccount access.
5. Corporate CI/CD and Jenkins responsibilities.