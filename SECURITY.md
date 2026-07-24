# Security Policy

## Supported Versions

The project is in active pre-release development. Security fixes are applied to the `main` branch.

## Reporting a Vulnerability

**Do not open a public issue for security vulnerabilities.**

Report suspected vulnerabilities privately to the maintainers via GitHub's private security
advisory feature on the repository. Please include:

- A description of the vulnerability and its impact
- Steps to reproduce or a proof of concept
- Affected components or endpoints
- Any suggested remediation

You can expect an acknowledgement within a reasonable timeframe and status updates as the issue is
triaged and resolved. Please allow time for a fix to be prepared and released before any public
disclosure.

## Scope

The following are in scope for reports:

- The authoritative server (gateway, API, world simulation)
- Authentication and session handling
- The network protocol and validation layer
- The persistence and caching layers

## Security Practices

- Server-authoritative design: clients cannot mutate game state directly.
- All protocol messages are validated at the boundary before processing.
- Secrets are provided via environment variables and never committed.
- Dependencies are monitored for known vulnerabilities in CI.

See [docs/architecture/Security.md](docs/architecture/Security.md) for the full security model.
