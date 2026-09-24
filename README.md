# OmniTest

> **One platform. Every test.**

OmniTest is a unified, developer-first testing orchestration SaaS platform for modern web applications. Instead of managing a fractured sprawl of isolated testing tools—Cypress for UI, axe for accessibility, Lighthouse for performance, Postman for API checks, and custom CI scripts for visual regression—OmniTest orchestrates proven, world-class open-source engines under a single unified dashboard, API, and CLI.

---

## Documentation Index

The OmniTest product and technical architecture is thoroughly documented across the following source-of-truth documents:

| Document | Description |
| :--- | :--- |
| [**PRD.md**](./PRD.md) | **Product Requirements Document**: Vision, problem statement, personas, use cases, positioning, competitive matrix, and MVP vs. future scope. |
| [**ARCHITECTURE.md**](./ARCHITECTURE.md) | **Technical Architecture**: System design, TypeScript monorepo layout, worker execution layer, queue system, artifact storage, and service boundaries. |
| [**ROADMAP.md**](./ROADMAP.md) | **Phased Development Plan**: Rigorous breakdown of Phases 0 through 11 with deliverables, scopes, dependencies, and acceptance criteria. |
| [**API.md**](./API.md) | **REST API Reference**: Full endpoint specifications, auth policies, request schemas, and response contracts. |
| [**SECURITY.md**](./SECURITY.md) | **Security Architecture**: Multi-tenant isolation, sandbox container security, secret encryption, signed URLs, rate limiting, and retention. |
| [**docs/user-journeys.md**](./docs/user-journeys.md) | **Core User Journeys**: Step-by-step UX flows, state transitions, and edge cases for the 8 primary user journeys. |
| [**docs/testing-engines.md**](./docs/testing-engines.md) | **Testing Capabilities & Engine Adapters**: Orchestration design for UI, API, Accessibility, Performance, SEO, Security, and AI analysis. |
| [**docs/database-schema.md**](./docs/database-schema.md) | **Data Model & Schema**: Entity-relationship diagrams, PostgreSQL table definitions, constraints, indexes, and state machines. |

---

## Core Product Positioning

- **Unified Surface**: A single configuration file (`omnitest.config.ts`), a single dashboard, a single report, and a single GitHub commit status check.
- **Orchestration, Not Reinvention**: Powered by industry-standard open-source engines (Playwright, axe-core, Lighthouse, OWASP ZAP) abstracted behind pluggable adapters.
- **Developer-Centric**: Built for modern CI/CD pipelines, git workflows, and local CLI execution with deterministic artifact capture (video, traces, network HARs, console logs).
- **Extensible Architecture**: Clean decoupling between UI, API, queue orchestrator, worker sandboxes, and database.

---

## High-Level Architecture Overview

```
                               ┌────────────────────────────────────────────────────────┐
                               │                    OmniTest Platform                   │
                               └────────────────────────────────────────────────────────┘
                                                            │
                 ┌──────────────────────────────────────────┼────────────────────────────────────────┐
                 ▼                                          ▼                                        ▼
   ┌───────────────────────────┐              ┌───────────────────────────┐            ┌───────────────────────────┐
   │     Web Application       │              │       Public REST API     │            │    CLI / GitHub Action    │
   │ Next.js (App Router) + UI │              │ Fastify / Node.js + TS    │            │ Node.js CLI (@omnitest/cli)│
   └─────────────┬─────────────┘              └─────────────┬─────────────┘            └─────────────┬─────────────┘
                 │                                          │                                        │
                 └────────────────────┬─────────────────────┴────────────────────────────────────────┘
                                      ▼
                        ┌───────────────────────────┐
                        │    PostgreSQL Database    │
                        │ Multi-Tenant Org & State  │
                        └─────────────┬─────────────┘
                                      │
                                      ▼
                        ┌───────────────────────────┐
                        │  Redis + BullMQ Job Queue │
                        │  Test Run Task Dispatcher │
                        └─────────────┬─────────────┘
                                      │
                 ┌────────────────────┴─────────────────────┐
                 ▼                                          ▼
   ┌───────────────────────────┐              ┌───────────────────────────┐
   │   Playwright Worker Pod   │              │   Synthetic Check Worker  │
   │ Chromium, WebKit, Firefox │              │  Lighthouse, axe-core, API│
   └─────────────┬─────────────┘              └─────────────┬─────────────┘
                 │                                          │
                 └────────────────────┬─────────────────────┘
                                      ▼
                        ┌───────────────────────────┐
                        │   S3-Compatible Storage   │
                        │ Video, Traces, Screenshots│
                        └───────────────────────────┘
```

---

## Engineering Rules & Development Workflow

1. **Strict Phased Delivery**: Development is partitioned into sequential phases (Phase 0 through Phase 11). No future-phase feature is implemented early.
2. **TypeScript Everywhere**: Full end-to-end type safety spanning contracts, API schemas (Zod), ORM models, and frontend client code.
3. **No Monolithic Sprawl**: Clean architectural separation across apps, services, packages, and runner worker processes.
4. **Authentic Implementations**: No mock "smoke and mirrors" or fake UI states that mimic execution without running actual workloads.
5. **Zero Secret Leakage**: Strict credential encryption at rest (AES-256-GCM) with client-safe public token scoping.
