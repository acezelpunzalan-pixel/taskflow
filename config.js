// ============================================================
// config.js — TaskFlow Configuration
//
// Pick ONE storage mode and fill in the required value.
// The other modes are shown for reference but are inactive.
// ============================================================

window.TASKFLOW_CONFIG = {

  // ── MODE 1: Google Sheets (recommended — shared across all users) ──
  // Paste your Apps Script deployment URL here (see SETUP.md → Google Sheets).
  sheetsUrl: null,

  // ── MODE 2: Local browser storage only (no setup needed) ──────────
  // Set to true and remove sheetsUrl to run entirely in the browser.
  localOnly: true,

  // ── MODE 3: Supabase (PostgreSQL — advanced) ───────────────────────
  // Fill in both values below and set localOnly: false, sheetsUrl: null.
  supabaseUrl:     'YOUR_SUPABASE_URL',
  supabaseAnonKey: 'YOUR_SUPABASE_ANON_KEY',

  // ── Shared settings ────────────────────────────────────────────────
  storageBucket: 'taskflow',   // Supabase Storage bucket name (Mode 3 only)
  appName:       'TaskFlow',
};
