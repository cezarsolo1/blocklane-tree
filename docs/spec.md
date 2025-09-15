# **1\) Tenant Maintenance Intake v1 — Engineering Specification (Draft)**

**Last updated:** 30 Aug 2025 • **Owner:** Friso • **Audience:** Software engineer(s) building the tenant intake wizard & API

## **Vision & Non-Goals (v1)**

**Vision.** A best-in-class, ENGLISH-ONLY, privacy-safe standardized intake where tenants can file unplanned maintenance tickets in ≤ 2 minutes, with strong triage to prevent unnecessary tickets, and with all details captured once so PMs/contractors can act quickly. Future-proof so we can route into any PM stack.

**Primary goals (v1).**  
 Tenant speed: Median time-to-submit ≤ 3:00.  
 Ticket quality: Photo attachment rate ≥ 70% (make required by case, not global).  
 Reliability: Production error rate \< 0.5%.  
 UX: Tenant CSAT ≥ 7.0 within 1 month of launch.

**Non-Goals (v1).** Manager portal, contractor dispatching, billing, SLA tracking. Save read-only PM/vendor views FOR LATER.

---

## **System Overview**

### **1.1 High-level flow**

Login \-\> Address check (no ticket) → 1\. Wizard triage → (reach leaf) → 2\. Start Ticket (only for start\_ticket leaves) → 3\. Describe & Media → 4\. Submit → 5\. Webhook to PM/Make.com.

**Commitment line:** Ticket draft is created only when a start\_ticket leaf is confirmed (after Step 1 → Step 2). Address edits and wizard exploration do not create drafts.

### **1.2 Modules to keep modular**

First page is login/register/forgot password page. If the user registers with their email and password AND the email is already present in one of our Supabase tables (create mock data for these users first), they get a “Confirm registration” email to the email that they filled in.

DecisionTree Engine (pure): loads JSON, traverses nodes, enforces rules (e.g., “My option is missing”).

Wizard UI Renderer: tile/list/search screens; stateless where possible; consumes engine outputs.  
 **DecisionTree Engine and Wizard UI are decoupled. Any valid tree JSON (schema §2.3) can be plugged in without code changes.**

Lookup/Search: fuzzy ranked search across node titles and aliases (separate dictionary). Returns capped, ranked results. **(SAVE FOR LATER)**

Validation Service: field-level validators (phone, email, photos) with localized error strings.

Media Service: accepts files, type/size checks, converts HEIC → WEBP, stores in private bucket, returns signed URLs.

Ticket Service: create/update/finalize drafts; append ticket events; RLS via Edge Functions.

i18n: EN, ICU-message formats, date/number formatting.

Telemetry: client \+ server events; metrics derived (time-to-submit, drop-offs, validation failures).

Integration: Property manager platform (save for later)

### **1.3 State machine (wizard)**

States: address\_check → wizard\_node:{id} → leaf\_reached → if start\_ticket → ticket\_details → review → submitted.  
 Transitions only via engine; Back/Forward uses history stack; Back unselects current choice cleanly (idempotent).

Back always clears the current selection (idempotent). No ‘sticky’ selected tiles when returning to a node.

---

## **Decision Tree Specification**

**Input:** one decision tree JSON (we have to create a mock together for v1) \+ optional alias map (later). No PM integration required for v1

### **2.1 Node types**

**branch:** has children\[\] of nodes.

**video\_check:** plays video; on page: two outcomes → inline resolve. video\_check is not a leaf; it renders one page with two outcomes mapping directly to leaf objects (end\_no\_ticket/video\_resolved or start\_ticket/video\_not\_resolved).

* **yes** → `{ leaf_type: "end_no_ticket", leaf_reason: "video_resolved" }`

* **no** → `{ leaf_type: "start_ticket", leaf_reason: "video_not_resolved" }`

**leaf:** terminal. Does not always create tickets; controlled by leaf\_type.

### **2.2 Enums (orthogonal)**

leaf\_reason is orthogonal to leaf\_type; multiple leaves across the tree may share the same reason.  
 **leaf\_type ∈ { end\_no\_ticket, start\_ticket }** (controls whether a draft ticket is created).

**leaf_reason** (labels orthogonal to type), suggested values:  
 For end_no_ticket: emergency, tenant_responsibility, video_resolved  
 For start_ticket: video_not_resolved, standard_wizard, safety_issue

Multiple leaf nodes may share the same leaf\_reason (e.g., broken\_toilet\_seat and tv\_broken → tenant\_responsibility).

### **2.4 Aliases & Icons (separate config)**

Aliases file maps node\_id → \[aliases...\] (ranked). Example: toilet includes \["toilet", "wc", "lavatory", "loo"\].

Icon map maps icon\_key → icon\_name (e.g., bathroom → "lucide/shower"). **(LEAVE FOR LATER, USE A SINGLE DEFAULT ICON SET FOR NOW)**

### **2.5 “My option is missing” rule**

Show only when the current wizard screen has ≥1 child that is a leaf.  
 Boolean: `show_my_option_missing = any(child.type === 'leaf' for child in current_node.children)`.  
 Placement: separate button below tiles, white style (exactly like in blocklane-tree-main zip file).

### **2.6 Versioning**

Decision trees are immutable per version; active tree is selected by tree\_id \+ version. Tickets store (tree\_id, version, node\_id) for auditability.

### **2.7 Reason-driven post-wizard flows**

After a start\_ticket leaf, the follow-up steps depend on leaf\_reason. Keep this declarative in the tree JSON so we don’t hardcode flows.

### **2.3 JSON schema (draft)**

Take the json decision tree from the existing blocklane-tree-main zip file as inspiration. That one worked but we need to get the leaf\_type and leaf\_reason flow work more appropriately.

**Leaf-level example**

`{`

  `"node_id": "toilet-clog-video",`

  `"type": "video_check",`

  `"title": {"nl": "Verstopt toilet", "en": "Clogged toilet"},`

  `"video_url": "https://youtu.be/xyz",`

  `"outcomes": {`

    `"no": {`

      `"leaf_type": "start_ticket",`

      `"leaf_reason": "video_not_resolved",`

      `"required_fields": ["description"],`

      `"flow": ["describe_media", "contact_questions", "review", "submit"],`

      `"question_groups": ["contact_at_home"]`

    `},`

    `"yes": {"leaf_type": "end_no_ticket", "leaf_reason": "video_resolved"}`

  `}`

`}`

---

## **Frontend UX Spec**

**Welcome → Address check (no ticket).**  
 Prefill address; editable. Saving logs an address\_event only; creates wizard\_session\_id in localStorage.

**Next page:** v1: show only this tenant’s open draft/submitted tickets for the current address. Building-wide or portfolio-wide notices are save-for-later. Page includes Create ticket and Check status buttons.

**Wizard (Step 1).**  
 Tiles \+ Search/Lookup with aliases; Back unselects; history stack; video node is single page with two outcomes (buttons Yes and No).

Reaching a leaf\_type \= start\_ticket and clicking Volgende moves across the commitment line and creates a draft.

**Start Ticket (Step 2): Describe & Media.**  
 Always first after a start\_ticket leaf.

Re-use your existing photo upload implementation (in blocklane-tree-main zip file); enhancements:

* Drag & drop \+ paste-from-clipboard; client-side image orientation fix; retry failed uploads; re-order thumbnails; upload progress per file.

* Enforce whitelist (JPG/PNG/WEBP/HEIC), ≤10MB each, ≤8 files; convert HEIC→WEBP server-side; strip EXIF.

* Show grey “No photos attached” until at least one is present (when required by leaf).

**Step 3: Contact & Other Questions.**  
 Dynamic question\_groups driven by leaf\_reason / question\_groups (see §2.7 & §3.4). Questions like entry permission (already present in blocklane-tree-main zip file but need to be translated from Dutch to English)  
 Phone field uses lazy acceptance \+ normalization to E.164 (see §3.2).

**Step 4: Review**  
 Summarize description, photos, and answers  
 The address confirmation was already handled at Welcome.

**Step 5: Submit.**  
 Finalize draft → submitted; **dispatch webhook to PM/Make synchronously with one immediate retry; failures are logged.**

### **3.2 Validation & error copy**

**Phone (Stap 3 example):**  
 Accept: E.164 (+316...), NL local 0XXXXXXXXX (10 digits), or formatted with spaces/dashes. Use libphonenumber rules. If phone\_raw fails validation, the ‘Next’ button remains disabled AND an inline error explains exactly why (examples in §3.2). Never fail silently.

Normalize to E.164 on server; store both raw\_input and e164.

**Error UX:** inline, below field, in red, never blocks without why.

**Messages (NL):**  
 “Voer een geldig telefoonnummer in. Voor NL: 10 cijfers, of begin met \+31.”  
 “We herkennen dit nummer niet. Probeer 06-… of \+31 6 …”

**Messages (EN)** equivalents.

Lazy inputs accepted if convertible; otherwise block with reason.

**Generic rules**  
 All required fields show real-time validation.  
 On submit, scroll to first error.  
 File validation shows why (type/size/too many files/required field not filled in).

### **3.3 Accessibility & i18n**

Labels associated to inputs; focus states; keyboard navigation; ARIA for dynamic content. **(SAVE FOR LATER)**  
 ICU messages; language toggle **(SAVE FOR LATER)**; remember preference per session.

### **3.4 Contact & Other Questions (spec)**

Question groups (rendered in Step 3 when present in question\_groups):  
 These options and settings are all already present in blocklane-tree-main zip file but need to be translated from Dutch to English, and attached to the appropriate leaf\_node and leaf\_reason cases.

---

## **Data Model (Supabase/Postgres)**

Principle: Browser never writes directly. All writes via Edge Functions with service role. RLS on tables can be USING false (deny all), with specific policies for read-only lists where needed.

**Every table and column MUST have a COMMENT** explaining purpose, units, allowed values, and links to copy keys (where relevant). PRs without comments are rejected.

### **4.1 Enums**

`create type leaf_type as enum ('end_no_ticket','start_ticket');`

`create type ticket_status as enum ('draft','submitted','cancelled');`

`create type leaf_reason as enum (`

  `'emergency','tenant_responsibility','video_resolved','option_missing'`

  `'video_not_resolved','standard_wizard','safety_issue'`

`);`

`create type media_kind as enum ('image','video');`

`create type lang_code as enum ('nl','en');`

### **4.3 RLS & write rules**

All tables: RLS \= ON and USING false for direct client. Browser has no insert/update/delete rights.  
 Read policies: allow tenant to read their own tickets (status, summary) after auth; vendor token enables read of one ticket.  
 Writes: Only via Edge Functions (service role). Functions enforce field validation and normalization (e.g., phone → E.164).

---

## **Edge Functions / API Contracts**

All responses JSON with `{ ok, data?, error? }`.

**log\_address\_event (POST)**  
 In: `{ wizard_session_id, address:{...}, profile_hint?:{email} }`  
 Out: `{ ok:true, event_id }`

**create\_draft\_ticket (POST)** — called when start\_ticket leaf confirmed  
 In: `{ wizard_session_id, tree:{id,version,node_id,leaf_type,leaf_reason}, address?, contact? }`  
 Out: `{ ok:true, ticket_id }`

**update\_ticket (POST)**  
 In:

`{`

  `"ticket_id": "uuid",`

  `"patch": {`

    `"description": "...",`

    `"phone_raw": "...",`

    `"email": "...",`

    `"contact_name": "...",`

    `"contact_phone_raw": "...",`

    `"entry_permission": true,`

    `"pets_present": false,`

    `"availability": {"type":"slots","slots":[{"day":"2025-09-01","from":"09:00","to":"12:00"}]},`

    `"access_notes": "Lift aanwezig, code 1234#",`

    `"hazard": false,`

    `"hazard_notes": null,`

    `"answers": {"water_shutoff_tried": true}`

  `}`

`}`

Out: `{ ok:true }` (server normalizes \*\_phone\_raw to E.164 where valid; rejects with field-specific errors otherwise)

**sign\_media\_upload (POST)**  
 In: `{ ticket_id, files:[{ name, size, mime }] }`  
 Out: `{ ok:true, uploads:[{ media_id, put_url, storage_path }] }`

**finalize\_ticket (POST)**  
 In: `{ ticket_id }`  
 Out: `{ ok:true }` **(sets status='submitted' and dispatches webhook to PM/Make synchronously with one immediate retry; failures are logged)**

**dispatch\_webhooks (CRON)**/**retry** **(SAVE FOR LATER)**  
 Dequeues webhooks\_outbox with exponential backoff. **(SAVE FOR LATER)**

**search\_nodes (GET)**  
 In: `q, tree_id, version`  
 Out: `ranked nodes [ { node_id, title, path, reason?, leaf_type? } ] (max 8)`  
 **Notes (v1):** substring match on node titles only; case-insensitive. Aliases and fuzzy ranking are save-for-later.  
 **Fields `leaf_type/leaf_reason` MAY be null** if not resolvable from the matched node title in v1.

**vendor\_view (GET) (SAVE FOR LATER)**  
 In: `token`  
 Out: read-only ticket summary \+ photos.

---

## **Validation — v1 minimum (keep), advanced checks later**

**Phone:** libphonenumber; accept NL formats and E.164; store phone\_e164; error copy per §3.2.

**Email:** RFC 5322 pattern; email has to be part of a pre-existing emails table in supabase in order to get a Supabase account confirmation email. If someone tries to register with an email that is not in the system already, an error pops up telling them to send an email to contact@blocklane.nl.

**Photos:** MIME whitelist JPG/PNG/WEBP/HEIC; size ≤ 10MB; count ≤ 8; on HEIC, convert to WEBP server-side; strip EXIF. **Virus scanning \= Save for later.**

**Address:** basic presence \+ postal code pattern (NL: `^[0-9]{4}\s?[A-Za-z]{2}$`).

**Description:** min 10 chars; soft guidance prompts.

**Error surfacing:** real-time; blocking only with explicit cause. Log ticket\_events on repeated validation failures (category \+ count) for UX improvement analytics.

---

## **Telemetry & Success Metrics (leave this FOR LATER)**

**Client events (with wizard\_session\_id):**  
 wizard\_started, node\_viewed, node\_selected, my\_option\_missing\_clicked, leaf\_reached, draft\_created, media\_uploaded, validation\_failed:{field}, review\_opened, submitted.

**Metrics derived:**  
 Median time-to-submit, drop-offs by node, validation failure rate per field, photo attach rate, error rate.

**PII caution:** event payloads exclude free-text; store IDs/enum codes only.

---

## **Data Lifecycle & Retention**

Draft TTL: auto-delete drafts older than 7 days with status='draft' and no media/no description.

Abandoned media: delete unlinked media\_assets \> 24h old.  
 Address events: retain 90 days; then purge.  
 Submitted tickets: archive after 24 months (configurable per PM).  
 Implement with Supabase Scheduled Functions/cron invoking cleanup Edge Function (idempotent). **(SAVE FOR LATER)**

---

## **Security & Privacy**

Client never writes DB rows. All writes via Edge Functions with service role; client JWT has zero write grants.

RLS deny-all by default; narrow read policies for tenant tickets and vendor tokens.

Bucket: private; signed URLs (short-lived) for thumbnails in app.

PII minimization: only email/phone needed; strip EXIF; log reasons/enums, not free-text, in analytics.

Audit: all function calls log to ticket\_events.

---

## **Internationalization**

Content keys for all text, validation messages, buttons; NL & EN catalogs.  
 Date/number formatting via Intl API; RTL not in scope (v1).

---

## **Performance & Resilience (SAVE FOR LATER)**

Lazy-load tree JSON; cache in memory; checksum to avoid refetch. **(SAVE FOR LATER)**

Debounced search requests; cap results to 8\. **(SAVE FOR LATER)**  
 Optimistic UI for media thumbnails.  
 Outbox pattern for webhooks with retries/backoff. **(save for later)**

---

## **Suggested Folder Structure (web \+ functions)**

`apps/web/`

  `src/`

    `modules/`

      `decision-tree/`

      `wizard/`

      `search/`

      `validation/`

      `media/`

      `i18n/`

      `telemetry/`

    `pages/`

      `index.tsx           # address check`

      `wizard.tsx`

      `start-ticket.tsx`

      `review.tsx`

      `status.tsx`

    `styles/`

    `assets/`

`apps/functions/`

  `create_draft_ticket.ts`

  `update_ticket.ts`

  `sign_media_upload.ts`

  `finalize_ticket.ts`

  `log_address_event.ts`

  `search_nodes.ts`

  `dispatch_webhooks.ts`

`infra/`

  `supabase/`

    `schema.sql   # with COMMENT ONs`

    `policies.sql`

    `cron.sql`

---

## **Open Decisions (with recommended defaults)**

Photo required? Default: required for standard\_wizard, optional for video\_not\_resolved and safety\_issue (but strongly prompted).

Draft retention window? Default: 7 days; configurable per environment.  
 Phone requirement? Default: optional; only required for categories needing synchronous contact (leaf hint require\_phone).  
 Lookup ranking? Default: fuzzy match (Fuse.js style) on title \+ aliases, boosted by path depth and popularity; top 8 results. **(SAVE FOR LATER)**  
 Address source of truth? Default: user-entered; PM system enrichment later via webhook response.

---

## **How tickets are actually logged (end-to-end)**

User reaches leaf and clicks Volgende.

If leaf\_type \= end\_no\_ticket → show conclusion screen, no ticket is ever created.  
 If leaf\_type \= start\_ticket → Web calls create\_draft\_ticket with { wizard\_session\_id, tree\_id, version, node\_id, leaf\_type, leaf\_reason } (and optional prefilled contact/address).  
 Server creates row in tickets (status='draft'), writes ticket\_events(draft\_created).  
 User fills Describe & Media → client calls update\_ticket (patch) and sign\_media\_upload per file; uploads to signed URLs; server inserts media\_assets rows.  
 client calls finalize\_ticket.  
 Server sets status='submitted' and dispatches webhook to PM/Make synchronously with one immediate retry; failures are logged.

---

## **Example Ticket Payload to PM**

`{`

  `"ticket_id": "3f4c2b3a-6b9e-4a6b-9e21-8f7b8f6b2f90",`

  `"status": "submitted",`

  `"submitted_at": "2025-08-30T12:34:56Z",`

  `"tenant": { "email": "x@example.com", "phone": "+31612345678" },`

  `"address": {`

    `"line1": "Straat 1",`

    `"postal_code": "1234 AB",`

    `"city": "Amsterdam",`

    `"country": "NL"`

  `},`

  `"triage": {`

    `"tree_id": "f1a2b3c4-d5e6-7890-abcd-ef0123456789",`

    `"version": 3,`

    `"leaf_node_id": "toilet-seat-broken",`

    `"leaf_reason": "standard_wizard"`

  `},`

  `"description": "Toilet seat is broken near the hinge.",`

  `"media": [`

    `{ "kind": "image", "url": "signed:https://…", "mime": "image/webp" }`

  `]`

`}`

---

## **QA Checklist (v1) (SAVE FOR LATER)**

Back button always clears selection; no sticky highlights.

“My option is missing” shows only when ≥1 child is a leaf.  
 Phone field accepts \+31 6 12 34 56 78, 0612345678, \+31612345678; rejects 1234 with reason.  
 HEIC upload converts to WEBP; EXIF stripped.  
 Draft not created until start\_ticket leaf; address edits never create drafts.  
 RLS blocks any client write attempts (verified with tests).  
 Webhook dispatch is synchronous with one immediate retry; on failure, ticket remains submitted and an error is logged.

---

## **Next Steps**

Lock enums & schema; implement Edge Functions skeletons.  
 Build DecisionTree Engine \+ Wizard Renderer with Back/Forward \+ search.  
 Wire validations (phone/email/photos) with localized copy.  
 Implement media pipeline & signed URLs.  
 Add telemetry \+ scheduled cleanup jobs.

---

# **1A) Additions required for security, modularity, and testing (from Cursor checklist)**

**These additions do not remove any scope.** They harden security, enforce ownership, add rate limits & logging, and make the codebase Cursor-friendly.

### **A. Ownership & AuthZ (IDOR-proof)**

* Add `profiles.auth_user_id uuid unique` referencing Supabase `auth.users(id)`.

* All tenant-owned tables (e.g., `tickets`, `media_assets`) should **resolve ownership via `profile_id` → `profiles.auth_user_id = auth.uid()`**.

* **RLS policies**: deny-by-default; for `SELECT`, require the row belongs to the current user via the join. Vendor access remains via time-limited vendor tokens (later).

* **Server endpoints** must also verify ownership (defense-in-depth) before reading/updating any row IDs provided by the client.

### **B. Never trust client input**

* Treat **all** inbound data as untrusted: forms, URL params, headers, cookies, localStorage.

* **Server validation & sanitization** for every endpoint: types, lengths, enums, size/count limits for files.

* **Do not render untrusted HTML** (no `dangerouslySetInnerHTML`). Ticket description renders as plain text.

### **C. Secrets & configuration**

* **No secrets in frontend bundles.**

* `.env*` in `.gitignore`; use server-only envs for service role, webhook URLs.

* Use least-privilege keys; rotate if exposure suspected.

### **D. API safety**

* **Rate limiting** for: login/register, `sign_media_upload`, `media finalize`, `finalize_ticket`.

* Central error handler: users see generic messages (“Something went wrong”), never stacks. Logs capture request id, route, user id (if any), and error details server-side.

### **E. Database security (RLS in human language)**

* RLS enabled on all tenant data tables.

* Tenants: only rows where `profiles.auth_user_id = auth.uid()` through `profile_id` FK.

* Deny by default; allow explicitly.

* Test with two tenants to confirm isolation.

### **F. Logging**

* Structured server logs with a **correlation/request id**.

* Log: error name/message/stack, user id, route, params (safe), request id.

* Consider Sentry/Logtail/Datadog. **Production responses never include stack traces or SQL.**

### **G. Tests (high-leverage first)**

* **AuthZ / RLS tests:** Tenant A can’t read Tenant B’s tickets/media (both API and DB client).

* **XSS test:** Description containing `<script>` renders as literal text.

* **Rate limit test:** 10 rapid calls hit 429\.

* **E2E smoke:** login → wizard path → draft → upload → finalize → status list.

### **H. Modularity & small files (Cursor-friendly)**

* Group by **domain**: `modules/tickets`, `modules/decision-tree`, `modules/media`, `lib/` shared.

* Separate **UI** (components), **hooks/state**, **services** (API/DB), **types**.

* No circular imports; shared utils in `lib/`.

* Public interfaces documented with JSDoc / small README per domain.

### **I. Ops docs**

* Add **SECURITY.md** (XSS, IDOR, RLS, rate limits).

* Add **docs/plan.md** (scope, backlog, later items, acceptance tests).

* Add **RUNBOOK.md** (rotate keys, restore DB, incident response).

* Add **PERMISSIONS.md** (roles matrix: tenant, manager, admin; resource × action grid).

### **J. Working with Cursor / LLMs**

* End prompts with: **“Do only what I asked. Do not change anything else.”**

* After \~3 failed attempts: “List suspected causes, add targeted logs, run again; report outputs.”

* Keep `/docs/plan.md` updated; provide handcrafted test cases as acceptance criteria.

* Prefer Next.js \+ Supabase \+ Tailwind \+ Vercel.

* For breaking library upgrades (e.g., Tailwind 4.x), generate a concise upgrade guide and keep it in repo.

---

# **2\) 5-Page Sanity Checklist (Included verbatim, adapted to this project)**

## **🔧 Code Quality & Structure**

**Refactoring (no behavior change)**

* Name things clearly (files, variables, functions reflect their purpose).

* Split long functions into small, single-purpose functions.

* Delete duplicated code; extract helpers where reuse exists.

* Keep components thin; move data-fetching/business logic to services/hooks.

* After refactor, run tests and click through critical flows (tickets, invoices, auth).

**Modularity (small, reusable pieces)**

* Group by domain: tickets/, invoices/, auth/, units/, common/.

* Create small files: 1–2 responsibilities per file.

* Separate layers: UI (components), state/hooks, services (API/DB), types.

* No circular imports; shared utilities live in lib/ or common/.

* Public interfaces are documented (JSDoc or README per domain).

## **🔐 Data From the Client (Never trust it)**

**What counts as client data**  
 Treat forms, URL params, headers, cookies, localStorage—even hidden inputs—as untrusted.

**Validation & Sanitization**

* Server validates all inputs (types, ranges, lengths, enums).

* Server sanitizes any rich text; forbid/strip scripts.

* Output is escaped in templates. (React: never use dangerouslySetInnerHTML with untrusted data.)

**IDOR (Insecure Direct Object Reference) defenses**

* Every user-owned row has one ownership column (e.g., owner\_id/tenant\_id).

* All reads/updates filter by ownership (e.g., WHERE owner\_id \= current\_user).

* Attempting to access another user’s ID returns 404/403, never the data.

## **🧯 XSS (Cross-Site Scripting)**

* Don’t render untrusted HTML. If you must, sanitize on the server with an allowlist.

* All user-supplied strings rendered as plain text (React default is safe).

* Admin dashboards also treat tenant text as untrusted (no exceptions).

* Markdown renderers are configured to disallow raw HTML (or sanitize it).

## **👤 Auth & Authorization**

**Ensure a logged-in user sees only their invoices**

* invoices table has owner\_id that matches the auth user’s ID.

* All invoice queries include owner\_id \= session.user.id (or equivalent).

* Direct URL changes (e.g., /invoice/other-id) still return 404/403.

**Verify permissions for every action & resource**

* Auth middleware: blocks unauthenticated requests.

* Role/ownership checks: enforced at the endpoint and in DB (defense-in-depth).

* Admin/manager access is scoped (portfolio/org), not global unless truly necessary.

* Access decisions are explicit: Owner? Manager? Admin? If none, deny.

## **🤫 Secrets & Configuration**

* No secrets in frontend bundles or public repos.

* Secrets live in env vars on the server/hosting; .env in .gitignore.

* Rotate keys if exposure suspected; set least-privilege scopes for API keys.

## **🚦 API Safety & Sensitive Data**

* Rate limiting on login, password reset, and general APIs.

* Bruteforce protections (e.g., lockout/slowdown after N attempts).

* HTTPS enforced end-to-end; no mixed content.

* Sensitive data at rest: hashed passwords (argon2/bcrypt), encrypted PII where appropriate.

* Don’t return sensitive fields by default (only select what you need).

## **🧱 Database Security (RLS & Rules—human language)**

**RLS (Row-Level Security)**

* RLS enabled on all tenant data tables.

* DB rules say: “Only return rows where owner\_id equals the caller’s user ID.”

* Managers’ DB rules: “May access rows within their org/portfolio,” nothing beyond.

* Inserts/updates also checked (user can only create/update rows that match their identity scope).  
   **Why:** Even if app code forgets a filter, the DB won’t return cross-tenant rows. It’s the smart lock on every row.

**Define access rules directly in DB (mental checklist)**

* Each table has the columns needed to make a decision (owner\_id, manager\_org\_id, etc.).

* “Tenant rule”: match owner\_id to the authenticated user.

* “Manager rule”: allow when requestor’s org matches row’s org.

* Deny by default; allow by explicit policy only.

* Test with two tenants \+ one manager to confirm rules behave.

## **🧾 Errors & Logging**

* Users see generic errors (“Something went wrong”) with correct HTTP codes, never stack traces.

* Dev logs capture: error name/message/stack, user id, route, params, correlation/request id.

* Centralized error handler and structured logging (Sentry/Datadog/Logtail or Pino/Winston).

* Production responses never leak SQL, internals, or env values.

## **🧪 Testing (high-leverage tests first)**

* AuthZ tests: Tenant A cannot access Tenant B data (tickets, invoices, files).

* RLS tests: Same as above, run at DB client layer; ensure zero rows leak.

* XSS tests: Store `<script>` payloads and verify they render as literal text.

* API limits: Repeated login attempts get throttled/blocked.

* E2E smoke: login → create ticket → view ticket → create invoice → view invoice (per role).

* Regression suite runs in CI on every PR.

## **🪪 Roles & Multi-tenant Modeling**

* Decide tenancy boundary (per user, per unit, per building/org) and encode it in columns.

* Keep a user\_roles or JWT claims source of truth.

* All queries and DB policies consider the tenant boundary (owner/org).

## **🛠️ Working With LLMs (Cursor/Lovable/etc.)**

**Guardrails to avoid model drift**

* End prompts with: “Do only what I asked. Do not change anything else.”

* When stuck after \~3 tries, instruct: “List top suspected causes, add targeted logs, run again; report outputs.”

* Keep a `/docs/plan.md` for scope & rules; tell the model to update checkboxes as tasks complete.

* Provide handcrafted test cases first; use them as acceptance criteria.

**Upgrading breaking libraries (e.g., Tailwind 4.x)**

* Use a “deep research” pass to produce a concise upgrade guide with diffs & examples.

* Keep that doc in repo and include in model context when relevant.

* Prefer widely used, well-documented stacks (Next.js \+ Supabase \+ Tailwind \+ Vercel).

## **🚀 Project Setup & Process**

**Pre-building planning**

* Define scope, DB schema, and “won’t do (later)” list.

* Decide MVP flows (ticket creation, triage, invoice viewing, manager oversight).

* Document logging strategy and security expectations.

**Backend setup (Node/Deno)**

* New server/ (or Next API routes) with dotenv for env vars.

* Health route \+ basic auth route \+ one resource route (e.g., tickets) as template.

* Central error handler, rate limiter middleware, request logging.

**Refactor early after “Hello World”**

* Extract server calls to lib/serverComms (or services layer).

* Keep UI components pure; data/side-effects in hooks/services.

**Complex features**

* If large/gnarly, build in a clean, separate folder/repo first.

* Prove it works (tests \+ manual), then port into the main codebase guided by that working reference.

**Bug reporting**

* Use screenshots/screen recordings with steps, expected vs actual, and console/network logs.

## **📄 Ops & Documentation**

* **SECURITY.md** (XSS, IDOR, RLS, rate limits policy).

* **docs/plan.md** (scope, backlog, “later” items, acceptance tests).

* **RUNBOOK.md** (how to rotate keys, restore DB, respond to incident).

* **PERMISSIONS.md** (roles matrix: tenant, manager, admin; resource × action grid).

## **🧰 Practical Acceptance Tests (copy for QA)**

* Tenant A cannot load /invoice/:id that belongs to Tenant B (404/403).

* Tenant A cannot list invoices without owner filter (RLS returns 0).

* Manager can list invoices only for their buildings/org; cannot see others.

* Ticket description `<script>alert(1)</script>` renders literally; no alert fires.

* 10 rapid login attempts trigger rate limiting.

* API responses never include stack traces or SQL.

* Removing an app-level owner filter still doesn’t leak rows (RLS blocks).

* Frontend bundle contains no secrets (inspect network/bundle).

## **✅ Final daily “green light” before shipping**

* Ownership column exists on all tenant-owned tables.

* RLS enabled \+ policies in place for select/insert/update/delete.

* Auth middleware \+ resource checks present on all routes.

* Rate limits active on sensitive endpoints.

* Error handler returns generic messages; logs are rich and centralized.

* High-level E2E tests pass for tenant and manager paths.

* No secrets in client; .env ignored by Git; HTTPS enforced.

---

## **More notes (kept for developer education)**

**Primary key vs Foreign key:**  
 Primary key \= unique identifier for each row  
 Foreign key \= column that references a PK in another table

**Clubs**

`club_id (PK) | name               | city`

`1            | Arsenal            | London`

`2            | Manchester United  | Manchester`

`3            | Liverpool          | Liverpool`

**Players**

`player_id (PK) | name            | club_id (FK)`

`101            | Bukayo Saka     | 1`

`102            | Marcus Rashford | 2`

`103            | Mohamed Salah   | 3`

`104            | Martin Ødegaard | 1`

`club_id` is FK because it references a PK in the clubs table. We can do a SQL join to combine rows and get the club name in Players (join on the FK). Left/Right/Inner/Outer join basics apply.

**Refactoring \=** cleaning up existing code without changing behavior (rename vars, split long funcs, remove dupes) to improve readability and maintainability.  
 **Modular \=** small, reusable building blocks (modules), not giant files.

**Trusting Client Data:** Using form/URL input directly is risky. Always validate & sanitize on server; escape output. Client data \= anything from a browser (forms, URL params, cookies, localStorage, hidden inputs).  
 **Risks:** IDOR (changing IDs), XSS (pasting scripts), privilege escalation.

**XSS:** Example payload:  
 `<script>fetch('/steal?cookie=' + document.cookie)</script>`  
 Mitigations for our stack: React escapes strings; never use `dangerouslySetInnerHTML`; sanitize rich text on server if ever used; escape content in non-React templating.

**Authorization mantra:** Query itself enforces ownership (e.g., `owner_id = session.user.id`). Even if URL id is changed, no cross-user data returns.

**Server verifies permissions for every action & resource:**

* Auth middleware ensures user logged in; load roles/claims.

* Per-resource checks confirm ownership/role before read/update/delete.

* Secrets stay server-side.

* Generic user errors; detailed dev logs.

* RLS on DB.

* Rate limits; HTTPS.

* If the LLM flails after 3 tries: ask it for top suspects, add logs, rerun, report outputs.

**Prompt guardrail for LLMs:** “**Do only what I asked. Do not change anything else.**”  
 Breaking library upgrades: generate a concise internal guide; keep in repo.  
 Prefer widely-used stacks (Next \+ Supabase \+ Tailwind \+ Vercel).  
 Refactor frequently; rely on tests to prevent regressions.  
 Keep rules in markdown (Cursor/Windsurf rules) and include docs locally for model context.