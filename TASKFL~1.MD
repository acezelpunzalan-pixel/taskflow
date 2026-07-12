# TaskFlow — Project Context Prompt

Use this prompt to give Claude full context when continuing work on this project.

---

## Paste this into Claude:

---

I have a multi-page web app called **TaskFlow** — a field work and invoice management system built entirely in vanilla HTML, CSS, and JavaScript. All data is stored in `localStorage`. No frameworks, no build tools, no server. Every page is a standalone `.html` file that opens directly in a browser.

### File structure
All files live in the same folder and must stay together for nav links to work:
- `index.html` — Main task board
- `fieldwork.html` — Field visit log
- `invoices.html` — Invoice management + SaaS coverage dashboard
- `admin.html` — Site/location master list
- `workflow.html` — Visual workflow diagrams + interactive builder
- `taskflow-project-prompt.md` — This file

---

### Design system
- **Dark theme** with CSS variables: `--bg: #0f1117`, `--surface: #1a1d27`, `--surface2: #222535`, `--border: #2e3148`, `--accent: #6c63ff`, `--accent2: #a78bfa`
- Status colors: `--green: #22c55e`, `--yellow: #f59e0b`, `--red: #ef4444`, `--blue: #3b82f6`, `--orange: #f97316`
- Font: system-ui / `-apple-system`
- Consistent nav bar across all pages linking to all 5 pages
- Cards use `border-radius: 10px`, surfaces layer as `--bg → --surface → --surface2`
- Buttons: filled (`--accent`), ghost (transparent + border), small variant `.btn-sm`

---

### localStorage keys (shared across pages)
| Key | Written by | Read by |
|-----|-----------|---------|
| `taskflow_tasks` | task-dashboard | task-dashboard |
| `taskflow_visits` | fieldwork | invoices (import) |
| `tf_invoices` | invoices | invoices |
| `tf_sites` | admin | admin |
| `tf_site_names` | admin | fieldwork (datalist) |
| `tf_workflows` | workflow builder | workflow builder |

---

### Page details

#### `index.html`
- Stats bar: total, to do, in progress, done, high priority
- Completion progress bar
- Add task form: title, priority, status, category, due date
- Kanban board: 3 columns (To Do / In Progress / Done)
- Hover actions on cards: move between columns, delete
- Edit modal with notes field
- Filter by status/priority + search
- Nav links to all other pages

#### `fieldwork.html`
- Log field visits: vendor, site (autocomplete from `tf_site_names`), description, date, invoice #, amount, status
- Status workflow: Pending → Approved → Paid, or Disputed
- Sortable table with search + status filters
- Financial summary bar (pending / approved / disputed / paid totals)
- Stats cards + CSV export
- Edit modal per visit

#### `invoices.html`
- Stats bar: total, pending, approved, overdue, unpaid balance, total paid
- **Aging bar**: visual breakdown of unpaid invoices by days overdue
- **SaaS Coverage Dashboard** (between aging bar and add form):
  - Date range picker: `<input type="month">` From → To (defaults to Jan–current month of current year)
  - Per-vendor grid: each month shows **4 small colored squares** (W1 W2 W3 W4 = weeks)
  - Square colors: green=invoiced, red=gap, amber=multiple invoices, dark=future/out-of-range
  - Hover tooltips on each square: month, week, amount, status
  - KPI bar: vendors count, period spend, avg/month, week coverage %, week gaps
  - Coverage % turns green ≥90%, yellow ≥70%, red <70%
  - Only shows invoices with `category === 'SaaS'`
- Add invoice form: description, vendor (datalist), invoice #, PO/work order #, amount, invoice date, due date, category (Field Work / Maintenance / Supply / **SaaS** / Consulting / Other), file/attachment URL
- Approval workflow in detail modal: timestamped trail, approve/reject/comment/mark-paid buttons
- Status pipeline: Draft → Submitted → Approved → Paid (or Rejected)
- Overdue detection: highlights past-due unpaid invoices in red
- Import from Field Work button: pulls untracked field work invoices
- Sortable table, filter by status + overdue, search, CSV export

#### `admin.html`
- Master list of site/location names
- Add/edit form (left panel): site name, short code, category (Office/Warehouse/Site/Building/Plant/Other), address/notes, Active/Inactive status toggle
- Click any site card to edit it inline — no separate modal
- Usage count badge per card: shows how many field work visits reference it
- Edit panel shows usage breakdown (visits vs invoices)
- Deactivate removes site from dropdowns without deleting records
- Safe delete: warns if site is still referenced
- On save: syncs active site names to `tf_site_names` for fieldwork autocomplete
- Stats: total, active, inactive, in-use counts
- Filter (all/active/inactive) + search + toast notifications

#### `workflow.html`
- **Section 1 — App Navigation Map**: clickable diagram of all 5 pages, data flow legend, shared localStorage keys
- **Section 2 — Process Flow**: vertical timeline of the field visit → invoice → payment process with branching (approve vs dispute)
- **Section 3 — Workflow Builder**:
  - Node palette: Start, Action, Decision, Notify, Wait/Delay, End
  - Drag nodes onto dotted-grid canvas
  - Double-click to rename + add sub-label
  - Connect nodes: hover → click purple dot → click target node (bezier arrow drawn)
  - Click arrow to delete connection
  - Save named workflows to `tf_workflows` in localStorage
  - Load/delete saved workflows
  - Pre-loaded sample: "Field Visit → Payment" flow

---

### Conventions to follow when editing
1. Never use a framework — pure HTML/CSS/JS only
2. Keep all styles in a `<style>` block in the same file
3. Keep all JS in a `<script>` block at the bottom of the body
4. Use `esc()` helper for any user data inserted into HTML: `function esc(s) { return String(s||'').replace(/&/g,'&amp;')... }`
5. Use `fmt(n)` for currency: `'$' + Number(n||0).toLocaleString('en-US', {minimumFractionDigits:2})`
6. Always call `save()` after mutating data, then `renderAll()` or the relevant render function
7. The nav bar on every page must include all 5 pages with the current page marked `.active`
8. Seed data only runs when `localStorage` key is empty (`if (data.length === 0)`)
9. Modals use `.overlay` + `.modal` pattern with `.open` class toggled by JS
10. Toast notifications use a fixed-position div that fades in/out

---

### Current seed data (for reference, loads only on first open)
- **Tasks**: 5 sample tasks in various statuses
- **Field visits**: 4 sample visits (CoolTech, Volt Masters, AquaFix, SafeGuard)
- **Invoices**: 6 non-SaaS + 33 SaaS invoices across 6 vendors (Figma, Slack, GitHub, Notion, Zoom, Jira/Atlassian) covering Jan–Jun 2026 with intentional gaps and a duplicate
- **Sites**: 5 sample sites (Building A, Building C, Warehouse 1, Site B, Old Annex)
- **Workflows**: none seeded, sample loaded dynamically in builder

---

Continue building on this project. The files are in the same folder. Maintain the dark theme, existing conventions, and localStorage data model when adding new features.
