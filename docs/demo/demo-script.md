# Request Hub — 8–10 Minute Portfolio Demo

## Demo Goal

Show a complete enterprise request flow and explain the architectural decisions behind it. The focus is not the number of screens; it is the connection between Fiori, CAP business rules, authorization, auditability, integration, automated tests, and repeatable delivery.

## Preparation

- Start the application with `cds watch`.
- Open the Fiori List Report and keep the Object Page ready.
- Keep one requester, one assigned processor, one unassigned processor, and the admin user available.
- Keep the GitHub Actions workflow summary and the three diagrams in `docs/architecture/portfolio-overview.md` open.
- Use only mock data. Do not show credentials, tokens, private URLs, service keys, or environment configuration.

## 0:00–0:45 — Business Problem and Result

Say:

> Request Hub is a side-by-side SAP BTP application for controlled business requests such as supplier changes, invoice clarifications, or access requests. It combines a Fiori user experience with CAP lifecycle rules, authorization, audit history, an SAP S/4HANA integration boundary, automated tests, and a repeatable delivery pipeline.

Show the List Report and briefly point out request type, priority, status, and assigned processor.

## 0:45–1:45 — Architecture

Open the runtime architecture diagram.

Explain:

- Fiori and API consumers use the same OData V4 services.
- CAP is the authoritative layer for validation, lifecycle, authorization, and history.
- SQLite is used locally; the BTP backend uses SAP HANA Cloud.
- SAP S/4HANA remains the owner of Business Partner master data.
- The current cloud deployment covers the protected CAP backend; the Fiori UI is verified in the local/BAS flow.

## 1:45–2:45 — Domain Model and Request Details

Open one request on the Object Page, then show the data-model diagram.

Explain:

- `Requests` is the aggregate root.
- Comments, history, and approval steps are compositions.
- Type, priority, and status are controlled reference data.
- Only `businessPartnerId` is stored locally; Business Partner details are read remotely.

Show the request details and business-history section.

## 2:45–4:00 — Requester Flow

Use a requester-owned draft or clarification-required request.

Show:

1. the fields required for submission;
2. the Submit action;
3. the resulting `SUBMITTED` status;
4. the new history entry.

Explain that the backend validates the transition and that requester instance access is limited by `createdBy = $user`.

## 4:00–5:15 — Processor Flow and Custom SAPUI5 Extension

Use a submitted request.

Show:

1. assignment to a processor;
2. transition to `IN_PROCESS`;
3. the custom Reject dialog;
4. mandatory rejection reason validation without completing the destructive action.

Optionally use Request Clarification instead of finishing the rejection so the lifecycle can continue in the same demo.

Explain that the custom dialog adds user experience beyond standard annotations, while the backend still validates the action.

## 5:15–6:15 — Approval and Auditability

Open an in-process request assigned to the current processor and execute Approve.

Show:

- the final approval step;
- the `APPROVED` request status;
- the approval history entry.

Explain that approval is rejected when the expected pending approval-step state is inconsistent. Request and history changes are treated as one business operation.

## 6:15–7:10 — Authorization and Support Scenario

Explain the two security checks for processing:

1. the user needs the `Processor` role;
2. the request must be assigned to that authenticated user.

Reference the regression scenarios:

- requester cannot read another requester’s data;
- unassigned processor receives `403 Forbidden` on Approve;
- assigned processor can complete Approve;
- admin can read across the operational services.

Do not weaken the backend policy to make the UI action work. Correct role mapping or assignment is the operational resolution.

## 7:10–8:00 — SAP S/4HANA Integration Boundary

Show Business Partner details for a linked request.

Explain:

- the integration is read-only;
- local development uses a mock remote service;
- production configuration uses a destination;
- unavailable remote service returns a safe `503` message;
- the backend log keeps request ID, Business Partner ID, and technical reason.

This demonstrates both the success path and a controlled cross-system failure.

## 8:00–9:00 — Automated Tests and Delivery

Show the latest successful test or GitHub Actions result.

Say:

> The MVP baseline has 25 automated tests covering service, action, and instance authorization; lifecycle success and failure paths; transactional approval history; Business Partner failures; safe logging; and OData expansion behavior.

Then explain the pipeline:

- push or pull request runs installation, tests, and MTA packaging;
- deployment is not automatic on every commit;
- `workflow_dispatch` starts deployment to the personal BTP Trial environment;
- GitHub OIDC provides short-lived authentication;
- the smoke test expects `401` from the protected endpoint, proving that the deployed service is reachable and secured.

## 9:00–9:40 — Close and Roadmap

Summarize:

> This release demonstrates a complete enterprise application slice: domain modeling, workflow, auditability, Fiori extensibility, security, integration, testing, and BTP delivery. The next phase hardens deployment and introduces AI through an adapter with human confirmation and an auditable decision trail. AI is intentionally not claimed as implemented in MVP v1.0.0.

End on the README or architecture overview so the viewer can immediately find the evidence in the repository.
