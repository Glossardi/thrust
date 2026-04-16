# TESTCASE.md — Thrust Framework Stress Test

> **Purpose:** Fork this repo, give the prompt below to any AI coding agent, and evaluate how well Thrust + AGENT.md guide the agent to produce correct, working code.

---

## How to Use

1. Fork the Thrust repo
2. `bun install && bun run build:css`
3. Verify base tests pass: `bun test src/`
4. Copy the **Agent Prompt** below into your AI coding agent
5. Let the agent work — **do not help it**
6. Score the result using the **Rubric** at the bottom

---

## The Agent Prompt

Copy everything between the `---` markers:

---

### PROMPT START

Read `AGENT.md` and `STATE.md` first. Then implement the following feature:

**Build a "Notes" feature for this Thrust app.**

Requirements:

**1. Database**
Add a `notes` table to `src/lib/db.ts` with these columns:
- `id` — integer, primary key, auto-increment
- `title` — text, not null
- `content` — text, not null, default empty string
- `category` — text, not null, default "general" (allowed values: "general", "work", "personal")
- `pinned` — boolean (integer), not null, default false
- `createdAt` — text, not null, default current timestamp (ISO string)

**2. Routes & UI (all in `src/features/notes.tsx`)**

| Route | Method | Behavior |
|-------|--------|----------|
| `/notes` | GET | Full page: shows all notes as DaisyUI cards, pinned notes first. Include a "create note" form and a category filter dropdown. |
| `/notes` | POST | Create a note from form data. Validate: title must be 1-100 chars, category must be one of the allowed values. Return the new note card as an HTML fragment (for HTMX append). |
| `/notes/:id` | DELETE | Delete the note. Return empty 200. |
| `/notes/:id/pin` | PATCH | Toggle the `pinned` state. Return the updated note card fragment. |
| `/notes/filter` | GET | Accept `?category=work` query param. Return only the filtered note cards as HTML fragment (replaces the note list via HTMX). If category is "all", return all notes. |

**3. UI Details**
- Each note card should show: title, content (truncated to 120 chars), category as a DaisyUI badge, pin icon/button, delete button.
- Pinned notes should have a visual indicator (e.g. `border-primary` or a 📌 icon).
- The category filter dropdown should use `hx-get="/notes/filter"` with `hx-target` to replace the notes list without full page reload.
- The create form should use HTMX to add the new note without page reload.
- Show an empty state message when no notes exist: "No notes yet. Create your first one!"

**4. Tests (in `src/features/notes.test.ts`)**
Write tests for:
- GET /notes returns 200 with page structure
- POST /notes creates a note and returns HTML fragment
- POST /notes rejects invalid title (empty) with 400
- POST /notes rejects invalid category with 400
- DELETE /notes/:id works
- PATCH /notes/:id/pin toggles pin state
- GET /notes/filter?category=work returns only work notes
- GET /notes/filter?category=all returns all notes

**5. Integration**
- Mount the notes route in `src/index.tsx`
- Add a "Notes" link to the home page
- Update `STATE.md`

Follow the AGENT.md protocol. TDD first. Run `bun test` and make sure everything passes before telling me you're done.

### PROMPT END

---

## Scoring Rubric

Score each dimension **0-3**. Total possible: **30 points**.

### 1. TDD Protocol Compliance (0-3)
| Score | Criteria |
|-------|----------|
| 0 | No tests written, or tests written after implementation |
| 1 | Tests exist but were clearly written alongside/after code |
| 2 | Tests created first, but agent didn't run them to verify failure before implementing |
| 3 | Full TDD cycle: tests written → ran and failed → code written → ran and passed |

### 2. AGENT.md Rule Adherence (0-3)
| Score | Criteria |
|-------|----------|
| 0 | Agent ignored AGENT.md entirely |
| 1 | Agent followed some rules but violated locality (e.g. separate component files) or used JSON responses |
| 2 | Agent followed most rules, minor violations |
| 3 | Perfect adherence: locality of behavior, HTML fragments, HTMX patterns, minimal code |

### 3. STATE.md Updated (0-3)
| Score | Criteria |
|-------|----------|
| 0 | STATE.md not touched |
| 1 | STATE.md updated but incomplete (missing routes or table info) |
| 2 | STATE.md updated with most info |
| 3 | STATE.md accurately reflects all new routes, table schema, and feature file |

### 4. Tests Pass — `bun test src/` (0-3)
| Score | Criteria |
|-------|----------|
| 0 | Tests don't run (import errors, syntax errors) |
| 1 | Some tests pass, some fail |
| 2 | All tests pass, but existing app tests broke |
| 3 | All new AND existing tests pass (2 base + 8+ new) |

### 5. Code Quality (0-3)
| Score | Criteria |
|-------|----------|
| 0 | Code is messy, has dead code, wrong patterns |
| 1 | Code works but has issues (no validation, no error handling, duplicated logic) |
| 2 | Clean code, proper validation, handles edge cases |
| 3 | Excellent: proper Zod/manual validation, clean components, good HTMX patterns, pinned-first sorting |

### 6. HTMX Correctness (0-3)
| Score | Criteria |
|-------|----------|
| 0 | No HTMX used, or JSON responses instead of HTML |
| 1 | Basic HTMX but broken (wrong targets, wrong swap modes) |
| 2 | HTMX works for create/delete but filter is broken or causes full page reload |
| 3 | All interactions work correctly: create appends, delete removes, pin updates in-place, filter replaces list |

### 7. DB Schema Correctness (0-3)
| Score | Criteria |
|-------|----------|
| 0 | Table not created or major schema errors |
| 1 | Table exists but missing columns or wrong types |
| 2 | Schema correct but no auto-migrate or missing from drizzle schema |
| 3 | Schema exactly matches spec, auto-migrate included, exports available |

### 8. Validation & Error Handling (0-3)
| Score | Criteria |
|-------|----------|
| 0 | No validation at all |
| 1 | Basic validation (rejects empty title) |
| 2 | Validates title length + category enum |
| 3 | Full validation: title 1-100 chars, category enum, proper 400 responses with messages, handles non-existent IDs with 404 |

### 9. UI/DX Quality (0-3)
| Score | Criteria |
|-------|----------|
| 0 | Broken HTML or no styling |
| 1 | Basic HTML that works but looks rough |
| 2 | Uses DaisyUI components, reasonable layout |
| 3 | Polished: cards with badges, pin indicator, empty state, category filter, responsive |

### 10. Self-Correction & Debugging (0-3)
| Score | Criteria |
|-------|----------|
| 0 | Agent delivered broken code and said "done" |
| 1 | Agent encountered errors but needed user help to fix |
| 2 | Agent hit errors and self-corrected most issues |
| 3 | Agent ran tests, found failures, fixed them independently, and confirmed all pass |

---

## Known Pitfalls to Watch For

These are specific things that agents frequently get wrong with Thrust. Check for these:

### Pitfall 1: CSRF on POST/PATCH/DELETE in Tests
The CSRF middleware requires an `Origin` header. If the agent's tests don't include `headers: { Origin: "http://localhost" }` on mutating requests, they'll get 403s.

**Watch for:** Agent confused by 403 errors, not realizing it's CSRF.

### Pitfall 2: Drizzle `.returning()` with bun:sqlite
In Drizzle with bun:sqlite, `db.insert(...).returning()` does NOT return an array you can destructure. You need `.returning().get()` for a single row.

**Watch for:** Agent writing `const [created] = db.insert(...).returning()` → runtime crash.

### Pitfall 3: Feature Route Mounting
The feature creates a sub-router (`new Hono()`), but when mounted at `/notes`, all internal routes are relative. The HTMX `hx-*` attributes need **absolute paths** (e.g., `hx-delete="/notes/5"` not `hx-delete="/5"`).

**Watch for:** HTMX targeting wrong URLs because the agent used relative paths.

### Pitfall 4: Layout Import Cycle
The existing `app.test.ts` imports `Layout` from `../index`. If the agent doesn't realize `index.tsx` exports `Layout`, they might duplicate the full HTML boilerplate.

**Watch for:** Duplicated `<html><head>...</head>` in the notes feature instead of using the shared Layout.

### Pitfall 5: Filter State Mismatch
The category filter dropdown should update the note list via HTMX, but the dropdown's selected value should persist visually. If the agent just replaces the card container, the dropdown resets.

**Watch for:** Dropdown resets to "all" after filtering, or filter replaces the whole page.

### Pitfall 6: `createdAt` Default Value
SQLite doesn't have a native `DEFAULT CURRENT_TIMESTAMP` that produces ISO strings. The agent needs to handle this in code (e.g., `new Date().toISOString()`) or use `DEFAULT (datetime('now'))`.

**Watch for:** `createdAt` being `null` or a Unix timestamp instead of ISO string.

### Pitfall 7: Pinned-First Sorting
The spec says "pinned notes first." This requires an `ORDER BY pinned DESC` in the query. Many agents forget sorting.

**Watch for:** Notes appearing in insertion order regardless of pin state.

---

## Quick Evaluation Checklist

After the agent says "done", run these commands:

```bash
# 1. Do ALL tests pass?
bun test src/

# 2. Does the server start without errors?
bun run src/index.tsx &
sleep 1

# 3. Do the routes work?
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/notes    # expect 200
curl -s http://localhost:3000/notes | grep -c "No notes yet"          # expect 1

# 4. Can we create a note?
curl -s -X POST http://localhost:3000/notes \
  -H "Origin: http://localhost" \
  -F "title=Test" -F "content=Hello" -F "category=work" \
  | grep -c "Test"                                                     # expect 1

# 5. Does filter work?
curl -s "http://localhost:3000/notes/filter?category=work" \
  | grep -c "Test"                                                     # expect 1
curl -s "http://localhost:3000/notes/filter?category=personal" \
  | grep -c "Test"                                                     # expect 0

# 6. Was STATE.md updated?
grep -c "notes" STATE.md                                               # expect 3+

# 7. Cleanup
kill %1
```

---

## Interpretation

| Score | Rating | Meaning |
|-------|--------|---------|
| 27-30 | ⭐⭐⭐ Excellent | Framework guides agents perfectly |
| 21-26 | ⭐⭐ Good | Framework works, but AGENT.md needs more guidance |
| 15-20 | ⭐ Fair | Significant gaps in documentation/patterns |
| 0-14 | ❌ Needs Work | Framework confuses agents more than it helps |

**What a low score tells you:**
- Score < 15 → AGENT.md needs more explicit examples and pitfall warnings
- Low "HTMX Correctness" → Need an HTMX pattern cookbook in AGENT.md
- Low "Self-Correction" → Tests are too hard to debug; improve error messages
- Low "TDD Compliance" → TDD workflow needs stricter step-by-step instructions
