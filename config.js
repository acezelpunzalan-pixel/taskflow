// ============================================================
// config.js — TaskFlow Configuration
//
// Pick ONE storage mode and fill in the required value.
// The other modes are shown for reference but are inactive.
// ============================================================

window.TASKFLOW_CONFIG = {

  // ── MODE 1: Google Sheets (recommended — shared across all users) ──
  // Paste your Apps Script deployment URL here (see SETUP.md → Google Sheets).
  sheetsUrl: 'https://script.google.com/macros/s/AKfycbxEPH4prcbAfo_6i5T5SckDhrSg3t94qDoR-_XPfAcDW1BZwQ0YNzEqVOoF0exlR_Y/exec',

  // ── MODE 2: Local browser storage only (no setup needed) ──────────
  // Set to true and remove sheetsUrl to run entirely in the browser.
  localOnly: false,

  // ── MODE 3: Supabase (PostgreSQL — advanced) ───────────────────────
  // Fill in both values below and set localOnly: false, sheetsUrl: null.
  supabaseUrl:     'YOUR_SUPABASE_URL',
  supabaseAnonKey: 'YOUR_SUPABASE_ANON_KEY',

  // ── Shared settings ────────────────────────────────────────────────
  storageBucket: 'taskflow',   // Supabase Storage bucket name (Mode 3 only)
  appName:       'TaskFlow',
};
