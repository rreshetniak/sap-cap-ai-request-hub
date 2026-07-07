# Request Service API Tests

## Purpose

This test suite verifies the Request Hub OData API and the most important request lifecycle transitions.

The tests use:

- Node.js built-in test runner
- `@cap-js/cds-test`
- in-memory SQLite database
- CSV test data from `test/data`

## Run Commands

Run the complete API test suite:

```powershell
npm test
```

Run read API tests only:

```powershell
npm run test:read
```

Run lifecycle API tests only:

```powershell
npm run test:lifecycle
```

## Current Test Coverage

### Read API

File:

```text
test/request-service-read.test.js
```

Covered scenarios:

1. An existing Request can be read successfully.
   - HTTP status: `200`
   - Request ID, title, and initial status are verified.

2. A missing Request returns:
   - HTTP status: `404`

### Submit Lifecycle

File:

```text
test/request-lifecycle-submit.test.js
```

Covered scenario:

```text
DRAFT
→ submit
→ SUBMITTED
```

Verified results:

- HTTP status `204`
- Request status changes to `SUBMITTED`
- One `RequestHistory` entry is created
- History records `DRAFT → SUBMITTED`

### Negative Lifecycle Scenarios

File:

```text
test/request-lifecycle-negative.test.js
```

Covered scenarios:

1. Repeated submit:
   - Request is already `SUBMITTED`
   - Repeated `submit` returns `409`
   - Request status and history remain unchanged

2. Rejection without a reason:
   - Request is `IN_PROCESS`
   - Empty `rejectionReason` returns `400`
   - CAP validation code: `ASSERT_MANDATORY`
   - Request status, assigned processor, and history remain unchanged

### Final Approval Lifecycle

File:

```text
test/request-lifecycle-approve.test.js
```

Covered scenario:

```text
IN_PROCESS
→ approve
→ APPROVED
```

Verified results:

- HTTP status `204`
- Request status changes to `APPROVED`
- Final pending approval step changes from `PENDING` to `APPROVED`
- Approval comment and decision timestamp are saved
- One `APPROVED` `RequestHistory` entry is created
- History records `IN_PROCESS → APPROVED`

## Current Test Result

```text
tests 6
pass 6
fail 0
```