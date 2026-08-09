# Day 51 — CI/CD Pipeline Design

## Goal
Define a repeatable delivery flow with clear quality gates, artifact handling, deployment sequencing and smoke testing.

## Pipeline
```text
Git push / Pull Request
        |
        v
   Install and test
        |
        v
   Build MTA archive
        |
        v
   Upload MTAR artifact
        |
        +----------------------+
        |                      |
        | push / PR            | workflow_dispatch
        v                      v
      STOP               Deploy to BTP Trial
                                |
                                v
                        Download same MTAR
                                |
                                v
                         Install CF CLI
                                |
                                v
                       Install MultiApps
                                |
                                v
                     GitHub OIDC -> IAS
                                |
                                v
                     Cloud Foundry login
                                |
                                v
                          cf deploy
                                |
                                v
                         HTTP smoke test
```

## Trigger Strategy
### Push to `main`
Runs install, automated tests, MTA build and artifact upload. It does not deploy.

### Pull Request to `main`
Runs the same CI quality path and does not deploy.

### Manual `workflow_dispatch`
Runs the complete pipeline including deployment to the protected GitHub Environment `btp-trial-dev`.

## Architecture Decision
CI is automatic. Deployment is intentionally manual because this is a portfolio/training DEV environment and every commit should not automatically change the running BTP application.

## Artifact Strategy
The deployment job consumes the MTAR produced by the package job. It does not rebuild the application independently.
