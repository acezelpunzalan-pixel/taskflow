// ============================================================
// supabase.js — TaskFlow Data Layer
// Loaded by every page via <script src="supabase.js">
// Requires Supabase JS v2 CDN loaded BEFORE this file
// ============================================================

// ── CONFIG — reads from config.js (window.TASKFLOW_CONFIG) ──────────────
// Do NOT edit credentials here. Edit config.js instead.
const _cfg = window.TASKFLOW_CONFIG || {};
const SUPABASE_URL      = _cfg.supabaseUrl     || 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = _cfg.supabaseAnonKey || 'YOUR_SUPABASE_ANON_KEY';
const STORAGE_BUCKET    = _cfg.storageBucket   || 'taskflow';

// ── CLIENT ────────────────────────────────────────────────────
const _sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── HELPERS ───────────────────────────────────────────────────
function _log(err, ctx) {
  if (err) console.error(`[DB] ${ctx}:`, err.message);
}

function _toast(msg, type = 'error') {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.className = `show ${type}`;
  clearTimeout(_toast._t);
  _toast._t = setTimeout(() => el.className = '', 3000);
}

// ── DB OBJECT — global, used by all pages ──────────────────────
window.DB = {

  // ────────────────────────────────────────────────────────────
  // SITES
  // ────────────────────────────────────────────────────────────
  async getSites() {
    const { data, error } = await _sb.from('sites').select('*').order('name');
    _log(error, 'getSites');
    return data || [];
  },

  async saveSite(site) {
    const record = { ...site };
    delete record.id; // let upsert handle; for new records no id
    if (site.id) record.id = site.id;
    const { data, error } = await _sb.from('sites').upsert(record, { onConflict: 'id' }).select().single();
    _log(error, 'saveSite');
    return { data, error };
  },

  async deleteSite(id) {
    const { error } = await _sb.from('sites').delete().eq('id', id);
    _log(error, 'deleteSite');
    return { error };
  },

  async getSiteNames() {
    const { data, error } = await _sb.from('sites').select('name').eq('status', 'active').order('name');
    _log(error, 'getSiteNames');
    return data ? data.map(r => r.name) : [];
  },

  // ────────────────────────────────────────────────────────────
  // VENDORS
  // ────────────────────────────────────────────────────────────
  async getVendors() {
    const { data, error } = await _sb.from('vendors').select('*').order('name');
    _log(error, 'getVendors');
    return data || [];
  },

  async saveVendor(vendor) {
    const record = { ...vendor };
    if (!record.id) delete record.id;
    const { data, error } = await _sb.from('vendors').upsert(record, { onConflict: 'id' }).select().single();
    _log(error, 'saveVendor');
    return { data, error };
  },

  async deleteVendor(id) {
    const { error } = await _sb.from('vendors').delete().eq('id', id);
    _log(error, 'deleteVendor');
    return { error };
  },

  async getVendorNames() {
    const { data, error } = await _sb.from('vendors').select('name').eq('status', 'Active').order('name');
    _log(error, 'getVendorNames');
    return data ? data.map(r => r.name) : [];
  },

  // ────────────────────────────────────────────────────────────
  // ROLES
  // ────────────────────────────────────────────────────────────
  async getRoles() {
    const { data, error } = await _sb.from('roles').select('*').order('name');
    _log(error, 'getRoles');
    return data || [];
  },

  async saveRole(role) {
    const record = { ...role };
    if (!record.id) delete record.id;
    const { data, error } = await _sb.from('roles').upsert(record, { onConflict: 'id' }).select().single();
    _log(error, 'saveRole');
    return { data, error };
  },

  async deleteRole(id) {
    const { error } = await _sb.from('roles').delete().eq('id', id);
    _log(error, 'deleteRole');
    return { error };
  },

  // ────────────────────────────────────────────────────────────
  // USERS
  // ────────────────────────────────────────────────────────────
  async getUsers() {
    const { data, error } = await _sb.from('users').select('*').order('name');
    _log(error, 'getUsers');
    return data || [];
  },

  async saveUser(user) {
    const record = { ...user };
    if (!record.id) delete record.id;
    const { data, error } = await _sb.from('users').upsert(record, { onConflict: 'id' }).select().single();
    _log(error, 'saveUser');
    return { data, error };
  },

  async deleteUser(id) {
    const { error } = await _sb.from('users').delete().eq('id', id);
    _log(error, 'deleteUser');
    return { error };
  },

  // ────────────────────────────────────────────────────────────
  // TASKS
  // ────────────────────────────────────────────────────────────
  async getTasks() {
    const { data, error } = await _sb.from('tasks').select('*').order('created_at', { ascending: false });
    _log(error, 'getTasks');
    return data || [];
  },

  async saveTask(task) {
    const record = { ...task };
    if (!record.id) delete record.id;
    const { data, error } = await _sb.from('tasks').upsert(record, { onConflict: 'id' }).select().single();
    _log(error, 'saveTask');
    return { data, error };
  },

  async deleteTask(id) {
    const { error } = await _sb.from('tasks').delete().eq('id', id);
    _log(error, 'deleteTask');
    return { error };
  },

  // ────────────────────────────────────────────────────────────
  // FIELD VISITS
  // ────────────────────────────────────────────────────────────
  async getVisits() {
    const { data, error } = await _sb.from('visits').select('*').order('date', { ascending: false });
    _log(error, 'getVisits');
    return data || [];
  },

  async saveVisit(visit) {
    const record = { ...visit };
    if (!record.id) delete record.id;
    const { data, error } = await _sb.from('visits').upsert(record, { onConflict: 'id' }).select().single();
    _log(error, 'saveVisit');
    return { data, error };
  },

  async deleteVisit(id) {
    const { error } = await _sb.from('visits').delete().eq('id', id);
    _log(error, 'deleteVisit');
    return { error };
  },

  // ────────────────────────────────────────────────────────────
  // INVOICES
  // ────────────────────────────────────────────────────────────
  async getInvoices() {
    const { data, error } = await _sb.from('invoices').select('*').order('created_at', { ascending: false });
    _log(error, 'getInvoices');
    return data || [];
  },

  async saveInvoice(invoice) {
    const record = { ...invoice };
    if (!record.id) delete record.id;
    const { data, error } = await _sb.from('invoices').upsert(record, { onConflict: 'id' }).select().single();
    _log(error, 'saveInvoice');
    return { data, error };
  },

  async deleteInvoice(id) {
    // Also delete associated attachment if any
    const inv = await _sb.from('invoices').select('attachment_path').eq('id', id).single();
    if (inv.data?.attachment_path) {
      await _sb.storage.from(STORAGE_BUCKET).remove([inv.data.attachment_path]);
    }
    const { error } = await _sb.from('invoices').delete().eq('id', id);
    _log(error, 'deleteInvoice');
    // Also clean up attachments table
    await _sb.from('attachments').delete().eq('entity_type', 'invoice').eq('entity_id', id);
    return { error };
  },

  // ────────────────────────────────────────────────────────────
  // DEVICES
  // ────────────────────────────────────────────────────────────
  async getDevices() {
    const { data, error } = await _sb.from('devices').select('*').order('name');
    _log(error, 'getDevices');
    return data || [];
  },

  async saveDevice(device) {
    const record = { ...device };
    if (!record.id) delete record.id;
    const { data, error } = await _sb.from('devices').upsert(record, { onConflict: 'id' }).select().single();
    _log(error, 'saveDevice');
    return { data, error };
  },

  async deleteDevice(id) {
    const dev = await _sb.from('devices').select('attachment_path').eq('id', id).single();
    if (dev.data?.attachment_path) {
      await _sb.storage.from(STORAGE_BUCKET).remove([dev.data.attachment_path]);
    }
    const { error } = await _sb.from('devices').delete().eq('id', id);
    _log(error, 'deleteDevice');
    await _sb.from('attachments').delete().eq('entity_type', 'device').eq('entity_id', id);
    return { error };
  },

  // ────────────────────────────────────────────────────────────
  // PROJECTS
  // ────────────────────────────────────────────────────────────
  async getProjects() {
    const { data, error } = await _sb.from('projects').select('*').order('created_at', { ascending: false });
    _log(error, 'getProjects');
    return data || [];
  },

  async saveProject(project) {
    const record = { ...project };
    if (!record.id) delete record.id;
    const { data, error } = await _sb.from('projects').upsert(record, { onConflict: 'id' }).select().single();
    _log(error, 'saveProject');
    return { data, error };
  },

  async deleteProject(id) {
    const { error } = await _sb.from('projects').delete().eq('id', id);
    _log(error, 'deleteProject');
    return { error };
  },

  // ────────────────────────────────────────────────────────────
  // WORKFLOWS
  // ────────────────────────────────────────────────────────────
  async getWorkflows() {
    const { data, error } = await _sb.from('workflows').select('*').order('name');
    _log(error, 'getWorkflows');
    return data || [];
  },

  async saveWorkflow(workflow) {
    const record = { ...workflow };
    if (!record.id) delete record.id;
    const { data, error } = await _sb.from('workflows').upsert(record, { onConflict: 'id' }).select().single();
    _log(error, 'saveWorkflow');
    return { data, error };
  },

  async deleteWorkflow(id) {
    const { error } = await _sb.from('workflows').delete().eq('id', id);
    _log(error, 'deleteWorkflow');
    return { error };
  },

  // ────────────────────────────────────────────────────────────
  // ATTACHMENTS (multi-file)
  // ────────────────────────────────────────────────────────────
  async getAttachments(entityType, entityId) {
    const { data, error } = await _sb
      .from('attachments')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('uploaded_at', { ascending: false });
    _log(error, 'getAttachments');
    return data || [];
  },

  async saveAttachment(record) {
    const { data, error } = await _sb.from('attachments').insert(record).select().single();
    _log(error, 'saveAttachment');
    return { data, error };
  },

  async deleteAttachment(id, filePath) {
    if (filePath) await _sb.storage.from(STORAGE_BUCKET).remove([filePath]);
    const { error } = await _sb.from('attachments').delete().eq('id', id);
    _log(error, 'deleteAttachment');
    return { error };
  },

  // ────────────────────────────────────────────────────────────
  // FILE STORAGE
  // ────────────────────────────────────────────────────────────

  /**
   * Upload a file to Supabase Storage
   * @param {File} file - the File object from an <input type="file">
   * @param {string} folder - e.g. 'invoices', 'devices'
   * @param {string} entityId - the record UUID (for path namespacing)
   * @returns {{ path: string, url: string, error: object|null }}
   */
  async uploadFile(file, folder, entityId) {
    const ext  = file.name.split('.').pop();
    const path = `${folder}/${entityId}/${Date.now()}-${file.name.replace(/[^a-z0-9._-]/gi, '_')}`;
    const { data, error } = await _sb.storage
      .from(STORAGE_BUCKET)
      .upload(path, file, { upsert: true, contentType: file.type });
    if (error) { _log(error, 'uploadFile'); return { path: null, url: null, error }; }
    const { data: urlData } = _sb.storage.from(STORAGE_BUCKET).getPublicUrl(path);
    return { path, url: urlData.publicUrl, error: null };
  },

  /**
   * Get the public URL for a stored file
   * @param {string} path - storage path returned by uploadFile
   */
  getFileUrl(path) {
    if (!path) return null;
    const { data } = _sb.storage.from(STORAGE_BUCKET).getPublicUrl(path);
    return data.publicUrl;
  },

  /**
   * Delete a file from storage
   * @param {string} path - storage path
   */
  async deleteFile(path) {
    if (!path) return;
    const { error } = await _sb.storage.from(STORAGE_BUCKET).remove([path]);
    _log(error, 'deleteFile');
    return { error };
  },

  // ────────────────────────────────────────────────────────────
  // AUTH
  // ────────────────────────────────────────────────────────────
  async signIn(email, password) {
    const { data, error } = await _sb.auth.signInWithPassword({ email, password });
    _log(error, 'signIn');
    return { data, error };
  },

  async signOut() {
    const { error } = await _sb.auth.signOut();
    _log(error, 'signOut');
    return { error };
  },

  async getSession() {
    const { data: { session }, error } = await _sb.auth.getSession();
    _log(error, 'getSession');
    return session;
  },

  async getCurrentUserProfile() {
    const session = await this.getSession();
    if (!session) return null;
    const { data, error } = await _sb
      .from('users')
      .select('*')
      .eq('email', session.user.email)
      .maybeSingle();
    _log(error, 'getCurrentUserProfile');
    return data;
  },

  // ────────────────────────────────────────────────────────────
  // CONFIG CHECK
  // ────────────────────────────────────────────────────────────
  isConfigured() {
    return SUPABASE_URL !== 'YOUR_SUPABASE_URL' && SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY';
  },
};

// ── LOCALSTORAGE FALLBACKS ─────────────────────────────────────
// When Supabase is not configured (or localOnly: true), all DB.*
// methods transparently use localStorage instead.
if (!DB.isConfigured()) {
  const _lsGet  = (k, d=[]) => { try { return JSON.parse(localStorage.getItem(k) || 'null') ?? d; } catch { return d; } };
  const _lsSave = (k, v)    => localStorage.setItem(k, JSON.stringify(v));
  const _lsUid  = ()        => (crypto.randomUUID ? crypto.randomUUID() : 'ls-' + Math.random().toString(36).slice(2,11) + Date.now().toString(36));
  const _upsert = (arr, rec) => { const i = arr.findIndex(r => r.id === rec.id); if (i >= 0) arr[i] = { ...arr[i], ...rec }; else arr.push(rec); return arr; };
  const _ok     = d => ({ data: d, error: null });
  const _err0   = () => ({ error: null });
  const _now    = () => new Date().toISOString();

  // Sites
  DB.getSites     = async () => _lsGet('tf_sites').sort((a,b) => (a.name||'').localeCompare(b.name||''));
  DB.saveSite     = async s  => { if (!s.id) s.id = _lsUid(); _lsSave('tf_sites', _upsert(_lsGet('tf_sites'), s)); return _ok(s); };
  DB.deleteSite   = async id => { _lsSave('tf_sites', _lsGet('tf_sites').filter(r => r.id !== id)); return _err0(); };
  DB.getSiteNames = async () => _lsGet('tf_sites').filter(r => r.status === 'active').map(r => r.name).sort();

  // Vendors
  DB.getVendors     = async () => _lsGet('tf_vendors').sort((a,b) => (a.name||'').localeCompare(b.name||''));
  DB.saveVendor     = async v  => { if (!v.id) v.id = _lsUid(); _lsSave('tf_vendors', _upsert(_lsGet('tf_vendors'), v)); return _ok(v); };
  DB.deleteVendor   = async id => { _lsSave('tf_vendors', _lsGet('tf_vendors').filter(r => r.id !== id)); return _err0(); };
  DB.getVendorNames = async () => _lsGet('tf_vendors').filter(r => r.status === 'Active').map(r => r.name).sort();

  // Roles
  DB.getRoles    = async () => _lsGet('tf_roles').sort((a,b) => (a.name||'').localeCompare(b.name||''));
  DB.saveRole    = async r  => { if (!r.id) r.id = _lsUid(); _lsSave('tf_roles', _upsert(_lsGet('tf_roles'), r)); return _ok(r); };
  DB.deleteRole  = async id => { _lsSave('tf_roles', _lsGet('tf_roles').filter(r => r.id !== id)); return _err0(); };

  // Users (team roster — separate from tf_current_user session)
  DB.getUsers    = async () => _lsGet('tf_users_db').sort((a,b) => (a.name||'').localeCompare(b.name||''));
  DB.saveUser    = async u  => { if (!u.id) u.id = _lsUid(); _lsSave('tf_users_db', _upsert(_lsGet('tf_users_db'), u)); return _ok(u); };
  DB.deleteUser  = async id => { _lsSave('tf_users_db', _lsGet('tf_users_db').filter(r => r.id !== id)); return _err0(); };

  // Tasks
  DB.getTasks    = async () => _lsGet('taskflow_tasks').sort((a,b) => (b.created||0) - (a.created||0));
  DB.saveTask    = async t  => { if (!t.id) t.id = _lsUid(); _lsSave('taskflow_tasks', _upsert(_lsGet('taskflow_tasks'), t)); return _ok(t); };
  DB.deleteTask  = async id => { _lsSave('taskflow_tasks', _lsGet('taskflow_tasks').filter(r => r.id !== id)); return _err0(); };

  // Visits (Field Work)
  DB.getVisits   = async () => _lsGet('taskflow_visits').sort((a,b) => (b.date||'').localeCompare(a.date||''));
  DB.saveVisit   = async v  => { if (!v.id) v.id = _lsUid(); _lsSave('taskflow_visits', _upsert(_lsGet('taskflow_visits'), v)); return _ok(v); };
  DB.deleteVisit = async id => { _lsSave('taskflow_visits', _lsGet('taskflow_visits').filter(r => r.id !== id)); return _err0(); };

  // Invoices
  DB.getInvoices    = async () => _lsGet('tf_invoices').sort((a,b) => (b.created||0) - (a.created||0));
  DB.saveInvoice    = async i  => { if (!i.id) i.id = _lsUid(); _lsSave('tf_invoices', _upsert(_lsGet('tf_invoices'), i)); return _ok(i); };
  DB.deleteInvoice  = async id => { _lsSave('tf_invoices', _lsGet('tf_invoices').filter(r => r.id !== id)); return _err0(); };

  // Devices
  DB.getDevices   = async () => _lsGet('tf_devices').sort((a,b) => (a.name||'').localeCompare(b.name||''));
  DB.saveDevice   = async d  => { if (!d.id) d.id = _lsUid(); _lsSave('tf_devices', _upsert(_lsGet('tf_devices'), d)); return _ok(d); };
  DB.deleteDevice = async id => { _lsSave('tf_devices', _lsGet('tf_devices').filter(r => r.id !== id)); return _err0(); };

  // Projects
  DB.getProjects    = async () => _lsGet('tf_projects').sort((a,b) => (b.created_at||'').localeCompare(a.created_at||''));
  DB.saveProject    = async p  => { if (!p.id) { p.id = _lsUid(); p.created_at = _now(); } p.updated_at = _now(); _lsSave('tf_projects', _upsert(_lsGet('tf_projects'), p)); return _ok(p); };
  DB.deleteProject  = async id => { _lsSave('tf_projects', _lsGet('tf_projects').filter(r => r.id !== id)); return _err0(); };

  // Workflows
  DB.getWorkflows    = async () => _lsGet('tf_workflows').sort((a,b) => (a.name||'').localeCompare(b.name||''));
  DB.saveWorkflow    = async w  => { if (!w.id) w.id = _lsUid(); _lsSave('tf_workflows', _upsert(_lsGet('tf_workflows'), w)); return _ok(w); };
  DB.deleteWorkflow  = async id => { _lsSave('tf_workflows', _lsGet('tf_workflows').filter(r => r.id !== id)); return _err0(); };

  // Attachments / file upload — no-op in local mode
  DB.getAttachments  = async () => [];
  DB.saveAttachment  = async () => _ok(null);
  DB.deleteAttachment = async () => _err0();
  DB.uploadFile      = async () => ({ path: null, url: null, error: { message: 'File uploads require Supabase. Set localOnly: false in config.js to enable.' } });
  DB.getFileUrl      = () => null;
  DB.deleteFile      = async () => {};
}

// ── GOOGLE SHEETS ADAPTER ──────────────────────────────────────
// When sheetsUrl is set in config.js, all DB.* methods route to
// the Google Apps Script web app instead of Supabase or localStorage.
(function () {
  const _gsUrl = (_cfg.sheetsUrl || '').trim();
  if (!_gsUrl || _gsUrl === 'YOUR_APPS_SCRIPT_URL') return;

  async function _gsReq(action, sheet, data, id) {
    try {
      const payload = encodeURIComponent(JSON.stringify({ action, sheet, data: data || null, id: id || null }));
      const res = await fetch(_gsUrl + '?p=' + payload);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return await res.json();
    } catch (err) {
      console.error('[Sheets]', err);
      return { error: err.message };
    }
  }

  const _gsGet    = async sheet       => { const r = await _gsReq('get', sheet); return r.rows || []; };
  const _gsUpsert = async (sheet, d)  => {
    if (!d.id) d.id = (crypto.randomUUID ? crypto.randomUUID() : 'gs-' + Date.now().toString(36) + Math.random().toString(36).slice(2,7));
    const r = await _gsReq('upsert', sheet, d);
    return { data: d, error: r.error ? { message: r.error } : null };
  };
  const _gsDel    = async (sheet, id) => { const r = await _gsReq('delete', sheet, null, id); return { error: r.error ? { message: r.error } : null }; };

  DB.getSites      = async () => (await _gsGet('Sites')).sort((a,b) => (a.name||'').localeCompare(b.name||''));
  DB.saveSite      = async s  => _gsUpsert('Sites', s);
  DB.deleteSite    = async id => _gsDel('Sites', id);
  DB.getSiteNames  = async () => (await _gsGet('Sites')).filter(r => r.status === 'active').map(r => r.name).sort();

  DB.getVendors     = async () => (await _gsGet('Vendors')).sort((a,b) => (a.name||'').localeCompare(b.name||''));
  DB.saveVendor     = async v  => _gsUpsert('Vendors', v);
  DB.deleteVendor   = async id => _gsDel('Vendors', id);
  DB.getVendorNames = async () => (await _gsGet('Vendors')).filter(r => r.status === 'Active').map(r => r.name).sort();

  DB.getRoles    = async () => (await _gsGet('Roles')).sort((a,b) => (a.name||'').localeCompare(b.name||''));
  DB.saveRole    = async r  => _gsUpsert('Roles', r);
  DB.deleteRole  = async id => _gsDel('Roles', id);

  DB.getUsers    = async () => (await _gsGet('Users')).sort((a,b) => (a.name||'').localeCompare(b.name||''));
  DB.saveUser    = async u  => _gsUpsert('Users', u);
  DB.deleteUser  = async id => _gsDel('Users', id);

  DB.getTasks    = async () => (await _gsGet('Tasks')).sort((a,b) => (b.created||0) - (a.created||0));
  DB.saveTask    = async t  => _gsUpsert('Tasks', t);
  DB.deleteTask  = async id => _gsDel('Tasks', id);

  DB.getVisits   = async () => (await _gsGet('Visits')).sort((a,b) => (b.date||'').localeCompare(a.date||''));
  DB.saveVisit   = async v  => _gsUpsert('Visits', v);
  DB.deleteVisit = async id => _gsDel('Visits', id);

  DB.getInvoices   = async () => (await _gsGet('Invoices')).sort((a,b) => (b.created||0) - (a.created||0));
  DB.saveInvoice   = async i  => _gsUpsert('Invoices', i);
  DB.deleteInvoice = async id => _gsDel('Invoices', id);

  DB.getDevices   = async () => (await _gsGet('Devices')).sort((a,b) => (a.name||'').localeCompare(b.name||''));
  DB.saveDevice   = async d  => _gsUpsert('Devices', d);
  DB.deleteDevice = async id => _gsDel('Devices', id);

  DB.getProjects   = async () => (await _gsGet('Projects')).sort((a,b) => (b.created_at||'').localeCompare(a.created_at||''));
  DB.saveProject   = async p  => _gsUpsert('Projects', p);
  DB.deleteProject = async id => _gsDel('Projects', id);

  DB.getWorkflows   = async () => (await _gsGet('Workflows')).sort((a,b) => (a.name||'').localeCompare(b.name||''));
  DB.saveWorkflow   = async w  => _gsUpsert('Workflows', w);
  DB.deleteWorkflow = async id => _gsDel('Workflows', id);

  // Attachments are not supported in Sheets mode (no file storage)
  DB.getAttachments   = async () => [];
  DB.uploadFile       = async () => ({ path: null, url: null, error: { message: 'File uploads are not supported in Google Sheets mode.' } });
  DB.getFileUrl       = () => null;
  DB.deleteFile       = async () => {};

  console.log('[TaskFlow] Google Sheets mode active.');
})();

// ── WARNING BANNER ─────────────────────────────────────────────
// Only shown when Supabase is wanted but not configured.
document.addEventListener('DOMContentLoaded', () => {
  const cfg   = window.TASKFLOW_CONFIG || {};
  const gsUrl = (cfg.sheetsUrl || '').trim();
  const gsActive = gsUrl && gsUrl !== 'YOUR_APPS_SCRIPT_URL';
  if (!cfg.localOnly && !gsActive && !DB.isConfigured()) {
    const banner = document.createElement('div');
    banner.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:9999;background:#f59e0b;color:#1a1d2e;text-align:center;padding:8px 16px;font-size:0.82rem;font-weight:600;font-family:system-ui';
    banner.textContent = '⚠️ No database configured — open config.js and set sheetsUrl, localOnly, or Supabase credentials.';
    document.body.prepend(banner);
  }
});
