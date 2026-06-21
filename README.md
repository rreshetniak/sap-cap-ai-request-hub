# SAP CAP AI Request Hub

Enterprise-oriented SAP BTP portfolio project for managing business requests, approvals, audit history, and future AI-assisted decision support.

The application is designed as a side-by-side extension concept for SAP environments. It demonstrates how a CAP-based backend can provide controlled request processing, OData APIs, Fiori-ready services, authorization boundaries, auditability, and integration-ready architecture.

## Business Scenario

Business users create requests that require review, processing, approval, clarification, or rejection.

Example request scenarios include:

* Supplier master data change
* Invoice clarification
* Access request
* Procurement-related request
* Business process clarification
* Document-related request
* Approval request

The project models a controlled request lifecycle instead of a simple data catalogue.

## Current Implementation Status

The current baseline includes:

* SAP CAP Node.js project structure
* CDS domain model
* `Requests` entity
* UUID-based technical key
* Managed audit fields
* OData V4 service definition
* Service projection for `Requests`
* Local development setup with SQLite dependency
* Git repository and ignore rules

The following capabilities are planned but are not implemented yet:

* Request lifecycle actions
* Validation rules
* Request history and audit trail
* Role-based authorization
* Fiori Elements UI
* SAPUI5 custom extension
* SAP S/4HANA Business Partner integration mock
* Cloud Foundry deployment configuration
* CI/CD pipeline
* AI-assisted request summary and classification suggestions

## Baseline Release v0.1.0

Version `0.1.0` represents the first verified local CAP baseline of the project.

The baseline includes:

* CAP Node.js project structure
* CDS domain model for `Requests`
* OData V4 `RequestService`
* Verified service root and `$metadata`
* Local SQLite in-memory development database
* Mock request data loaded from `test/data`
* OData `$select` validation
* Model-to-service architecture documentation
* Clean Git baseline and release tag

Current limitations:

* No request lifecycle actions yet
* No validation rules yet
* No role-based authorization yet
* No Fiori Elements or SAPUI5 UI yet
* No SAP S/4HANA integration yet
* No Cloud Foundry deployment yet
* No real AI integration yet

## Current Architecture

```text
Browser / API Client
        |
        v
OData V4 RequestService
        |
        v
Service Projection: Requests
        |
        v
Domain Entity: com.portfolio.requesthub.Requests
        |
        v
Local SQLite Database
```

## Current Domain Model

The main business entity is `Requests`.

| Field         | Purpose                                                                 |
| ------------- | ----------------------------------------------------------------------- |
| `ID`          | Technical UUID key generated through the CAP `cuid` aspect              |
| `title`       | Short business title of the request                                     |
| `description` | Detailed request description                                            |
| `requestType` | Initial request type value; later replaced by controlled reference data |
| `priority`    | Initial priority value; later replaced by controlled reference data     |
| `status`      | Current request status; lifecycle rules will be added later             |
| `aiSummary`   | Reserved field for future AI-assisted summary functionality             |
| `createdAt`   | Timestamp when the request was created                                  |
| `createdBy`   | User who created the request                                            |
| `modifiedAt`  | Timestamp of the latest change                                          |
| `modifiedBy`  | User who made the latest change                                         |

## Project Structure

```text
sap-cap-ai-request-hub/
├── app/                    # Future Fiori Elements / SAPUI5 application
├── db/
│   └── schema.cds          # Domain data model
├── srv/
│   └── request-service.cds # OData service definition
├── test/                   # Automated tests will be added incrementally
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

## Local Prerequisites

* Node.js
* npm
* SAP CDS Development Kit
* Git
* Visual Studio Code or SAP Business Application Studio

## Run Locally

Install dependencies:

```bash
npm install
```

Start the CAP development server:

```bash
cds watch
```

The terminal output shows the actual local server URL and service endpoint.

## OData API Baseline

After starting the server, verify the local CAP service in the browser or an API client.

Expected endpoints:

```text
http://localhost:4004/
http://localhost:4004/odata/v4/request/
http://localhost:4004/odata/v4/request/$metadata
http://localhost:4004/odata/v4/request/Requests
```

The exact port or service path must always be confirmed from the `cds watch` terminal output.

## Development Roadmap

### Phase 1 — CAP Foundation

* Validate local OData contract
* Add initial CSV test data
* Create enterprise request domain model
* Add request types, priorities, statuses, comments, history, and approval steps

### Phase 2 — Business Logic and Security

* Implement request lifecycle actions
* Add validation rules
* Add transactional audit history
* Implement role-based and instance-based authorization
* Add automated CAP API tests

### Phase 3 — Fiori and Integration

* Build Fiori Elements List Report and Object Page
* Add SAPUI5 custom workflow extension
* Add mock SAP S/4HANA Business Partner integration
* Prepare destination-based configuration

### Phase 4 — Delivery and Operations

* Prepare SAP HANA Cloud persistence
* Prepare Cloud Foundry deployment artifacts
* Add CI/CD pipeline design
* Add operational runbook and support scenarios

### Phase 5 — AI-Assisted Features

* Add AI adapter pattern
* Add AI summary suggestion
* Add request classification suggestion
* Add human confirmation and AI audit trail

## Security Notice

This repository contains only mock business data.

Do not commit:

* SAP customer data
* production URLs
* passwords
* service keys
* certificates
* API tokens
* `.env` files
* local configuration containing credentials

## Current Learning Goal

The project is built step by step to demonstrate practical SAP BTP development skills:

* SAP CAP
* Core Data Services
* OData V4
* Node.js
* SAP Fiori Elements
* SAPUI5 extensions
* Authorization
* SAP S/4HANA integration patterns
* Automated testing
* SAP BTP deployment readiness
* Enterprise-safe AI integration patterns
