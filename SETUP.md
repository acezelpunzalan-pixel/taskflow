# TaskFlow — Deployment Guide

---

## OPTION A — Google Sheets (recommended for most teams)

Uses your Google Sheet as the database. Free, no account setup beyond a Google account, and all your data lives in a spreadsheet you can open and edit directly.

### Step 1 — Create a Google Sheet
1. Go to **https://sheets.google.com** and create a new blank spreadsheet
2. Name it "TaskFlow Data" (or anything you like)
3. Leave it open — you'll need it in Step 3

### Step 2 — Open Apps Script
1. In your Google Sheet, click **Extensions → Apps Script**
2. A new tab opens with the script editor
3. Delete all the existing code (select all, delete)
4. Open **`Code.gs`** from your TaskFlow files and copy the entire contents
5. Paste it into the script editor
6. Click **Save** (the floppy disk icon or Ctrl+S / ⌘+S)
7. Name the project "TaskFlow" when prompted

### Step 3 — Deploy the script
1. Click **Deploy → New deployment**
2. Click the gear icon next to "Type" and choose **Web app**
3. Set:
   - **Description**: `TaskFlow API`
   - **Execute as**: Me
   - **Who has access**: Anyone
4. Click **Deploy**
5. If prompted, click **Authorize access** → choose your Google account → click **Allow**
6. Copy the **Web app URL** (it looks like `https://script.google.com/macros/s/AKfycb.../exec`)

### Step 4 — Add the URL to config.js
1. Open `config.js` in a text editor
2. Replace `YOUR_APPS_SCRIPT_URL` with the URL you just copied:
   ```js
   sheetsUrl: 'https://script.google.com/macros/s/AKfycb.../exec',
   ```
3. Make sure `localOnly: false`
4. Save the file

### Step 5 — Test it
1. Open your TaskFlow app in a browser
2. Log in and add a Site in Admin → Sites
3. Go to your Google Sheet — you should see a "Sites" tab appear with the data

### Updating the script later
If you ever update `Code.gs`, go to Apps Script → Deploy → **Manage deployments** → click the pencil icon → select "New version" → **Deploy**. The URL stays the same, no need to update `config.js`.

### Notes
- Each module gets its own sheet tab (Sites, Invoices, Tasks, etc.) created automatically
- Data in the sheet is human-readable — you can edit cells directly if needed
- All users of the app share the same Google Sheet (data is shared across browsers)
- File attachments are not supported in Google Sheets mode

---

## OPTION B — Run without a database (browser only)

Everything stored locally in the browser. Good for a single person or demo.

In `config.js`, set `localOnly: true` and remove or blank out `sheetsUrl`.
The login page shows a "Who are you?" form — no passwords needed.

**Limitation:** data doesn't sync between devices or users.

---

## OPTION C — Connect Supabase (PostgreSQL — advanced)

In `config.js`, set `localOnly: false`, leave `sheetsUrl` blank, and fill in your Supabase credentials.

### Supabase (Database) + Netlify (Hosting)

---

## PART 1 — Set Up Supabase (Database)

### Step 1 — Create a Supabase account
1. Go to **https://supabase.com** and click **Start your project**
2. Sign up with GitHub or email
3. Once logged in, click **New project**
4. Fill in:
   - **Name**: `taskflow` (or anything you like)
   - **Database Password**: choose a strong password and save it somewhere safe
   - **Region**: pick the one closest to you
5. Click **Create new project** — it takes about 1–2 minutes to provision

---

### Step 2 — Run the database schema
1. In your Supabase project, click **SQL Editor** in the left sidebar
2. Click **New query**
3. Open `schema.sql` from your TaskFlow files
4. Copy the entire contents and paste it into the SQL editor
5. Click **Run** (or press `Ctrl+Enter`)
6. You should see "Success. No rows returned" — that means all tables were created

---

### Step 3 — Create the storage bucket
1. In the left sidebar, click **Storage**
2. Click **New bucket**
3. Set:
   - **Name**: `taskflow` (must be exactly this)
   - **Public bucket**: toggle **ON**
4. Click **Save**

The storage policies in `schema.sql` already handle permissions — no extra config needed.

---

### Step 4 — Get your API keys
1. In the left sidebar, click **Project Settings** (gear icon at the bottom)
2. Click **API**
3. You need two values:
   - **Project URL** — looks like `https://xxxxxxxxxxxx.supabase.co`
   - **anon public** key — a long string starting with `eyJ...`
4. Keep this browser tab open — you'll need these in the next step

---

### Step 5 — Paste your keys into config.js
1. Open `config.js` in a text editor (Notepad, VS Code, etc.)
2. Find these two lines:
   ```js
   supabaseUrl:     'YOUR_SUPABASE_URL',
   supabaseAnonKey: 'YOUR_SUPABASE_ANON_KEY',
   ```
3. Replace them with your actual values:
   ```js
   supabaseUrl:     'https://xxxxxxxxxxxx.supabase.co',
   supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
   ```
4. Save the file

> The yellow warning banner on every page will disappear once these are filled in correctly.

---

---

## PART 2 — Set Up Authentication (Login)

### Step 6 — Enable Email Auth in Supabase
1. In your Supabase project, click **Authentication** in the left sidebar
2. Click **Providers**
3. Make sure **Email** is enabled (it is by default)
4. Under **Email**, you can optionally turn off "Confirm email" for easier testing — toggle **"Enable email confirmations"** OFF if you don't want users to verify their email first

---

### Step 7 — Create your Admin user
1. In the left sidebar, click **Authentication → Users**
2. Click **Add user → Create new user**
3. Enter your email and a password
4. Click **Create user**
5. Now go to **Admin** page in TaskFlow → Users tab
6. Add a user record with the **same email address** and set Role to **Admin**
   - This links your login account to your app profile

---

### Step 8 — Add more users
For each person who needs access:
1. Supabase → Authentication → Users → **Invite user** (sends them an email with a magic link to set their password)
   - OR: Add user → Create new user (set the password yourself and share it with them)
2. In TaskFlow Admin → Users tab, add a user record with their email and assign a Role:
   - **Admin** — full access, sees all pages
   - **Reviewer** — can view everything and approve invoices
   - **Field Staff** — can log tasks and field visits
   - **Viewer** — read-only access

> Role-based nav: non-Admin users will not see the Admin page link in the sidebar. Field Staff and Viewers also won't see the Workflow page.

---

## PART 3 — Deploy to Netlify

### Step 6 — Create a Netlify account
1. Go to **https://netlify.com** and click **Sign up**
2. Sign up with GitHub or email (free plan is more than enough)

---

### Step 7 — Deploy your files
The easiest method is drag-and-drop — no GitHub or command line needed.

1. Log in to Netlify
2. On the dashboard, you'll see a box that says **"drag and drop your site folder here"**
3. Open File Explorer and navigate to your TaskFlow folder (the one containing all the `.html` files, `config.js`, and `supabase.js`)
4. Drag the **entire folder** and drop it into that Netlify box
5. Netlify will upload and deploy in about 30 seconds
6. You'll get a URL like `https://amazing-name-12345.netlify.app`

---

### Step 8 — Set a custom site name (optional)
1. In Netlify, go to **Site configuration → General**
2. Under **Site details**, click **Change site name**
3. Enter something like `taskflow-ace` → your URL becomes `https://taskflow-ace.netlify.app`

---

### Step 9 — Test it
1. Open your Netlify URL in a browser
2. Go to **Admin** — you should see data loading from Supabase (no more yellow warning banner)
3. Try adding a site, vendor, or project — it should persist across page refreshes and different devices

---

## PART 3 — Updating the site later

Whenever you make changes to any `.html` or `.js` files:

1. Go to your Netlify dashboard → your site
2. Click **Deploys** in the top nav
3. Drag your updated folder onto the **"drag and drop to deploy"** area
4. Netlify redeploys in seconds — your live URL updates automatically

---

## File Checklist

Make sure all of these are in the folder you upload to Netlify:

```
admin.html
branches.html
capex.html
devices.html
fieldwork.html
index.html
invoices.html
login.html
opex.html
projects.html
task-dashboard.html
workflow.html
config.js          ← EDIT THIS: paste your Supabase URL and anon key here
supabase.js        ← data layer (no changes needed)
auth.js            ← session guard (no changes needed)
schema.sql         ← not served publicly, just keep for your records
```

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Want to use a real database | Set `localOnly: false` in `config.js` and fill in your Supabase credentials |
| Data not saving (Supabase mode) | Open browser DevTools → Console — look for a red Supabase error message |
| Storage uploads fail | Make sure the bucket name is exactly `taskflow` and Public is ON |
| Page shows blank / broken | Make sure `config.js`, `supabase.js`, and `auth.js` are in the same folder as the HTML files |
| Redirected to login on every page | Supabase keys are wrong or not filled in — check `config.js` |
| "Invalid login credentials" | Wrong email or password — reset it in Supabase → Authentication → Users |
| Logged-in but no name/role shows | Add a user record in Admin → Users with the same email as your Supabase auth account |
| Changes not showing on live site | Re-deploy by dragging the folder to Netlify again |

---

## Security Note

The `anon` key is safe to expose in frontend code — it's designed for this. It only has the permissions you defined in `schema.sql` (read/write to your tables). Never paste your **service_role** key into frontend code.
