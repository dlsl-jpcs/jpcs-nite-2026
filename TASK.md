# Task: Scoring CRUD UI

**Branch:** `feature/admin-scoring-crud`
**Page:** `src/app/(admin)/admin/scoring/page.tsx`
**Your job:** Build the scoring interface that lets the admin add points, deduct points, and undo the last score entry for any table.

---

## What You're Building

The `/admin/scoring` page is where the admin manages table scores during the event. It needs to:

1. Show all tables ranked by their current score (highest first)
2. Let the admin pick a table, enter a point value (positive or negative), and an optional reason — then submit
3. Let the admin undo the last score entry for a table (delete it from the ledger)
4. Every submit/undo action must require **two clicks** to confirm (already handled by `<ConfirmButton>` — see below)
5. Score changes update in real time across all open admin tabs (already handled by the hook — see below)

For a working reference of layout patterns, API call patterns, and `<ConfirmButton>` usage, open:
```
src/app/(admin)/admin/buzzer-control/page.tsx
```
That page is fully implemented. Copy its patterns.

---

## File to Edit

```
src/app/(admin)/admin/scoring/page.tsx
```

This file already exists with a placeholder. Replace the placeholder with your implementation. Do not create new files unless you need to extract a sub-component — if you do, put it in `src/components/admin/`.

---

## APIs to Call

| Action | Method | URL | Body |
|--------|--------|-----|------|
| Get all scores (ranked) | `GET` | `/api/scores` | — |
| Add or deduct points | `POST` | `/api/scores` | `{ table_id, delta, reason? }` |
| Undo (delete) an entry | `DELETE` | `/api/scores/:id` | — |

`delta` is an integer. Positive = add points. Negative = deduct points.

### How to make an API call (copy this pattern)

```tsx
const api = async (method: string, url: string, body?: unknown) => {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => `HTTP ${res.status}`);
    throw new Error(msg);
  }
  return res.json();
};
```

---

## Hooks and Components to Use

### `useTableScores()`
Import from `@/lib/hooks/use-table-scores`.

```tsx
const { scores, loading, error, refetch } = useTableScores();
```

- `scores` — array of `TableScoreResponse`, already sorted by score descending
- `loading` — boolean, true while fetching
- `error` — string or null
- `refetch()` — manually re-fetches scores (useful after an undo)

The hook auto-updates via Realtime when any score changes — you don't need to poll.

Each item in `scores` has:
```ts
{
  id: string           // table UUID — use this as table_id when posting a score
  display_name: string // "Table 1", "Table 2", etc.
  table_number: number
  current_score: number
}
```

### `<ConfirmButton>`
Import from `@/components/admin/confirm-button`.

Wraps any important action. First click "arms" it (label changes). Second click within 3 seconds fires `onConfirm`. This is required by the SRS for all scoring actions.

```tsx
<ConfirmButton
  onConfirm={handleSubmit}
  confirmLabel="Confirm +10 pts"
>
  +10 pts
</ConfirmButton>
```

Props: `onConfirm` (required), `confirmLabel`, `variant`, `disabled`, `className`.

### Types
Import from `@/lib/types/realtime`:
```tsx
import type { ScoreCreateRequest, TableScoreResponse } from "@/lib/types/realtime";
```

---

## Acceptance Criteria

Before you open a pull request, verify all of these:

- [ ] All tables are displayed with their current scores, ranked highest first
- [ ] Admin can select a table and add points (positive delta)
- [ ] Admin can select a table and deduct points (negative delta)
- [ ] Admin can undo the most recent score entry for a table
- [ ] Every score action uses `<ConfirmButton>` — no direct single-click submits
- [ ] The page style matches Dashboard and Buzzer Control (dark background, gold accents, uppercase section labels)
- [ ] `pnpm build` passes with **zero errors**
- [ ] `pnpm lint` passes with **zero errors**

---

## Local Setup

```bash
# 1. Clone the repo (skip if already cloned)
git clone https://github.com/dlsl-jpcs/jpcs-nite-2026.git
cd jpcs-nite-2026

# 2. Install dependencies
pnpm install

# 3. Set up environment
cp .env.example .env.local
# Open .env.local and fill in the Supabase keys — ask Drex for the values

# 4. Switch to your branch
git checkout feature/admin-scoring-crud

# 5. Start the dev server
pnpm dev

# 6. Open the page
# http://localhost:3000/admin/scoring
```

---

## How to Submit Your Work (Step by Step)

### While working — save your progress regularly

After making changes you want to keep:

```bash
# See what files you've changed
git status

# Stage your changes
git add src/app/(admin)/admin/scoring/page.tsx
# If you created extra component files, add those too:
# git add src/components/admin/your-component.tsx

# Commit with a clear message
git commit -m "feat: implement scoring CRUD UI"
```

You can commit multiple times as you work. That's normal and encouraged.

### When you're done — push and open a pull request

**Step 1.** Make sure the build passes:
```bash
pnpm build
pnpm lint
```
Fix any errors before continuing.

**Step 2.** Push your branch to GitHub:
```bash
git push origin feature/admin-scoring-crud
```

**Step 3.** Open GitHub in your browser and go to the repo:
```
https://github.com/dlsl-jpcs/jpcs-nite-2026
```

**Step 4.** You should see a yellow banner saying your branch has recent pushes with a **"Compare & pull request"** button. Click it.

> If the banner doesn't appear: click the **"Pull requests"** tab → **"New pull request"** → set base to `main` and compare to `feature/admin-scoring-crud`.

**Step 5.** Fill in the pull request form:
- **Title:** `feat: scoring CRUD UI`
- **Description:** Briefly describe what you built and note anything Drex should check. Example:
  ```
  Implements the scoring interface at /admin/scoring.

  - Ranked score table with live updates via useTableScores()
  - Add/deduct form with ConfirmButton
  - Undo last entry per table with ConfirmButton
  - Follows buzzer-control layout conventions

  pnpm build ✅  pnpm lint ✅
  ```

**Step 6.** Click **"Create pull request"**.

**Step 7.** Message Drex in the group chat with the PR link so he can review and merge.

---

## Rules (Do Not Break These)

- Only edit files inside `src/app/(admin)/admin/scoring/` and `src/components/admin/` (for new components only)
- Do **not** edit `src/lib/types/realtime.ts`, `src/lib/supabase/`, or any API routes
- Do **not** push directly to `main`
- The buzzer and scoring systems are fully decoupled — your page only calls `/api/scores`, never `/api/rounds`
- If you need a type that doesn't exist in `realtime.ts`, ask Drex

---

## Questions?

- Message Drex in the group chat
- Reference page: `src/app/(admin)/admin/buzzer-control/page.tsx`
- Full requirements: `docs/admin-handoff.md` → "Task A: Scoring CRUD UI"
