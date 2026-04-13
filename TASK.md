# Task: Table Management UI

**Branch:** `feature/admin-table-management`
**Page:** `src/app/(admin)/admin/tables/page.tsx`
**Your job:** Build the table management interface that lets the admin create tables, toggle their active status, and release stuck device connections.

---

## What You're Building

The `/admin/tables` page is where the admin sets up and manages the physical tables before and during the event. It needs to:

1. Show all registered tables with their status (active/inactive) and device connection info
2. Let the admin bulk-create N tables at once (e.g., "Create 50 tables" generates Table 1 through Table 50)
3. Let the admin toggle any table between active and inactive
4. Let the admin release (disconnect) a device from a table — used when a rep's phone dies and needs to be replaced
5. Every destructive action must require **two clicks** to confirm (already handled by `<ConfirmButton>` — see below)

For a working reference of layout patterns, API call patterns, and `<ConfirmButton>` usage, open:
```
src/app/(admin)/admin/buzzer-control/page.tsx
```
That page is fully implemented. Copy its patterns.

---

## File to Edit

```
src/app/(admin)/admin/tables/page.tsx
```

This file already exists with a placeholder. Replace the placeholder with your implementation. Do not create new files unless you need to extract a sub-component — if you do, put it in `src/components/admin/`.

---

## APIs to Call

| Action | Method | URL | Body |
|--------|--------|-----|------|
| Get all tables | `GET` | `/api/tables` | — |
| Bulk-create tables | `POST` | `/api/tables` | `{ count: N }` |
| Toggle active status | `PATCH` | `/api/tables/:id` | `{ is_active: boolean }` |
| Release device | `POST` | `/api/devices/:tableId/release` | — |

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

## Data Shape from GET /api/tables

Each item in the response looks like this:

```ts
{
  id: string            // table UUID
  display_name: string  // "Table 1", "Table 2", etc.
  table_number: number  // 1, 2, 3, ...
  is_active: boolean    // whether this table is in play
  created_at: string
  device_session: {
    id: string
    is_active: boolean
    connected_at: string   // ISO timestamp
    last_seen_at: string   // ISO timestamp — when the phone last interacted
  } | null                 // null = no device connected
}
```

Use `device_session !== null && device_session.is_active` to determine if a device is currently connected.

---

## Components to Use

### `<ConfirmButton>`
Import from `@/components/admin/confirm-button`.

Wraps any destructive or important action. First click arms it, second click within 3 seconds fires `onConfirm`. Required for toggle and release actions.

```tsx
<ConfirmButton
  onConfirm={() => handleRelease(table.id)}
  confirmLabel="Confirm release"
  variant="outline"
>
  Release Device
</ConfirmButton>
```

Props: `onConfirm` (required), `confirmLabel`, `variant`, `disabled`, `className`.

### Types
Import from `@/lib/types/realtime`:
```tsx
import type { TableRow } from "@/lib/types/realtime";
```

The full table-with-device shape (including `device_session`) is already defined in the existing placeholder at the top of `tables/page.tsx` as `TableWithDevice` — keep that interface.

---

## Acceptance Criteria

Before you open a pull request, verify all of these:

- [ ] All registered tables are displayed with their name, active/inactive status, and device connection status
- [ ] Admin can bulk-create N tables using a count input
- [ ] Admin can toggle any table's active status
- [ ] Admin can release a connected device from a table
- [ ] Toggle and release actions use `<ConfirmButton>` — no direct single-click submits
- [ ] Device info is shown per table (connected or not; `last_seen_at` if connected)
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
git checkout feature/admin-table-management

# 5. Start the dev server
pnpm dev

# 6. Open the page
# http://localhost:3000/admin/tables
```

---

## How to Submit Your Work (Step by Step)

### While working — save your progress regularly

After making changes you want to keep:

```bash
# See what files you've changed
git status

# Stage your changes
git add src/app/(admin)/admin/tables/page.tsx
# If you created extra component files, add those too:
# git add src/components/admin/your-component.tsx

# Commit with a clear message
git commit -m "feat: implement table management UI"
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
git push origin feature/admin-table-management
```

**Step 3.** Open GitHub in your browser and go to the repo:
```
https://github.com/dlsl-jpcs/jpcs-nite-2026
```

**Step 4.** You should see a yellow banner saying your branch has recent pushes with a **"Compare & pull request"** button. Click it.

> If the banner doesn't appear: click the **"Pull requests"** tab → **"New pull request"** → set base to `main` and compare to `feature/admin-table-management`.

**Step 5.** Fill in the pull request form:
- **Title:** `feat: table management UI`
- **Description:** Briefly describe what you built and note anything Drex should check. Example:
  ```
  Implements the table management interface at /admin/tables.

  - Table list with active/inactive status and device connection info
  - Bulk-create form with ConfirmButton
  - Toggle active status per table with ConfirmButton
  - Release device per table with ConfirmButton
  - Follows buzzer-control layout conventions

  pnpm build ✅  pnpm lint ✅
  ```

**Step 6.** Click **"Create pull request"**.

**Step 7.** Message Drex in the group chat with the PR link so he can review and merge.

---

## Rules (Do Not Break These)

- Only edit files inside `src/app/(admin)/admin/tables/` and `src/components/admin/` (for new components only)
- Do **not** edit `src/lib/types/realtime.ts`, `src/lib/supabase/`, or any API routes
- Do **not** push directly to `main`
- Table names ("Table 1", "Table 2", etc.) are set by the bulk-create API — you do not need to let the admin set names manually
- If you need a type that doesn't exist in `realtime.ts`, ask Drex

---

## Questions?

- Message Drex in the group chat
- Reference page: `src/app/(admin)/admin/buzzer-control/page.tsx`
- Full requirements: `docs/admin-handoff.md` → "Task B: Table Management UI"
