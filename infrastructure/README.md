# Infrastructure

Container images, orchestration and observability for Age of Legends.

## Layout

| Path           | Purpose                                             |
| -------------- | --------------------------------------------------- |
| `docker/`      | Dockerfiles for services (e.g. the server)          |
| `monitoring/`  | Metrics, dashboards and alerting configuration      |

Local development uses the root [`docker-compose.yml`](../docker-compose.yml) to run PostgreSQL and
Redis. Production orchestration and scaling policies are documented alongside deployment as the
platform matures. See [../docs/architecture/Scalability.md](../docs/architecture/Scalability.md).
