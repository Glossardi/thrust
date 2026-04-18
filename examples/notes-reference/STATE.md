# STATE.md - Notes Reference App

## Routes
- `GET /` - Home page
- `GET /notes` - Notes reference feature page
- `GET /notes/api` - List notes JSON
- `POST /notes/api` - Create note JSON
- `PATCH /notes/api/:id/pin` - Toggle pinned JSON
- `DELETE /notes/api/:id` - Delete note JSON
- `GET /notes/api/filter` - Filter notes JSON

## DB Tables
- `notes` - Notes table for the reference feature

## Features
- `src/features/notes.tsx`
- `src/features/notes.client.tsx`
- `src/features/notes.test.ts`

## Shared Modules
- `src/lib/layout.tsx`
- `src/lib/island.tsx`
- `src/lib/db.ts`
- `src/lib/env.ts`
