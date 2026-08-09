# Day 52 — Executable CI Definition

## Goal
Provide executable CI evidence rather than only a static pipeline description.

## Implementation
The repository uses GitHub Actions in `.github/workflows/ci.yaml`.

The workflow executes on push, pull request and manual dispatch.

## Implemented CI Stages
- repository checkout
- Node.js setup
- dependency installation
- automated test execution
- MBT installation
- MTAR build
- MTAR verification
- artifact upload

## Evidence
The workflow has completed successfully on GitHub-hosted Ubuntu runners. The automated test suite executes as part of CI and the MTAR is published as a workflow artifact.

## Result
The GitHub Actions workflow is the executable CI definition for the portfolio project. A Jenkinsfile is not required for this environment because Jenkins is not used in this learning track.
