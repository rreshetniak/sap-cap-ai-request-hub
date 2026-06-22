# Request Hub Domain Model Draft

## Business Purpose

SAP CAP AI Request Hub is an enterprise-oriented application for creating, processing, clarifying, approving, or rejecting business requests.

Typical request scenarios include supplier master-data changes, invoice clarifications, access requests, procurement-related requests, and business process clarifications.

The application must provide a controlled request lifecycle, traceable processing information, comments, approval steps, and future integration with external SAP business partner master data.

## Root Business Object

`Requests` is the root transaction entity of the Request Hub domain model.

A request represents one concrete business case created during process execution. All process-related child records, such as comments, history entries, and approval steps, belong to one specific request and have no business meaning without it.

## Entities and Responsibilities

| Entity | Business Responsibility | Classification | Why it exists |
|---|---|---|---|
| `Requests` | Main business request that can be created, processed, clarified, approved, or rejected | Root transaction entity | All request-related process data belongs to this business object |
| `RequestTypes` | Defines allowed request categories such as supplier change, access request, or invoice clarification | Reference data | Prevents inconsistent free-text request type values |
| `RequestPriorities` | Defines allowed priority values such as low, medium, and high | Reference data | Ensures consistent prioritization across requests |
| `RequestStatuses` | Defines allowed lifecycle statuses such as draft, submitted, in process, approved, rejected, and clarification required | Reference data | Ensures controlled and consistent request status values |
| `RequestComments` | Stores human-written comments for a specific request | Child transaction entity / composition | A comment has no business meaning without its parent request |
| `RequestHistory` | Stores system-recorded business events, status changes, assignments, and decisions | Child transaction entity / composition | The history belongs to exactly one request and provides a traceable audit trail |
| `ApprovalSteps` | Stores planned and completed approval or processing steps | Child transaction entity / composition | Approval steps belong to one request and describe its approval progress |
| `BusinessPartners` | Represents external business partner master data used by requests | External reference / future remote service | Request Hub is not the source of truth for business partner master data |

## Relationship Decisions

### Associations

The following relationships should be modeled as associations because the referenced entities can exist independently of a specific request.

| Source | Target | Reason |
|---|---|---|
| `Requests` | `RequestTypes` | One request uses one allowed type; one type can be used by many requests |
| `Requests` | `RequestPriorities` | One request uses one allowed priority; one priority can be used by many requests |
| `Requests` | `RequestStatuses` | One request has one current status; a status can be used by many requests |
| `Requests` | `BusinessPartners` | Business partner master data exists outside Request Hub and is expected to come from a remote SAP system later |

### Compositions

The following relationships should be modeled as compositions because the child data belongs to one request and should not exist independently.

| Root Entity | Child Entity | Reason |
|---|---|---|
| `Requests` | `RequestComments` | Comments belong to one specific request |
| `Requests` | `RequestHistory` | History records describe events of one specific request |
| `Requests` | `ApprovalSteps` | Approval steps are part of the processing lifecycle of one specific request |

If a request is deleted, its comments, history entries, and approval steps should also be removed.

## Important Business Distinctions

### RequestComment vs RequestHistory

`RequestComments` contains human-written communication, for example:

- "Please provide the supplier confirmation document."
- "The request was reviewed and forwarded for approval."

`RequestHistory` contains system-recorded business events, for example:

- Request created
- Status changed from `DRAFT` to `SUBMITTED`
- Request assigned to a processor
- Approval decision recorded

A comment may support a business decision, but it does not replace a history entry.

### RequestStatus vs ApprovalStep

`RequestStatus` describes the overall current state of the whole request.

Examples:

- `DRAFT`
- `SUBMITTED`
- `IN_PROCESS`
- `APPROVED`
- `REJECTED`

`ApprovalStep` describes one individual processing or approval stage.

Examples:

- Processor review: completed
- Approver decision: pending
- Finance approval: not started

A request can have the status `IN_PROCESS` while different approval steps have different statuses.

### Reference Data vs Transaction Data

Reference data defines allowed reusable values used throughout business processes.

Examples:

- Request types
- Priorities
- Statuses

Transaction data represents concrete business records created during process execution.

Examples:

- Requests
- Request comments
- Request history entries
- Approval steps

### Internal Request Hub Data vs External Business Partner Data

Request Hub owns its request-related transaction data.

Business partner master data is expected to remain in an external source system, such as SAP S/4HANA. Request Hub should store a business partner reference and later retrieve business partner details through a remote OData service.

## Open Decisions Before CDS Implementation

1. Which exact request statuses are allowed, and which status transitions are valid?
2. Can approval steps run in parallel, or must they always be processed sequentially?
3. Which roles can create, assign, process, approve, reject, or audit requests?
4. Is an approval step always required, or do some request types use a direct processing flow?
5. Which business partner information should be stored locally as a reference, and which details should always be read from the external source system?
6. Is a rejection comment mandatory for every rejected request?
7. Should request creation use a draft process, or should a request be saved directly as `DRAFT`?
