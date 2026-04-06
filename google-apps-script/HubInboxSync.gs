/**
 * RPG Hub — Inbox Sync
 * =====================================================================
 * Runs every 15 minutes via a time-driven trigger.
 * Pulls tasks from a Google Tasks list and labelled Gmail threads
 * into the Hub inbox so you can triage them from the app.
 *
 * ── SETUP ─────────────────────────────────────────────────────────────
 * 1. Open this script at script.google.com (or Tools → Script editor
 *    if attached to a Sheet/Doc).
 *
 * 2. Enable the Tasks advanced service:
 *    Extensions → Apps Script services → Google Tasks API → enable.
 *    (No Cloud Console setup needed — works on any personal account.)
 *
 * 3. Add Script Properties (Project Settings → Script Properties):
 *      SUPABASE_URL      https://your-project.supabase.co
 *      SUPABASE_ANON_KEY your-supabase-anon-key
 *      HUB_SYNC_TOKEN    the token shown in Inbox → Sync Setup in the app
 *
 * 4. Google Tasks source:
 *    - Open Google Tasks (tasks.google.com or the sidebar in Gmail/Calendar).
 *    - Create a task list named exactly "Hub Inbox".
 *    - Add any task you want captured into that list.
 *    - The script will pull every incomplete task, send it to the Hub,
 *      then delete it from the list so it doesn't re-sync.
 *
 * 5. Gmail source:
 *    - Create a Gmail label named "Hub Inbox" (Settings → Labels).
 *    - Apply that label to any email you want captured.
 *    - The script removes the label after syncing.
 *
 * 6. Run createTrigger() ONCE to schedule the 15-minute recurring sync.
 *    (Run → Run function → createTrigger)
 * =====================================================================
 */

// ── Config ────────────────────────────────────────────────────────────

var PROPS          = PropertiesService.getScriptProperties();
var SUPABASE_URL   = PROPS.getProperty('SUPABASE_URL');
var ANON_KEY       = PROPS.getProperty('SUPABASE_ANON_KEY');
var SYNC_TOKEN     = PROPS.getProperty('HUB_SYNC_TOKEN');
var TASKS_LIST     = 'Hub Inbox';
var GMAIL_LABEL    = 'Hub Inbox';

// ── Entry point ───────────────────────────────────────────────────────

function syncAll() {
  if (!SUPABASE_URL || !ANON_KEY || !SYNC_TOKEN) {
    console.error('[Hub] Missing script properties. Set SUPABASE_URL, SUPABASE_ANON_KEY, HUB_SYNC_TOKEN.');
    return;
  }
  syncFromTasks();
  syncFromGmail();
}

// ── Google Tasks ──────────────────────────────────────────────────────

function syncFromTasks() {
  if (typeof Tasks === 'undefined') {
    console.error('[Hub] Tasks service not enabled. Go to Extensions → Apps Script services → enable Google Tasks API.');
    return;
  }

  // Find the "Hub Inbox" task list
  var listsResponse = Tasks.Tasklists.list({ maxResults: 100 });
  var lists = (listsResponse && listsResponse.items) ? listsResponse.items : [];
  var hubList = null;

  for (var i = 0; i < lists.length; i++) {
    if (lists[i].title === TASKS_LIST) {
      hubList = lists[i];
      break;
    }
  }

  if (!hubList) {
    console.log('[Hub] Tasks list "' + TASKS_LIST + '" not found — skipping. Create it in Google Tasks first.');
    return;
  }

  // Fetch all incomplete tasks from that list
  var tasksResponse = Tasks.Tasks.list(hubList.id, {
    showCompleted: false,
    showHidden:    false,
    maxResults:    100,
  });
  var tasks = (tasksResponse && tasksResponse.items) ? tasksResponse.items : [];

  console.log('[Hub] Tasks: found ' + tasks.length + ' item(s) in "' + TASKS_LIST + '".');

  tasks.forEach(function(task) {
    var content = (task.title || '').trim();
    if (!content) return;

    var notes = (task.notes || '').trim();
    var meta  = notes ? { notes: notes } : null;

    var inserted = insertInboxItem(content, 'tasks', 'gtask_' + task.id, meta);

    if (inserted !== false) {
      // Remove the task so it doesn't re-sync next run
      try {
        Tasks.Tasks.remove(hubList.id, task.id);
      } catch (e) {
        console.warn('[Hub] Could not delete task ' + task.id + ': ' + e.message);
      }
    }
  });
}

// ── Gmail ─────────────────────────────────────────────────────────────

function syncFromGmail() {
  var label = GmailApp.getUserLabelByName(GMAIL_LABEL);
  if (!label) {
    console.log('[Hub] Gmail label "' + GMAIL_LABEL + '" not found — skipping.');
    return;
  }

  var threads = label.getThreads(0, 50);
  console.log('[Hub] Gmail: found ' + threads.length + ' thread(s).');

  threads.forEach(function(thread) {
    var msg      = thread.getMessages()[0];
    var subject  = msg.getSubject() || '(no subject)';
    var from     = msg.getFrom();
    var body     = msg.getPlainBody().replace(/\s+/g, ' ').trim().substring(0, 300);
    var threadId = thread.getId();

    var meta = {
      subject:      subject,
      from:         from,
      body_preview: body,
      source_url:   'https://mail.google.com/mail/u/0/#all/' + threadId,
    };

    var inserted = insertInboxItem(subject, 'gmail', 'gmail_' + threadId, meta);

    if (inserted !== false) {
      thread.removeLabel(label);
    }
  });
}

// ── Supabase RPC ──────────────────────────────────────────────────────

/**
 * Calls insert_inbox_via_token.
 * Returns true on success, null if skipped (duplicate), false on error.
 */
function insertInboxItem(content, source, sourceId, sourceMeta) {
  var url     = SUPABASE_URL + '/rest/v1/rpc/insert_inbox_via_token';
  var payload = {
    p_token:       SYNC_TOKEN,
    p_content:     content,
    p_source:      source,
    p_source_id:   sourceId,
    p_source_meta: sourceMeta,
  };

  var options = {
    method:             'post',
    contentType:        'application/json',
    headers: {
      'apikey':         ANON_KEY,
      'Authorization':  'Bearer ' + ANON_KEY,
    },
    payload:            JSON.stringify(payload),
    muteHttpExceptions: true,
  };

  try {
    var response = UrlFetchApp.fetch(url, options);
    var code     = response.getResponseCode();
    var body     = response.getContentText();

    if (code === 200 || code === 201) {
      var result = JSON.parse(body);
      if (result === null) {
        console.log('[Hub] Skipped duplicate: ' + sourceId);
        return null;
      }
      console.log('[Hub] Inserted [' + source + ']: ' + content.substring(0, 60));
      return true;
    }

    console.error('[Hub] Insert failed (' + code + '): ' + body);
    return false;
  } catch (e) {
    console.error('[Hub] Network error: ' + e.message);
    return false;
  }
}

// ── Debug helper ──────────────────────────────────────────────────────

/**
 * Run this manually to diagnose Tasks sync issues.
 * Check the Execution Log for output.
 */
function debugTasks() {
  if (typeof Tasks === 'undefined') {
    console.log('FAIL: Tasks service is not enabled. Go to Extensions → Services → Tasks API → Add.');
    return;
  }

  var listsResponse = Tasks.Tasklists.list({ maxResults: 100 });
  var lists = (listsResponse && listsResponse.items) ? listsResponse.items : [];

  if (lists.length === 0) {
    console.log('No task lists found on this account.');
    return;
  }

  console.log('Found ' + lists.length + ' task list(s):');
  lists.forEach(function(list) {
    var tasksResponse = Tasks.Tasks.list(list.id, { showCompleted: false, maxResults: 10 });
    var tasks = (tasksResponse && tasksResponse.items) ? tasksResponse.items : [];
    console.log('  "' + list.title + '" (id: ' + list.id + ') — ' + tasks.length + ' incomplete task(s)');
    tasks.forEach(function(t) {
      console.log('    · ' + t.title);
    });
  });

  var hubList = lists.find(function(l) { return l.title === TASKS_LIST; });
  if (!hubList) {
    console.log('WARNING: No list named "' + TASKS_LIST + '" found. Names above must match exactly (case-sensitive).');
  } else {
    console.log('OK: Found target list "' + TASKS_LIST + '".');
  }
}

// ── Trigger setup ─────────────────────────────────────────────────────

/**
 * Run this ONCE to create the 15-minute trigger.
 * Check Triggers (clock icon) in the editor to confirm.
 */
function createTrigger() {
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === 'syncAll') ScriptApp.deleteTrigger(t);
  });

  ScriptApp.newTrigger('syncAll')
    .timeBased()
    .everyMinutes(15)
    .create();

  console.log('[Hub] Trigger created — syncAll() runs every 15 minutes.');
}
