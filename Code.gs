// ============================================================
// TaskFlow — Google Apps Script Backend
//
// HOW TO INSTALL:
// 1. Open your Google Sheet (or create a new one at sheets.google.com)
// 2. Click Extensions → Apps Script
// 3. Delete any existing code in Code.gs
// 4. Paste this entire file and click Save (Ctrl+S or ⌘+S)
// 5. Click Deploy → New deployment
//    - Deployment type: Web app
//    - Execute as: Me
//    - Who has access: Anyone
// 6. Click Deploy → click "Authorize access" if prompted
//    (you'll need to review and allow permissions for your own sheet)
// 7. Copy the Web app URL shown after deployment
// 8. Paste that URL into config.js as the value of sheetsUrl
//
// To update the script later: change code, then Deploy → Manage deployments
// → Edit → select "New version" → Deploy. The URL stays the same.
// ============================================================

const SPREADSHEET = SpreadsheetApp.getActiveSpreadsheet();

// ─────────────────────────────────────────────────────────────
// ENTRY POINTS
// Apps Script redirects POST to GET internally — both are handled.
// ─────────────────────────────────────────────────────────────

function doGet(e) {
  try {
    const raw = e && e.parameter && e.parameter.p;
    if (!raw) return respond({ error: 'No payload' });
    const { action, sheet, data, id } = JSON.parse(decodeURIComponent(raw));
    return respond(handleRequest(action, sheet, data, id));
  } catch (err) {
    return respond({ error: err.message });
  }
}

function doPost(e) {
  try {
    const { action, sheet, data, id } = JSON.parse(e.postData.contents);
    return respond(handleRequest(action, sheet, data, id));
  } catch (err) {
    return respond({ error: err.message });
  }
}

// ─────────────────────────────────────────────────────────────
// REQUEST ROUTER
// ─────────────────────────────────────────────────────────────

function handleRequest(action, sheetName, data, id) {
  if (!sheetName) return { error: 'Sheet name is required' };
  const sh = getOrCreateSheet(sheetName);

  if (action === 'get')    return { rows: getAll(sh) };
  if (action === 'upsert') return upsert(sh, data);
  if (action === 'delete') return del(sh, id);
  return { error: 'Unknown action: ' + action };
}

// ─────────────────────────────────────────────────────────────
// SHEET HELPERS
// ─────────────────────────────────────────────────────────────

function getOrCreateSheet(name) {
  return SPREADSHEET.getSheetByName(name) || SPREADSHEET.insertSheet(name);
}

// Read all data rows from a sheet, returning an array of objects.
function getAll(sh) {
  const lastRow = sh.getLastRow();
  const lastCol = sh.getLastColumn();
  if (lastRow < 2 || lastCol < 1) return [];

  const values  = sh.getRange(1, 1, lastRow, lastCol).getValues();
  const headers = values[0].map(String);
  const tz      = Session.getScriptTimeZone();

  return values.slice(1).map(function(row) {
    var obj = {};
    headers.forEach(function(h, i) {
      if (!h) return;
      var v = row[i];
      // Convert Sheets Date objects to YYYY-MM-DD strings
      if (v instanceof Date) {
        v = Utilities.formatDate(v, tz, 'yyyy-MM-dd');
      } else if (typeof v === 'string') {
        var t = v.trim();
        if (t === 'true')       v = true;
        else if (t === 'false') v = false;
        else if ((t.charAt(0) === '[' || t.charAt(0) === '{') && t.length > 1) {
          try { v = JSON.parse(t); } catch (_) {}
        }
      }
      obj[h] = v;
    });
    return obj;
  }).filter(function(r) {
    return r.id !== undefined && r.id !== '' && r.id !== null;
  });
}

// Create a new row or update an existing one (matched by id).
function upsert(sh, data) {
  if (!data || !data.id) return { error: 'Record must have an id field' };

  var headers = ensureHeaders(sh, data);
  var idCol   = headers.indexOf('id') + 1; // 1-based
  var lastRow = sh.getLastRow();

  // Check for existing row
  if (lastRow >= 2) {
    var existingIds = sh.getRange(2, idCol, lastRow - 1, 1).getValues().flat();
    for (var i = 0; i < existingIds.length; i++) {
      if (String(existingIds[i]) === String(data.id)) {
        var row = headers.map(function(h) { return serialize(data[h]); });
        sh.getRange(i + 2, 1, 1, row.length).setValues([row]);
        return { success: true };
      }
    }
  }

  // Append new row
  var newRow = headers.map(function(h) { return serialize(data[h]); });
  sh.appendRow(newRow);
  return { success: true };
}

// Delete a row by id.
function del(sh, id) {
  var lastRow = sh.getLastRow();
  if (lastRow < 2) return { success: false };
  var ids = sh.getRange(2, 1, lastRow - 1, 1).getValues().flat();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i]) === String(id)) {
      sh.deleteRow(i + 2);
      return { success: true };
    }
  }
  return { success: false };
}

// Ensure the header row exists; add new columns dynamically if data has new keys.
function ensureHeaders(sh, data) {
  var lastCol = sh.getLastColumn();
  var headers = lastCol > 0
    ? sh.getRange(1, 1, 1, lastCol).getValues()[0].map(String).filter(Boolean)
    : [];

  if (headers.length === 0) {
    // First write: build headers with id first
    headers = ['id'].concat(Object.keys(data).filter(function(k) { return k !== 'id'; }));
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
    sh.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sh.setFrozenRows(1);
    return headers;
  }

  // Add any new columns introduced by this record
  var newKeys = Object.keys(data).filter(function(k) {
    return k !== 'id' && headers.indexOf(k) === -1;
  });
  if (newKeys.length > 0) {
    headers = headers.concat(newKeys);
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
    sh.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }
  return headers;
}

// Convert a JS value to a spreadsheet-safe format.
function serialize(v) {
  if (v === null || v === undefined) return '';
  if (typeof v === 'boolean') return String(v);
  if (Array.isArray(v) || (typeof v === 'object' && !(v instanceof Date))) {
    return JSON.stringify(v);
  }
  return v;
}

// Return a JSON response (CORS headers are handled by Apps Script automatically).
function respond(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─────────────────────────────────────────────────────────────
// TEST FUNCTION
// Run this manually in the Apps Script editor to verify the script works:
// Select "testScript" from the function dropdown → click Run
// ─────────────────────────────────────────────────────────────

function testScript() {
  // Write a test row
  var writeResult = handleRequest('upsert', 'TestSheet', { id: 'test-1', name: 'Hello', value: 42 });
  Logger.log('Write: ' + JSON.stringify(writeResult));

  // Read it back
  var readResult = handleRequest('get', 'TestSheet', null, null);
  Logger.log('Read:  ' + JSON.stringify(readResult));

  // Delete it
  var delResult = handleRequest('delete', 'TestSheet', null, 'test-1');
  Logger.log('Delete: ' + JSON.stringify(delResult));

  Logger.log('Test passed! ✓ Delete the TestSheet tab from your spreadsheet.');
}
