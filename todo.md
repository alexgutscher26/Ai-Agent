# FlowPilot Web Plan: Landing, Pricing, and Dashboard

## Goals
- Build a conversion-focused marketing site (landing + pricing) that clearly communicates FlowPilot’s value and drives install and signups
- Ship a secure, scalable dashboard for account management, billing, usage, and extension settings integration
- Align product surfaces and metrics so the VS Code extension, backend APIs, and dashboard form a coherent experience
- Production dashboard URL: https://dashboard.flowpilot.dev

## Environments and URLs
- Production
  - Dashboard: https://dashboard.flowpilot.dev
  - API base: https://api.codecoach.dev
- Staging
  - Dashboard: https://staging.dashboard.flowpilot.dev
  - API base: https://staging.api.codecoach.dev
- Preview/Dev
  - Ephemeral preview URLs per branch for QA

## High-Level Architecture
- Frontend app
  - SSR framework recommended (Next.js or similar) for SEO on landing/pricing
  - Component library and design system (accessible, responsive, dark mode)
- Backend app (if not fully serverless)
  - Auth service (OAuth provider or hosted auth)
  - API for dashboard data (keys, usage, telemetry queries, receipts)
  - Billing integration service (Stripe)
  - Persistence: Postgres (users, orgs, subscriptions, usage, keys), object storage (logs/export), cache (Redis)
- Telemetry/analytics
  - Client analytics: privacy-aware (Plausible/GA4)
  - Server metrics: Prometheus/Grafana or vendor (Datadog/New Relic)
- CI/CD and infra
  - Build pipeline per app
  - IaC for DNS, TLS, WAF, and secrets; automated deploys

## Data Model (Initial)
- users(id, email, name, role, created_at)
- organizations(id, name, owner_user_id, created_at)
- memberships(id, org_id, user_id, role, created_at)
- api_keys(id, org_id, user_id, key_hash, created_at, revoked_at, scopes)
- subscriptions(id, org_id, plan_id, status, current_period_end, trial_end)
- plans(id, name, price_monthly, price_yearly, features_json)
- usage_events(id, user_id or org_id, type, payload_json, created_at)
- explanations(id, user_id, language, summary, created_at)
- reviews(id, user_id, summary, created_at)
- errors(id, user_id, error_type, how_to_fix, created_at)
- feedback(id, user_id, helpful, comment, created_at)

## Landing Page (Marketing)
- Hero
  - Clear value prop and visual of the VS Code panel
  - Primary CTA: “Install in VS Code” and “Start free” (dashboard)
- Social proof
  - Logos, testimonials, star ratings, quotes from learners/mentors
- Feature sections
  - Explain, Review, Error Analysis; reflection prompts; beginner/intermediate modes
  - Short gifs or videos; performance and safety claims
- How it works
  - 3-4 steps from selection to explanation; privacy-first messaging
- Pricing teaser and CTA
- Developer/Student personas
  - Tailored messaging blocks with relevant benefits
- SEO & Performance
  - Semantic markup, meta tags, OG/Twitter cards, sitemap, robots.txt
  - Lighthouse 90+ targets for performance/accessibility
- Analytics & A/B
  - Track CTA conversions, scroll depth, outbound to VS Code marketplace
- Accessibility
  - WCAG AA, keyboard navigation, color contrast

## Pricing Page
- Plan cards
  - Free, Pro, Team (example), monthly/yearly toggle
  - Feature matrix (usage limits, priority support, history length, org features)
- Billing integration
  - Stripe checkout links or embedded UI; tax, currency, invoice emails
  - Promo code/coupons support; trials; proration; refunds requests
- FAQs and guarantees
  - Privacy, student discounts, cancellation policy
- Legal
  - Terms, Privacy, Data Processing Addendum, Security page links
- Conversion tracking
  - Funnel metrics, attribution for installs vs. paid

## Dashboard (https://dashboard.flowpilot.dev)
- Auth & Accounts
  - Sign-in (OAuth/email), passwordless optional, 2FA
  - Profile: name, email, user level (beginner/intermediate)
  - Organization management: create orgs, invite members, roles (owner/admin/member)
- API Keys
  - Create/rotate/revoke keys; scope controls (read/usage/write)
  - Copy-safe UI with warnings; IP restrictions optional
  - Key usage and last-seen metadata
- Settings (VS Code alignment)
  - Explanation depth default (short/normal/detailed)
  - Proactive suggestions toggle
  - Reflection prompts toggle
  - Language preferences and telemetry opt-in/out
- Usage & History
  - Overview charts: calls/day, success rate, latency, most-used features
  - History list with filters: explanations/reviews/errors; export CSV/JSON
  - Feedback analytics: helpful rates, concept clicks
- Billing
  - Current plan, usage limits, overage handling
  - Manage payment method, invoices, download receipts
  - Self-serve upgrades/downgrades; team seat management
- Integrations
  - VS Code extension onboarding and deep links
  - Webhooks for events (explanation_created, review_created, limit_reached)
  - Zapier/IFTTT roadmap
- Support & Docs
  - Guided onboarding checklist, docs links, status page, contact
  - Feature request and bug report flow
- Admin (internal)
  - User lookup, usage caps override, ban/revoke keys, audit logs

## Extension ↔ Dashboard Integration
- Provide “Open Dashboard” links in the VS Code panel (already supports external URLs)
- Surface user-level settings in dashboard and mirror to extension via API
- API key flow
  - New users get a default key; extension’s settings read it
  - Rotation updates extension config with minimal friction (copy/paste or login flow)
- Telemetry and history
  - Dashboard queries usage_events for personal analytics
  - Opt-out respected across extension and dashboard

## MVP Milestones
1) Foundations
- Reserve domains, DNS records, TLS certs (prod/staging)
- Repo setup, CI/CD pipeline, environment secrets
- Base Next.js app (or chosen SSR framework), Tailwind/Design system

2) Auth & Accounts
- OAuth provider integration, session management
- User and org tables; role-based access control (RBAC)
- Profile page and basic settings

3) Pricing & Billing
- Stripe products/plans and checkout integration
- Pricing UI with monthly/yearly toggle and feature matrix
- Webhook handling for subscription lifecycle (invoice.paid, customer.subscription.updated)

4) API Keys & Settings
- CRUD for keys with scope and revoke
- Settings page aligned to extension configuration
- Copy-to-clipboard UX with tooltip and warnings

5) Usage Overview & History
- Overview charts (daily calls, failure rate)
- History list with filters and pagination
- Export function (CSV/JSON)

6) Docs & Support
- Onboarding checklist page
- Docs links to install extension and configure settings
- Contact/support links and status page

7) Launch Hardening
- Accessibility pass and Lighthouse audits
- Security review (CSP, CSRF, rate limiting, IP allowlists for admin)
- Observability: logs, traces, metrics, alerting

## Non-Functional Requirements
- Security: CSP, CSRF, XSS, secure cookies, key hashing, audit logs
- Privacy: Telemetry opt-in, data retention policy, export/delete account
- Performance: SSR caching, CDN, API response SLAs
- Accessibility: Keyboard navigation, aria-labels, contrast, focus states
- Reliability: SLOs, rate limits and graceful fallback, circuit breakers
- Observability: Structured logs, error tracking, tracing, dashboards

## API Endpoints (Dashboard Services)
- Auth
  - POST /auth/login, POST /auth/logout, GET /auth/me
- Keys
  - GET /keys, POST /keys, DELETE /keys/:id, POST /keys/:id/revoke
- Settings
  - GET /settings, PUT /settings
- Usage & History
  - GET /usage/summary?range=30d
  - GET /history?type=explain|review|error&from=..&to=..
- Billing
  - GET /billing/portal, POST /billing/checkout
- Webhooks (Stripe)
  - POST /webhooks/stripe

## Design System and UX
- Components
  - Cards, tables with pagination, forms with validation, charts, modals
  - Accessible buttons/links with focus rings and semantic labels
- Theming
  - Dark/light modes consistent with VS Code feel
- Content
  - Marketing copy tuned for beginners/intermediates and educators

## KPIs and Analytics
- Landing conversion rate to install and signup
- Pricing page checkout conversion rate
- Dashboard engagement (settings changes, key provisioning)
- Extension retention and helpful feedback rates
- Support ticket volume and resolution time

## Engineering Tasks (Detailed)
- Project scaffolding and CI/CD
- Auth integration and protected routes
- Stripe product/price setup, webhooks, receipts
- API key issuance, hashing, revocation, audit trail
- Settings storage and mapping to extension config options
- Usage ingestion and summary aggregation
- History views with filtering and export
- Admin tools: user/org lookup, ban/revoke, audit logs
- Monitoring: error tracking, metrics dashboards, alerts
- Docs: onboarding, extension install, API usage

## Risks and Mitigations
- Key leakage risk: never expose raw keys server-side; only show once on create
- Billing disputes: clear policies and responsive support
- Performance regressions: pre-launch load tests and caching
- Compliance/privacy: document data flows; opt-in telemetry respected everywhere

## Launch Checklist
- Final content edits and QA across devices
- SEO audit and social cards
- Billing live test with real payment in sandbox, then production
- Incident response playbook and on-call rotation
- Announce and collect feedback

