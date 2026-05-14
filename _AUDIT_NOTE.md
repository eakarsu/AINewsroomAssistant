# Audit Apply Note — AINewsroomAssistant

Source: `_AUDIT/reports/batch_05.md` section 36.

## Original Recommendations
### Missing AI counterparts
- `/story-competitive-analysis`
- `/source-matching`
- `/embargo-management`
- `/correction-suggestion`

### Missing non-AI
- Publishing/CMS, comment moderation, reader analytics, paywall/subscription, ad integration, social distribution, accessibility (captions/alt-text), archive/search

### Custom suggestions
- Agentic editorial director; real-time bias & misinformation detection; autonomous fact-checking; streaming source credibility; multi-format generation; reader engagement orchestration

## Implemented
Added three endpoints in `backend/src/routes/ai.js`:
- `POST /api/ai/story-competitive-analysis`
- `POST /api/ai/source-matching`
- `POST /api/ai/correction-suggestion`

Reused `callOpenRouter`, `persistToAnalyses`, `auth`, `aiRateLimiter`.

## Backlog
| Item | Tag |
|---|---|
| `/embargo-management` | MECHANICAL |
| Publishing/CMS integration | NEEDS-CREDS |
| Comment moderation | NEEDS-PRODUCT-DECISION |
| Paywall/subscription | NEEDS-CREDS |
| Ad integration | NEEDS-CREDS |
| Social distribution automation | NEEDS-CREDS |
| Accessibility compliance (captions/alt-text) | MECHANICAL |
| Archive/search | NEEDS-PRODUCT-DECISION |

## Apply pass 3 (frontend)

LEFT-AS-IS. `frontend/src/services/api.js` already exports `ai.storyCompetitiveAnalysis`,
`ai.sourceMatching`, and `ai.correctionSuggestion` (the three endpoints added in
pass 2), and `frontend/src/pages/AIInsights.jsx` invokes all three with proper
`Authorization: Bearer <token>` from `localStorage`. The `AITools.jsx` page covers
the headline / angles / readability / credibility tools. FE already wired.

## Apply pass 4 (mechanical backlog)

Two MECHANICAL backlog items implemented end-to-end (BE + FE).

Backend (`backend/src/routes/ai.js`, appended; reuses `callOpenRouter`, `persistToAnalyses`, `auth`, `aiRateLimiter` already applied at router level):

- `POST /api/ai/embargo-management` — `{ story_title, embargo_until, jurisdictions[], distribution_partners[], sensitivity, id? }` returns multi-timezone release schedule, partner notifications, leak risk, mitigations, briefing order, post-embargo follow-ups, compliance notes.
- `POST /api/ai/accessibility-altcaption` — `{ media_kind, media_description, headline, caption_lang, audience, id? }` returns short alt text, long description, decorative flag, caption variants, WCAG checks, sensitive-content flags, transcript / audio-description recommendations.

Both follow existing `success:false`-on-no-key contract from `services/openrouter.js` (the project's chosen "503-equivalent" pattern; matches every other AI endpoint in this codebase). Persisted to `ai_analyses` for audit history.

Frontend (`frontend/src/pages/AIInsights.jsx` extended; `frontend/src/services/api.js` exports added):

- Two new tabs in `AIInsights` ("Embargo Management" and "Alt Text & Captions") with form inputs and the existing run / result display + error handling. JWT bearer is already applied in `services/api.js#getHeaders` from `localStorage.token`.

Smoke test: PostgreSQL 5432 connected; backend started on port 3802 with the existing placeholder `OPENROUTER_API_KEY=your_openrouter_api_key_here`; logged in as `editor@newsroom.com`; both new endpoints returned `200 {"success":false,"error":"OpenRouter API key not configured..."}` — matches every other AI route's behaviour without a real key. Backend stopped, port freed.

Syntax-checked via `node --check` (BE) and `@babel/parser` (FE) — PASS.

No new dependencies, no `npm install`, no changes to existing routes.

## Apply pass 4 — remaining backlog

| Item | Tag | Reason for skip |
|---|---|---|
| Publishing/CMS integration | NEEDS-CREDS | External CMS API |
| Comment moderation | NEEDS-PRODUCT-DECISION | Policy + workflow definition |
| Paywall / subscription | NEEDS-CREDS | Stripe / payment provider |
| Ad integration | NEEDS-CREDS | Ad-server creds |
| Social distribution automation | NEEDS-CREDS | Per-platform OAuth |
| Archive / search | NEEDS-PRODUCT-DECISION | Index / retention design |

## Apply pass 5 (all backlog)

6 backlog clusters implemented (= 10 endpoints, cap respected).

New file (no edits to existing routes): `backend/src/routes/integrations.js`
- `POST /api/integrations/cms/publish` (NEEDS-CREDS) — 503+missing:CMS_API_KEY.
- `POST /api/integrations/paywall/subscribe`, `GET /api/integrations/paywall/status` (NEEDS-CREDS) — 503+missing:STRIPE_API_KEY.
- `GET /api/integrations/ads/slot` (NEEDS-CREDS) — 503+missing:AD_SERVER_KEY.
- `POST /api/integrations/social/distribute` (NEEDS-CREDS) — 503 with comma-joined list of missing per-platform tokens (SOCIAL_TWITTER_TOKEN / SOCIAL_LINKEDIN_TOKEN / SOCIAL_FACEBOOK_TOKEN).
- `POST /api/integrations/comments`, `POST /api/integrations/comments/:id/flag`, `GET /api/integrations/comments/queue` (NEEDS-PRODUCT-DECISION) — toxicity policy: >=0.85 hidden, >=0.6 review; flag count >=3 -> review. Tables `comments`, `comment_flags` (CREATE TABLE IF NOT EXISTS).
- `GET /api/integrations/archive/search` (NEEDS-PRODUCT-DECISION) — full-text ILIKE on `article_drafts.title` UNION `story_leads.title`, optional `?since=<ISO>`.

`backend/src/server.js`: one `app.use('/api/integrations', ...)` registration; no other changes.

Smoke test (port 14803): logged in `editor@newsroom.com`; cms/publish, paywall/subscribe, ads/slot, social/distribute all 503 with correct `missing` field; comment with toxicity 0.92 -> 200 status `hidden`; archive search for "climate" returned 2 rows from existing `article_drafts` + `story_leads`. Backend stopped.

Syntax check: `node --check` PASS for new module + server.js.

No new dependencies, no `npm install`.
