/* ============================================================
   RMX Task State, what the two screens agree happened
   ============================================================
   My Workspace and the Tasks register are separate pages, so until now each
   started from its own copy of the data and nothing you did on one survived
   walking to the other: close a task on the register, open My Workspace, and
   the task was still sitting there open. Emma's call, 2026-09-11.

   This is deliberately a thin overlay, not a database. It records only what
   *changed*: per task id, the fields a user can actually change, plus any
   task created during the visit. Each screen still owns its own rendering and
   still ships with its own starting data; it just applies whatever the other
   one recorded before it draws.

     RMXTaskState.get(id)          -> {completed, title, flag, assigned, ...}
     RMXTaskState.patch(id, obj)   record a change
     RMXTaskState.created()        tasks added during this visit
     RMXTaskState.addCreated(t)    record one
     RMXTaskState.reset()          back to the shipped data

   sessionStorage, not localStorage, and that is the point: it lives as long as
   the tab does, so a demo keeps its state while you move between screens and a
   fresh tab always starts from a clean, known set. Everything is wrapped in
   try/catch because a browser with storage blocked should lose the syncing,
   not the prototype.
   ============================================================ */
(function () {
  'use strict';

  var KEY = 'rmx-task-state';
  var CREATED = '__created';

  function read() {
    try { return JSON.parse(sessionStorage.getItem(KEY) || '{}') || {}; }
    catch (e) { return {}; }
  }
  function write(o) {
    try { sessionStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {}
  }

  function get(id) {
    var s = read();
    return (id && s[id]) ? s[id] : null;
  }

  function patch(id, obj) {
    if (!id || !obj) return;
    var s = read();
    var cur = s[id] || {};
    for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k)) cur[k] = obj[k];
    s[id] = cur;
    write(s);
  }

  function created() {
    var s = read();
    return Array.isArray(s[CREATED]) ? s[CREATED] : [];
  }

  function addCreated(t) {
    if (!t || !t.id) return;
    var s = read();
    var list = Array.isArray(s[CREATED]) ? s[CREATED] : [];
    if (!list.some(function (x) { return x.id === t.id; })) list.push(t);
    s[CREATED] = list;
    write(s);
  }

  /* Apply everything recorded to a list of task objects, in place. The host
     calls this on its own data before its first render. */
  function apply(tasks) {
    if (!tasks || !tasks.length) return tasks;
    var s = read();
    tasks.forEach(function (t) {
      var p = s[t.id];
      if (!p) return;
      for (var k in p) if (Object.prototype.hasOwnProperty.call(p, k)) t[k] = p[k];
    });
    return tasks;
  }

  function reset() {
    try { sessionStorage.removeItem(KEY); } catch (e) {}
  }

  window.RMXTaskState = {
    get: get, patch: patch, apply: apply,
    created: created, addCreated: addCreated, reset: reset
  };
})();
