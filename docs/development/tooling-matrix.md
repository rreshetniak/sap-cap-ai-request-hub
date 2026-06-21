# Development Tooling Matrix

## Purpose

This document records the development tools that are currently available for the SAP CAP AI Request Hub project.

The matrix helps distinguish between tools that are verified locally, tools that are available but not yet used, and tools that still require access confirmation.

| Tool / Service                  | Status       | Verified Version / Evidence                                | Current Purpose                                  |
| ------------------------------- | ------------ | ---------------------------------------------------------- | ------------------------------------------------ |
| Windows PowerShell              | Verified     | Used as the primary local terminal                         | Run CAP, npm, and Git commands                   |
| Visual Studio Code              | Verified     | Used for project development                               | Edit CDS, Markdown, CSV, and configuration files |
| Node.js                         | Verified     | 24.11.1                                                    | Run the CAP Node.js application                  |
| npm                             | Verified     | Available with Node.js installation                        | Install and manage project dependencies          |
| SAP CDS Development Kit         | Verified     | `@sap/cds-dk` 9.9.2 globally installed                     | Create, run, and manage CAP project artifacts    |
| SAP CAP Node.js runtime         | Verified     | Server output shows CAP runtime 9.9.1                      | Serve RequestService locally                     |
| SQLite                          | Verified     | `@cap-js/sqlite` dependency; `:memory:` database confirmed | Local development persistence                    |
| Git                             | Verified     | Local repository and remote `origin/main` are synchronized | Version control                                  |
| GitHub repository               | Verified     | Commits successfully pushed to `origin/main`               | Portfolio repository and release history         |
| Browser                         | Verified     | OData endpoints and metadata verified locally              | API validation                                   |
| Postman                         | Not verified | Access not checked yet                                     | Future API testing                               |
| SAP Business Application Studio | Not verified | Access not checked yet                                     | Possible future SAP BTP development environment  |
| SAP BTP Cockpit                 | Not verified | Access not checked yet                                     | Future Cloud Foundry and service configuration   |
| Cloud Foundry CLI               | Not verified | Access not checked yet                                     | Future deployment work                           |
| SAP HANA Cloud                  | Not verified | Access not checked yet                                     | Future production-like persistence               |
| Jenkins                         | Not verified | Access not checked yet                                     | Future CI/CD pipeline execution                  |
