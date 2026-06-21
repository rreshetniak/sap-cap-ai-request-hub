# Model to Service Architecture

## Purpose

SAP CAP AI Request Hub is a business request management application.

The application will allow users to create and process business requests such as supplier master-data changes, invoice clarifications, access requests, and approval requests.

The entity `Requests` represents one business request and contains its core business information, technical key, audit fields, current status, and a reserved field for future AI-assisted summary functionality.

## Domain Model

The domain model is located in the `db` folder.

Current file:

```text
db/schema.cds
```

The namespace is:

```text
com.portfolio.requesthub
```

The namespace is a technical prefix for all CDS definitions declared in the file. Therefore, the full technical name of the business entity is:

```text
com.portfolio.requesthub.Requests
```

The entity `Requests` uses two standard CAP aspects imported from `@sap/cds/common`:

* `cuid` adds the technical primary key `ID` of type `UUID`.
* `managed` adds the audit fields `createdAt`, `createdBy`, `modifiedAt`, and `modifiedBy`.

The current business fields are:

| Field         | Meaning                                                                        |
| ------------- | ------------------------------------------------------------------------------ |
| `title`       | Short business title of the request                                            |
| `description` | Detailed description of the request                                            |
| `requestType` | Current free-text request type; controlled reference data will be added later  |
| `priority`    | Current free-text priority; controlled reference data will be added later      |
| `status`      | Current free-text status; lifecycle rules will be added later                  |
| `aiSummary`   | Reserved field for a future AI-generated summary; no AI integration exists yet |

## Service Layer

The service definition is located in:

```text
srv/request-service.cds
```

The service is declared as:

```cds
service RequestService {
  entity Requests as projection on db.Requests;
}
```

`RequestService` defines the API boundary of the application.

During `cds watch`, CAP reads the service definition, creates a service provider, and makes the service available through an OData V4 endpoint.

The statement:

```cds
using com.portfolio.requesthub as db from '../db/schema';
```

imports CDS definitions from `db/schema.cds`.

`db` is a local alias for the namespace `com.portfolio.requesthub`.

Therefore:

```cds
db.Requests
```

means:

```text
com.portfolio.requesthub.Requests
```

It does not mean a SQLite connection, database schema, physical table, or runtime folder access.

The projection:

```cds
entity Requests as projection on db.Requests;
```

creates the service-facing representation of the internal business entity.

At the current stage, the projection exposes the business fields of `db.Requests` through the API. Later, projections can expose different field sets for different use cases, roles, UI applications, or integration clients.

## Request Flow

```text
Browser / API Client
    ↓ HTTP GET request
OData URL: /odata/v4/request/Requests
    ↓
CAP Node.js server started by cds watch
    ↓
OData V4 adapter identifies the request
    ↓
RequestService
    ↓
Service entity: Requests projection
    ↓
Domain entity: com.portfolio.requesthub.Requests
    ↓
Configured persistence database: SQLite during local development
    ↓
OData JSON response
```

The service path `/request` belongs to `RequestService`.

The segment `/Requests` belongs to the service entity declared on the left side of the projection:

```cds
entity Requests as projection on db.Requests;
```

## Important Separation

| Layer                  | Meaning                                                                                    |
| ---------------------- | ------------------------------------------------------------------------------------------ |
| Internal domain model  | Defines business entities and their fields. Located in `db`.                               |
| Service / API contract | Defines what external clients can access. Located in `srv`.                                |
| UI                     | Later implemented with Fiori Elements, SAPUI5 extensions, or consumed by external clients. |
| Persistence database   | Stores records. During local development, the application currently uses SQLite.           |

The client does not access `db/schema.cds` directly. The client accesses the OData service and receives the API contract through `$metadata`.
