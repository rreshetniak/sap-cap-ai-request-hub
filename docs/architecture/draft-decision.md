# ADR-006: SAP Fiori Draft Decision

## Status

Accepted

## Context

Request Hub currently uses an explicit business lifecycle for requests.

The lifecycle is controlled by CAP actions such as submit, assign, approve, rejectRequest and requestClarification.
The request status is stored in the business field status_code.
One of the business statuses is DRAFT.

## Decision

SAP Fiori Draft will not be enabled for Request Hub at this stage.

The Requests entity will not be annotated with @odata.draft.enabled in the current MVP.

## Rationale

The current application is action-driven rather than free-form edit-driven.

Request creation and processing are controlled by explicit backend actions and validations.
The existing business status DRAFT is sufficient for the current pre-submission state.

Enabling SAP Fiori Draft would add a second, technical draft lifecycle in addition to the existing business lifecycle.
This would increase the complexity of handlers, tests and UI behavior without a clear MVP benefit.

## Consequences

Users continue to work with active request records.

Pre-submission work is represented by the business status DRAFT.
Lifecycle changes are performed through explicit actions.

SAP Fiori Draft can be reconsidered later if Request Hub needs long-running edit sessions,
temporary unsaved changes, collaborative draft handling or a more standard create/edit draft experience.

## End-to-End UI Walkthrough

The Request Hub flow was reviewed through the Fiori elements application and the CAP OData service.

1. The List Report displays request title, type, priority and status using readable values.
2. Status, request type and priority provide value helps in the filter bar.
3. A request in business status DRAFT can be opened on the Object Page.
4. The Object Page displays the General, Processing and Audit sections.
5. The submit action changes the request status from DRAFT to SUBMITTED.
6. The assign action changes the status from SUBMITTED to IN_PROCESS, assigns a processor and creates a pending approval step.
7. The approve action closes the pending approval step and changes the request status from IN_PROCESS to APPROVED.
8. The updated lifecycle state is displayed correctly in the Fiori application after refresh.

## UX Findings

- Lifecycle actions were initially displayed using their technical action names.
  User-facing labels were added with `@title`.
- Request type, priority and status initially displayed empty association values.
  The UI annotations now use the corresponding `name` fields.
- Value helps are available for request type, priority and status.
- Switching between mocked Basic Authentication users in the same browser session is inconvenient during local development.
  Role-specific requests can be verified reliably through Postman.