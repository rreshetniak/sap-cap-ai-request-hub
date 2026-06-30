# Request Hub OData Query Examples

## Service Endpoints

| Service | Base URL | Purpose |
|---|---|---|
| RequesterService | `/requester` | Requester-facing API for creating and tracking requests |
| ProcessorService | `/processor` | Processor-facing API for handling requests, history, and approval steps |
| RequestService | `/odata/v4/request` | Workflow and learning API; currently contains the `submit` action |

## Query Options Covered

- `$select`
- `$filter`
- `$orderby`
- `$top`
- `$skip`
- `$expand`

## Examples

## 1. Read one requester-facing request

### Request

```http
GET /requester/Requests(33333333-3333-3333-3333-333333333333)
```

### Purpose

Reads one request from `RequesterService` by its technical key (`ID` / UUID).

### Expected Result

* HTTP status: `200 OK`
* The response contains requester-facing fields such as `title`, `description`, `businessPartnerId`, `requestType_code`, `priority_code`, `status_code`, and `aiSummary`.
* The response does not contain `history` or `approvalSteps`.
* Related entities such as `comments`, `requestType`, `priority`, and `status` are not included unless requested explicitly with `$expand`.


## 2. Select specific fields

### Request

```http
GET /requester/Requests?$select=ID,title,status_code,priority_code
```

### Purpose

Returns a compact requester-facing request list with only the fields needed for an overview screen.

### Expected Result

* HTTP status: `200 OK`
* The response contains a `value` array.
* Each request contains only:

  * `ID`
  * `title`
  * `status_code`
  * `priority_code`
* Fields such as `description`, `aiSummary`, `createdAt`, and `comments` are not returned.

### Verified Example Result

```json
{
  "value": [
    {
      "ID": "11111111-1111-1111-1111-111111111111",
      "title": "Invoice amount clarification",
      "status_code": "DRAFT",
      "priority_code": "HIGH"
    },
    {
      "ID": "22222222-2222-2222-2222-222222222222",
      "title": "Supplier bank account change",
      "status_code": "SUBMITTED",
      "priority_code": "MEDIUM"
    },
    {
      "ID": "33333333-3333-3333-3333-333333333333",
      "title": "Approval cockpit access",
      "status_code": "IN_PROCESS",
      "priority_code": "LOW"
    }
  ]
}
```

## 3. Filter requests by status

### Request

```http
GET /processor/Requests?$filter=status_code eq 'IN_PROCESS'
```

### Purpose

Returns only processor-facing requests that are currently in progress.

### Filter Expression

```text
status_code eq 'IN_PROCESS'
```

`eq` means “equals”.

### Expected Result

* HTTP status: `200 OK`
* The response contains a `value` array.
* Only requests with `status_code` equal to `IN_PROCESS` are returned.
* Because no `$select` option is used, the response contains all fields published by `ProcessorService.Requests`.

### Verified Example Result

```json
{
  "value": [
    {
      "ID": "33333333-3333-3333-3333-333333333333",
      "title": "Approval cockpit access",
      "status_code": "IN_PROCESS"
    }
  ]
}
```

## 4. Sort and paginate processor worklist
### Request

```http
GET /processor/Requests?$orderby=title asc&$top=2&$skip=1
```

### Purpose

Returns one page of the processor worklist after sorting requests alphabetically by title.

### Query Options

```text
$orderby=title asc
→ sort requests by title from A to Z

$skip=1
→ skip the first sorted request

$top=2
→ return the next two requests
```

### Expected Result

* HTTP status: `200 OK`
* The response contains a `value` array with two requests.
* With the current test data, the returned requests are:

  1. `Invoice amount clarification`
  2. `Supplier bank account change`

### Verified Example Result

```json
{
  "value": [
    {
      "ID": "11111111-1111-1111-1111-111111111111",
      "title": "Invoice amount clarification",
      "status_code": "DRAFT"
    },
    {
      "ID": "22222222-2222-2222-2222-222222222222",
      "title": "Supplier bank account change",
      "status_code": "SUBMITTED"
    }
  ]
}
```

## 5. Read request with related entities
### Request

```http
GET /processor/Requests(33333333-3333-3333-3333-333333333333)?$expand=comments,history,approvalSteps,requestType,priority,status
```

### Purpose

Reads one processor-facing request together with its related entities.

### Expanded Navigation Properties

```text
comments
→ requester and processor comments for the request

history
→ lifecycle event records for the request

approvalSteps
→ approval decisions and pending approval steps

requestType
→ related request-type code-list entry

priority
→ related priority code-list entry

status
→ related current-status code-list entry
```

### Expected Result

* HTTP status: `200 OK`
* One Request is returned.
* `comments` contains two records.
* `history` contains one record.
* `approvalSteps` contains two records.
* `requestType`, `priority`, and `status` are returned as nested objects.

### Verified Example Result

```json
{
  "ID": "33333333-3333-3333-3333-333333333333",
  "title": "Approval cockpit access",
  "status_code": "IN_PROCESS",

  "comments": [
    {
      "commentType": "REQUESTER",
      "text": "Please clarify which approvals are required for the approval cockpit."
    },
    {
      "commentType": "PROCESSOR",
      "text": "Initial access review has started."
    }
  ],

  "history": [
    {
      "eventType": "PROCESSING_STARTED",
      "previousStatus_code": "SUBMITTED",
      "newStatus_code": "IN_PROCESS"
    }
  ],

  "approvalSteps": [
    {
      "stepNo": 1,
      "decision": "APPROVED"
    },
    {
      "stepNo": 2,
      "decision": "PENDING"
    }
  ],

  "requestType": {
    "code": "ACCESS_REQUEST",
    "name": "Access Request"
  },

  "priority": {
    "code": "LOW",
    "name": "Low"
  },

  "status": {
    "code": "IN_PROCESS",
    "name": "In Process"
  }
}
```
