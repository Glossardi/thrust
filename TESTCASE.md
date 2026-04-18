# TESTCASE.md - Thrust Framework Stress Test

> Purpose: fork this repo, give the prompt below to any AI coding agent, and evaluate how well Thrust plus AGENT.md guide the agent to produce correct, working code under the RPC + islands architecture.

## How to Use

1. Fork the Thrust repo
2. `bun install && bun run build:client && bun run build:css`
3. Verify base tests pass: `bun test src/`
4. Copy the agent prompt below into your AI coding agent
5. Let the agent work without help
6. Score the result using the rubric at the bottom

## The Agent Prompt

Copy everything between the markers.

---

### PROMPT START

Read `AGENT.md` and `STATE.md` first. Then implement the following feature:

Build a "Notes" feature for this Thrust app.

Requirements:

### 1. Database
Add a `notes` table to `src/lib/db.ts` with these columns:
- `id` - integer, primary key, auto-increment
- `title` - text, not null
- `content` - text, not null, default empty string
- `category` - text, not null, default "general" with allowed values `general`, `work`, `personal`
- `pinned` - boolean integer, not null, default false
- `createdAt` - text, not null, default current ISO timestamp

### 2. Feature files
Create these files:
- `src/features/notes.tsx`
- `src/features/notes.client.tsx`
- `src/features/notes.test.ts`

### 3. Server routes in `src/features/notes.tsx`
Implement:

#### Page route
- `GET /notes`
- returns a full server-rendered page using `Layout`
- includes a mounted client island for the interactive UI

#### RPC routes
Mount typed JSON routes under `/notes/api`:
- `GET /notes/api` - return all notes, pinned notes first
- `POST /notes/api` - create a note
- `PATCH /notes/api/:id/pin` - toggle pinned state
- `DELETE /notes/api/:id` - delete a note
- `GET /notes/api/filter?category=work` - return only notes in that category

Rules:
- validate inputs with `zod` and `@hono/zod-validator`
- return `c.json(..., status)` with explicit status codes
- use a feature-local exported RPC type for the client island

### 4. Client island in `src/features/notes.client.tsx`
Build a small browser island using `hono/jsx/dom` and `useState`.

The island should:
- render the notes list
- render a create form
- render a category filter
- call the backend with `hc()`
- keep local UI state for loading, notes list, form values, and current filter

### 5. UI behavior
- show pinned notes first
- show category as a DaisyUI badge
- show a pin toggle button
- show a delete button
- show an empty state when no notes exist: "No notes yet. Create your first one!"
- show button loading feedback during mutations

### 6. Tests in `src/features/notes.test.ts`
Write tests for:
- `GET /notes` returns 200 with page structure
- `GET /notes/api` returns notes JSON
- `POST /notes/api` creates a note and returns 201
- `POST /notes/api` rejects invalid title with 400
- `POST /notes/api` rejects invalid category with 400
- `DELETE /notes/api/:id` works
- `PATCH /notes/api/:id/pin` toggles pin state
- `GET /notes/api/filter?category=work` returns only work notes
- `GET /notes/api/filter?category=all` returns all notes

### 7. Integration
- mount the notes route in `src/index.tsx`
- add a "Notes" link to the home page
- update `STATE.md`

Follow the AGENT.md protocol. TDD first. Run `bun run build:client` and `bun test` before telling me you are done.

### PROMPT END

---

## Scoring Rubric

Score each dimension 0-3. Total possible: 30 points.

### 1. TDD Protocol Compliance (0-3)
| Score | Criteria |
|-------|----------|
| 0 | No tests written, or tests written after implementation |
| 1 | Tests exist but were clearly written alongside or after code |
| 2 | Tests created first, but agent did not run them to verify failure before implementing |
| 3 | Full TDD cycle: tests written, failed, code written, passed |

### 2. AGENT.md Rule Adherence (0-3)
| Score | Criteria |
|-------|----------|
| 0 | Agent ignored AGENT.md entirely |
| 1 | Agent followed some rules but broke the feature slice or typed RPC model |
| 2 | Agent followed most rules with minor violations |
| 3 | Perfect adherence: feature slice, SSR page, typed RPC, small island, minimal code |

### 3. STATE.md Updated (0-3)
| Score | Criteria |
|-------|----------|
| 0 | STATE.md not touched |
| 1 | STATE.md updated but incomplete |
| 2 | STATE.md updated with most relevant info |
| 3 | STATE.md accurately reflects routes, table, feature slice, and shared modules |

### 4. Tests Pass - `bun test src/` (0-3)
| Score | Criteria |
|-------|----------|
| 0 | Tests do not run |
| 1 | Some tests pass, some fail |
| 2 | All new tests pass, but existing tests broke |
| 3 | All new and existing tests pass |

### 5. Code Quality (0-3)
| Score | Criteria |
|-------|----------|
| 0 | Code is messy, duplicated, or breaks the architecture |
| 1 | Code works but has obvious issues |
| 2 | Clean code, good validation, reasonable state handling |
| 3 | Excellent: clean route structure, small island, pinned-first sorting, explicit statuses |

### 6. RPC Correctness (0-3)
| Score | Criteria |
|-------|----------|
| 0 | No typed RPC path, or island does not use `hc()` |
| 1 | RPC exists but types or status handling are weak |
| 2 | RPC works with minor inconsistencies |
| 3 | RPC is typed, validated, explicit, and used correctly from the island |

### 7. DB Schema Correctness (0-3)
| Score | Criteria |
|-------|----------|
| 0 | Table missing or incorrect |
| 1 | Table exists but missing columns or wrong defaults |
| 2 | Schema mostly correct |
| 3 | Schema matches spec and auto-migrate is included |

### 8. Validation and Error Handling (0-3)
| Score | Criteria |
|-------|----------|
| 0 | No validation |
| 1 | Basic validation only |
| 2 | Title length and category enum validated |
| 3 | Full validation plus explicit 400 and 404 handling |

### 9. UI/DX Quality (0-3)
| Score | Criteria |
|-------|----------|
| 0 | Broken UI |
| 1 | Barely functional UI |
| 2 | Reasonable DaisyUI layout |
| 3 | Polished enough: loading states, badges, empty state, clear actions |

### 10. Self-Correction and Debugging (0-3)
| Score | Criteria |
|-------|----------|
| 0 | Agent delivered broken code and said done |
| 1 | Agent needed user help to fix obvious issues |
| 2 | Agent self-corrected most issues |
| 3 | Agent found failures, fixed them, and confirmed all checks pass |

## Known Pitfalls to Watch For

### Pitfall 1: Missing Content-Type in Tests
JSON validators receive `{}` if `Content-Type: application/json` is missing.

### Pitfall 2: Missing Origin Header in Mutating Tests
CSRF protection still applies to POST, PATCH, PUT, and DELETE requests.

### Pitfall 3: Untyped Not Found Responses
Using `c.notFound()` without an intentional typed contract can make client-side response typing weak or unknown.

### Pitfall 4: Server Imports in `*.client.tsx`
The island must not import server-only modules such as `bun:sqlite`, `db`, or Bun-only APIs.

### Pitfall 5: Oversized Island Scope
If the island tries to own the whole page instead of the interactive subtree, the feature becomes harder to reason about and easier to break.

### Pitfall 6: Missing Pinned-First Sorting
The list must return pinned notes first on the server side.

## Quick Evaluation Checklist

After the agent says done, run:

```bash
# 1. Build the client bundle
bun run build:client

# 2. Do all tests pass?
bun test src/

# 3. Start the server
PORT=3111 bun run src/index.tsx &
sleep 1

# 4. Notes page works?
curl -s -o /dev/null -w "%{http_code}" http://localhost:3111/notes

# 5. API create works?
curl -s -X POST http://localhost:3111/notes/api \
  -H "Origin: http://localhost" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","content":"Hello","category":"work"}'

# 6. Cleanup
kill %1
```

## Interpretation

| Score | Rating | Meaning |
|-------|--------|---------|
| 27-30 | Excellent | Framework guides agents extremely well |
| 21-26 | Good | Framework works well with minor rough edges |
| 15-20 | Fair | Important guidance gaps remain |
| 0-14 | Needs Work | Framework still causes large agent failure modes |
