# Fiori Development Path

## Purpose

This document records the UI tooling decision for the Request Hub CAP application.

The goal of Day 31 is to confirm the development path for the future SAP Fiori elements UI.

This document does not create or define the Fiori application itself.

No Fiori application, `app/` folder, UI annotations, routing configuration, or Fiori preview configuration is created as part of Day 31.

## Official SAP Basis

SAP Fiori tools can be used for SAP Fiori application development in Visual Studio Code and SAP Business Application Studio.

Official SAP sources:

- SAP Fiori tools documentation:
  https://help.sap.com/docs/SAP_FIORI_tools

- SAP Fiori tools Extension Pack for Visual Studio Code:
  https://help.sap.com/docs/SAP_FIORI_tools/17d50220bcd848aa854c9c182d65b699/17efa217f7f34a9eba53d7b209ca4280.html

- SAP Business Application Studio dev space types:
  https://help.sap.com/docs/bas/sap-business-application-studio/dev-space-types

- CAP guide for SAP Fiori:
  https://cap.cloud.sap/docs/guides/uis/fiori

## Evaluated Options

### Option 1: Local Visual Studio Code with SAP Fiori tools

This option uses the local project workspace in Visual Studio Code together with the SAP Fiori tools Extension Pack.

The CAP backend is started locally with:

```text
cds watch
```

The future SAP Fiori elements application will use the local CAP OData services during development and preview.

### Option 2: SAP Business Application Studio

This option uses SAP Business Application Studio as a cloud-based development environment.

The relevant dev space types are:

- SAP Fiori
- Full Stack Cloud Application

This option is kept as a fallback if a corporate project environment requires development in SAP Business Application Studio.

## Checks Performed

### Local Visual Studio Code

Result:

```text
VS Code available: Yes
SAP Fiori tools Extension Pack visible: Yes
SAP Fiori tools Extension Pack installed: Yes
Installation allowed: Yes
Fiori commands visible: Yes
```

Visible Fiori commands included:

```text
Fiori: Open Application Generator
Fiori: Open Guided Development
Fiori: Open Environment Check
```

The SAP Fiori tools Environment Check was executed and generated the following files:

```text
envcheck-results.md
envcheck-results.json
```

Environment Check result summary:

```text
Platform: win32
Development environment: Visual Studio Code
Node.js: 24.11.1
Application Wizard: 1.23.0
SAP Fiori tools - Application Modeler: 1.28.0
SAP Fiori tools - Guided Development: 1.28.0
SAP Fiori tools - Service Modeler: 1.28.0
SAP Fiori tools - XML Annotation Language Server: 1.28.0
XML Toolkit: 1.2.1
SAP CDS Language Support: 10.0.1
UI5 Language Assistant Support: 4.0.94
```

Known Environment Check note:

```text
SAP Fiori tools - SAP Fiori generator: Not installed or found.
Cloud CLI tools: Not installed or found.
```

These findings are not blocking for Day 31, because Day 31 only confirms and documents the development path.

The SAP Fiori generator must be checked again before creating the Fiori application in the next UI implementation step.

### SAP Business Application Studio

Result:

```text
BTP Cockpit access: Yes, trial subaccount
SAP Business Application Studio subscription: Yes, trial plan, subscribed
SAP Business Application Studio can be opened: Yes
SAP Fiori Dev Space available: Yes, selectable in Create Dev Space
Full Stack Cloud Application Dev Space available: Yes, selectable in Create Dev Space
Existing BAS Dev Space created: No
Corporate BAS environment verified: No, only trial BTP was checked
```

No SAP Business Application Studio dev space was created as part of Day 31.

### Local CAP Backend

Result:

```text
Local CAP server starts: Yes
Database deployment: Yes, in-memory SQLite
Test data loaded: Yes
```

The local CAP backend was started with:

```text
cds watch
```

The server loaded the CAP model from the project CDS files and deployed the test data to the in-memory SQLite database.

### Git Status Before Documentation

Before creating this document, the project working tree was clean:

```text
On branch main
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean
```

## Decision

The selected primary development path for the Request Hub UI is:

```text
Local Visual Studio Code
+ SAP Fiori tools Extension Pack
+ local CAP server via cds watch
+ future local Fiori preview
```

SAP Business Application Studio remains the fallback development path:

```text
SAP Business Application Studio
+ SAP Fiori Dev Space
or
+ Full Stack Cloud Application Dev Space
```

The fallback path will be used only if a corporate project environment requires development in SAP Business Application Studio.

## Rationale

The local Visual Studio Code path is selected as the primary path because:

- the Request Hub CAP project is already developed locally;
- the backend is already started locally with `cds watch`;
- automated tests are already executed locally with `npm test`;
- Git workflow is already local;
- SAP Fiori tools are installed and available in Visual Studio Code;
- Fiori commands are visible in the VS Code Command Palette;
- SAP Business Application Studio was verified only in a trial BTP environment, not in a corporate subaccount.

## Consequences

For the next UI implementation steps:

- the Fiori application should be generated from the local VS Code workspace;
- the local CAP backend should be used as the development backend;
- the future Fiori preview should run against the local CAP OData services;
- SAP Business Application Studio should not be used unless a corporate requirement appears.

Day 31 does not decide the concrete Fiori application template.

The following topics are intentionally postponed:

- Fiori application generation;
- `app/` folder creation;
- List Report / Object Page selection;
- UI annotations;
- Fiori preview configuration;
- deployment configuration;
- approuter configuration.

## Day 31 Definition of Done

Day 31 is complete when this UI tooling decision record exists in the repository:

```text
docs/ui/fiori-development-path.md
```

Expected proof:

```text
UI tooling decision record
```