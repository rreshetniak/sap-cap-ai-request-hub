# Request Hub Authorization Model

## Purpose

This document describes the local authorization model for the Request Hub CAP application.

The current goal is to define local development users and roles that will be used for security testing.

This configuration is only for local development and automated tests. It is not the productive BTP identity provider configuration.

## Authentication and Authorization

Authentication answers:

```text
Who is the current user?
```

Authorization answers:

```text
What is the current user allowed to do?
```

In this project, local mock users are used to simulate authenticated users during development and automated API testing.

## Local Mock Users

The project defines three local mock users in `package.json`.

| User | Password | Role |
|---|---|---|
| `requester` | `requester` | `Requester` |
| `processor` | `processor` | `Processor` |
| `admin` | `admin` | `Admin` |

These credentials are only valid for local development.

They must not be used as productive credentials.

## Roles

### Requester

Represents a business user who works with own requests.

### Processor

Represents a backoffice user who processes submitted requests.

### Admin

Represents an administrative user for the MVP.

## Current Implementation Status

The project currently defines mock users and roles only.

No service-level authorization rules are active yet.

No action-level authorization rules are active yet.

No instance-level authorization rules are active yet.

Current API tests still run without role-based restrictions.

## Test Evidence

The current API test suite passes with the local mock user configuration in place:

```text
tests 6
pass 6
fail 0
```