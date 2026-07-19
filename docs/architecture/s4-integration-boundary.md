# ADR-007: SAP S/4HANA Business Partner Integration Boundary

## Status

Accepted

## Context

Request Hub is a side-by-side SAP CAP extension application.

The application owns the request lifecycle, request status, comments, history,
assignments and approval steps.

SAP S/4HANA remains the system of record for Business Partner master data.

Request Hub currently stores only the external Business Partner identifier
in the `businessPartnerId` field.

The integration boundary must define which Business Partner data Request Hub
reads and which operations remain outside the responsibility of the application.

## Decision

Request Hub will consume SAP S/4HANA Business Partner data through a CAP remote service.

The integration is read-only. Request Hub may retrieve Business Partner data,
but it will not create, update or delete Business Partner master data.

SAP S/4HANA remains the system of record for Business Partner data.

Request Hub stores only the external Business Partner identifier in
`businessPartnerId`. Business Partner details retrieved from the remote service
will not be persisted in the Request Hub database in the current scope.

The initial integration scope is the lookup of one Business Partner by its
identifier and the retrieval of the minimum data required for display and
validation.

The Fiori application will not call SAP S/4HANA directly. All remote access will
be handled by the CAP backend.

Business Partner lookup will remain separate from the request lifecycle actions
`submit`, `assign`, `approve`, `rejectRequest` and `requestClarification`.

## Integration Scope

The remote integration will use the SAP S/4HANA Business Partner API contract.

The initial scope is limited to reading one Business Partner by the identifier
stored in `Requests.businessPartnerId`.

The minimum required remote data is:

- the Business Partner identifier;
- the Business Partner category;
- a human-readable Business Partner name suitable for the relevant category.

The exact remote properties used for the display name will be determined from
the official Business Partner service metadata before the mock contract is
implemented.

The integration will not automatically retrieve Business Partner data for every
row of the Request Hub List Report.

Remote Business Partner data will be requested only through a controlled CAP
backend operation when it is required for a concrete request.

## Out of Scope

The current integration does not include:

- creating Business Partners in SAP S/4HANA;
- updating or deleting Business Partner master data;
- changing customer or supplier master data;
- reading Business Partner addresses, bank details or tax numbers;
- replicating complete Business Partner records into the Request Hub database;
- synchronizing Business Partner master data in the background;
- exposing the remote SAP S/4HANA service directly to the Fiori application;
- enriching every Request automatically during List Report reads;
- calling the remote service from request lifecycle actions.

## Failure Boundary

A failure of the remote Business Partner service must not corrupt or modify
the local Request Hub business state.

If the remote service is unavailable, times out or returns an unexpected
response:

- the Business Partner lookup operation will fail with a controlled application
  error;
- the existing local Request record will remain readable;
- `status_code` will not be changed;
- `assignedProcessorId` will not be changed;
- no `RequestHistory` entry will be created;
- no `ApprovalSteps` record will be created or updated;
- no partial Business Partner data will be persisted locally.

The exact error codes, timeout configuration and error mapping will be defined
during the integration error-handling step.

Request lifecycle actions will not depend on a successful synchronous Business
Partner lookup in the current integration scope.

## Consequences

### Positive Consequences

- SAP S/4HANA remains the single source of truth for Business Partner master
  data.
- Request Hub remains responsible only for its own request-management domain.
- The integration can be developed locally against a mock service and later
  connected to SAP S/4HANA without changing the ownership boundary.
- The Fiori application remains independent of SAP S/4HANA connectivity and
  credentials.
- Remote service failures do not change the request lifecycle.
- The initial remote contract remains small and testable.
- The design avoids automatic N+1 remote calls during List Report reads.

### Negative Consequences and Trade-Offs

- Business Partner details may be temporarily unavailable when the remote
  service cannot be reached.
- Displayed Business Partner data is retrieved on demand and is not available
  as a complete local copy.
- Request Hub cannot search, filter or sort all requests by non-persisted remote
  Business Partner properties without additional integration design.
- Every operation requiring current Business Partner details depends on remote
  service latency.
- Timeout, error mapping and monitoring must be implemented explicitly.
- A future write-back scenario would require a separate architecture decision.

## Implementation Constraints

The initial implementation must comply with the following constraints:

- the mock service represents an external SAP S/4HANA service contract and is
  not part of the Request Hub persistence model;
- remote access is implemented through the CAP remote-service mechanism;
- the integration remains read-only;
- the initial use case reads one Business Partner by identifier;
- the Fiori application communicates only with the Request Hub CAP backend;
- the existing request lifecycle and authorization model remain operational
  without the remote service;
- remote integration failures are covered by automated tests.

## References

- SAP Cloud Application Programming Model: Consuming Services
- SAP Cloud Application Programming Model: Remote Services
- SAP BTP Developer’s Guide: Extending Existing SAP Solutions Using SAP BTP
- SAP S/4HANA: Business Partner API