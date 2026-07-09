# Request Hub Authorization Model

## Purpose

This document describes the authorization model of the Request Hub CAP application.

The goal of the current security model is to protect request data on three levels:

1. service-level access,
2. action-level access,
3. instance-level read access.

The current implementation uses local mock users for development and automated API tests.

This configuration is intended for local development and test execution only. It is not a productive SAP BTP identity provider configuration.

## Local Mock Users

The project uses email-like technical user IDs for local mock authentication.

| User ID | Password | Role |
|---|---|---|
| `0001_requester@scarh.com` | `requester` | `Requester` |
| `0002_requester@scarh.com` | `requester` | `Requester` |
| `0001_processor@scarh.com` | `processor` | `Processor` |
| `0001_admin@scarh.com` | `admin` | `Admin` |

The email-like user IDs are used intentionally because instance-level authorization compares business fields with the current authenticated user.

For example:

```text
createdBy = $user
assignedProcessorId = $user

## Service-level Authorization

The application exposes three CAP services with role-based access restrictions.

| Service | Path | Allowed Roles |
|---|---|---|
| `RequesterService` | `/requester` | `Requester`, `Admin` |
| `ProcessorService` | `/processor` | `Processor`, `Admin` |
| `RequestService` | `/odata/v4/request` | `Requester`, `Processor`, `Admin` |

Service-level authorization defines which roles are allowed to access a service at all.

It does not decide which concrete request instances are visible to a user.

## Action-level Authorization

Lifecycle actions are protected with action-level role restrictions.

| Action | Allowed Roles |
|---|---|
| `submit` | `Requester`, `Admin` |
| `assign` | `Processor`, `Admin` |
| `approve` | `Processor`, `Admin` |
| `rejectRequest` | `Processor`, `Admin` |
| `requestClarification` | `Processor`, `Admin` |

Action-level authorization defines which roles are allowed to execute a specific business operation.

For example, a requester can access `RequestService`, but cannot execute processor actions such as `assign` or `approve`.

## Instance-level Read Authorization

Instance-level read authorization restricts which concrete request records are visible to a user.

### RequesterService

Requester users can read only requests created by themselves.

```cds
@restrict: [
  { grant: 'READ', to: 'Requester', where: (createdBy = $user) },
  { grant: 'READ', to: 'Admin' }
]
```

This means:

```text
Requester can read a request only if createdBy equals the current authenticated user.
```

### ProcessorService

Processor users can read only requests assigned to themselves.

```cds
@restrict: [
  { grant: 'READ', to: 'Processor', where: (assignedProcessorId = $user) },
  { grant: 'READ', to: 'Admin' }
]
```

This means:

```text
Processor can read a request only if assignedProcessorId equals the current authenticated user.
```

### Admin Access

Admin users can read all requests through both `RequesterService` and `ProcessorService`.

Admin access is intentionally unrestricted in the MVP authorization model.

## Test Evidence

The security model is covered by automated API tests.

| Test File | Purpose |
|---|---|
| `test/request-service-authorization.test.js` | Verifies service-level authorization |
| `test/request-action-authorization.test.js` | Verifies action-level authorization |
| `test/request-instance-authorization.test.js` | Verifies instance-level read authorization |
| `test/request-lifecycle-submit.test.js` | Verifies submit lifecycle with authorized users |
| `test/request-lifecycle-negative.test.js` | Verifies negative lifecycle behavior with authorized users |
| `test/request-lifecycle-approve.test.js` | Verifies approve lifecycle with authorized users |
| `test/request-service-read.test.js` | Verifies read behavior and 404 handling |

Current test evidence:

```text
tests 17
pass 17
fail 0
```