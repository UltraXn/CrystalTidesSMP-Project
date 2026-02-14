---
name: senior-architecture
description: Enterprise architecture design using C4 models, Architecture Decision Records (ADRs), scalability analysis, and clean modularity patterns for distributed systems.
---

# Senior Architecture

## Overview

This skill guides architectural design for complex, distributed systems using industry-standard documentation approaches. Use this skill when designing systems for scale, documenting architectural decisions, or ensuring long-term maintainability.

## C4 Model - System Visualization
**Objective**: Create progressively detailed architectural views.
- **Level 1: Context**: System boundary and external dependencies.
- **Level 2: Container**: Major deployable units (services, apps, DBs).
- **Level 3: Component**: Internal structure of containers.
- **Level 4: Code**: Detailed implementation relationships.

## Architecture Decision Records (ADRs)
**Objective**: Document significant decisions, rationale, and consequences.
### ADR Structure
- **Status**: Proposed, Accepted, Deprecated.
- **Context**: Problem statement and constraints.
- **Decision**: Chosen approach.
- **Rationale**: Why this choice over alternatives.
- **Consequences**: Benefits and costs.

## Scalability Architecture Patterns
- **Horizontal Scaling**: Adding instances for stateless services.
- **Vertical Scaling**: Increasing resources for stateful services.
- **Asynchronous Processing**: Decoupling workflows via message queues.
- **Caching**: Multi-layer strategies (Client, CDN, App, DB).

## Clean Modularity Patterns
- **Modular Boundaries**: High cohesion and low coupling.
- **Dependency Inversion**: Depend on abstractions, not implementations.
- **Layered Architecture**: Presentation, Application, Domain, Infrastructure.
