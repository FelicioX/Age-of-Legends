# Cross-Package Tests

Test suites that span multiple packages or exercise the running system. Unit tests live next to the
code they cover inside each package; this directory holds the higher-level suites.

| Path           | Purpose                                                     |
| -------------- | ----------------------------------------------------------- |
| `unit/`        | Shared cross-cutting unit helpers and fixtures              |
| `integration/` | Multi-package integration tests                             |
| `load/`        | Load tests validating capacity targets                     |
| `e2e/`         | End-to-end tests through the real client/server             |

See [../docs/standards/Testing.md](../docs/standards/Testing.md) for the testing philosophy and
conventions.
