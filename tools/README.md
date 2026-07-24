# Tools

Developer and content tooling for Age of Legends: generators, validators, importers/exporters and
pipeline utilities. Tools are workspace packages under `tools/*` and support the data-driven content
model (heroes, buildings, items, events authored as data).

| Path          | Purpose                                      |
| ------------- | -------------------------------------------- |
| `generators/` | Scaffolding and content generation utilities |
| `validators/` | Content and configuration validation         |

Tools depend on `@aol/shared` (and `@aol/game` where content-aware) and never on `client`/`server`.
