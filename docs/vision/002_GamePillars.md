# Game Pillars

The pillars are the values every design and engineering decision must serve. When a trade-off
arises, the pillars decide.

## 1. Gameplay First

Every mechanic must be fun before it is complex. Systems earn their complexity by improving the
moment-to-moment experience. If a feature is not fun, it is cut or redesigned.

## 2. Clean Architecture

Every system is modular, decoupled, tested and documented. The codebase is a platform intended to
be extended safely for years. Maintainability is a feature.

## 3. A Living, Persistent World

The world never feels static. Resources regenerate, NPCs pursue goals, events unfold and the
economy breathes — whether or not any individual player is online.

## 4. Scalability

Every decision assumes a large concurrent population. The server is authoritative, sharded and
horizontally scalable from day one.

## 5. Social Experience

Cooperation and competition are first-class. Guilds, trade, shared events and world bosses give
players reasons to depend on and challenge one another.

## 6. Intelligent NPCs

NPCs exhibit believable, reactive behavior via decision trees, utility scoring and goal-oriented
planning. The world feels inhabited, not scripted.

## 7. Long Service Life

The project is designed for continuous expansion. Content, balance and features can be added
without destabilizing existing systems.

## Applying the Pillars

Each proposal is reviewed against every pillar. A feature that strengthens one pillar at the
unacceptable expense of another is reworked until it is consistent with all seven, or it is
rejected. This review is part of the [development process](../standards/CodeReview.md).
