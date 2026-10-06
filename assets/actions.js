/* ============================================================
   RMX Actions, the "Select an Action" list, in one place
   ============================================================
   The Tasks register and My Workspace both offer "Add Action", and both were
   carrying their own copy of the list: the register as hard-coded markup in
   its actions panel, the Workspace tile as nothing at all (its button handed
   off to the full Task Details overlay instead, which is what Emma hit on
   2026-09-11). One list lives here now and both screens read it, so an action
   added to the product gets added once.

   The groups and their items are the real New Action UI's own, read off node
   3703:115902 when that panel was first built.

     RMXActions.groups                 the data, for a host that draws its own panel
     RMXActions.markup()               those groups as .fp-section-label / .fp-item rows
     RMXActions.open(anchor, onPick)   a self-contained panel, for a host with none

   The self-contained panel is what My Workspace uses. The register keeps its
   own panel, it is sized to the field that opens it and carries the modal's
   collapsible groups, and feeds it from RMXActions.markup().
   ============================================================ */
(function () {
  'use strict';

  var GROUPS = [
    { name: 'Communication', items: [
      'Publish Signable Documents', 'Send Email', 'Send Text', 'Write Letter'
    ]},
    { name: 'Financial', items: [
      'Batch Owner Reports', 'Enter a Invoice', 'Enter a Journal', 'Make Deposit',
      'Modify Recurring Charges', 'Post Late Fees', 'Post Management Fees',
      'Post Owner Checks', 'Post Recurring Charges', 'Post Recurring ePay Payments',
      'Post Utilities', 'Print Checks', 'Write A Check'
    ]},
    { name: 'View', items: [
      'View Bank Register', 'View Bills', 'View Tenants', 'View Meter Readings',
      'View Owners', 'View Properties', 'View Issues', 'View Units', 'View Vendors'
    ]}
  ];

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* The register's own panel markup, generated rather than typed twice: the
     same classes and the same onclick it had before this file existed. */
  function markup() {
    return GROUPS.map(function (g) {
      return '<div class="fp-section-label" onclick="toggleActionGroup(this)">' +
             '<span class="material-symbols-outlined">keyboard_arrow_down</span>' + esc(g.name) + '</div>' +
             g.items.map(function (it) {
               return '<div class="fp-item" onclick="pickActionItem(\'' +
                      it.replace(/'/g, "\\'") + '\')">' + esc(it) + '</div>';
             }).join('');
    }).join('');
  }

  /* ---- the self-contained panel ---- */
  var panel = null, onPickFn = null, anchorEl = null;

  function inject() {
    if (panel) return;
    panel = document.createElement('div');
    panel.className = 'rax-panel';
    panel.id = 'raxPanel';
    panel.hidden = true;
    panel.innerHTML =
      '<div class="rax-search"><input id="raxSearch" type="text" placeholder="Search actions" aria-label="Search actions"></div>' +
      '<div class="rax-list" id="raxList"></div>';
    document.body.appendChild(panel);
    panel.addEventListener('click', function (e) { e.stopPropagation(); });
    panel.querySelector('#raxSearch').addEventListener('input', render);
    document.addEventListener('click', function (e) {
      if (panel.hidden) return;
      if (anchorEl && (e.target === anchorEl || anchorEl.contains(e.target))) return;
      close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panel.hidden) close();
    });
  }

  function render() {
    var q = (document.getElementById('raxSearch').value || '').toLowerCase().trim();
    var html = GROUPS.map(function (g) {
      var items = g.items.filter(function (it) { return !q || it.toLowerCase().indexOf(q) > -1; });
      if (!items.length) return '';
      return '<div class="rax-group">' + esc(g.name) + '</div>' +
             items.map(function (it) {
               return '<div class="rax-item" data-action="' + esc(it) + '">' + esc(it) + '</div>';
             }).join('');
    }).join('');
    var list = document.getElementById('raxList');
    list.innerHTML = html || '<div class="rax-empty">No actions match your search.</div>';
    [].forEach.call(list.querySelectorAll('.rax-item'), function (el) {
      el.addEventListener('click', function () {
        var label = el.getAttribute('data-action');
        close();
        if (onPickFn) onPickFn(label);
      });
    });
  }

  /* Measure, then flip above the anchor if the natural height will not fit
     below it, the same clamp the date pickers use, for the same reason. */
  function position() {
    var GAP = 4, EDGE = 12;
    var r = anchorEl.getBoundingClientRect();
    panel.style.maxHeight = 'none';
    var h = panel.offsetHeight, w = panel.offsetWidth;
    var below = window.innerHeight - r.bottom - GAP - EDGE;
    var above = r.top - GAP - EDGE;
    var flip = h > below && above > below;
    panel.style.maxHeight = Math.max(140, flip ? above : below) + 'px';
    panel.style.top = (flip ? Math.max(EDGE, r.top - GAP - Math.min(h, above))
                            : r.bottom + GAP) + 'px';
    panel.style.left = Math.min(Math.max(EDGE, r.left),
                                window.innerWidth - w - EDGE) + 'px';
  }

  function open(anchor, onPick) {
    inject();
    anchorEl = anchor;
    onPickFn = onPick || null;
    document.getElementById('raxSearch').value = '';
    render();
    panel.hidden = false;
    position();
    document.getElementById('raxSearch').focus();
  }

  function close() {
    if (panel) panel.hidden = true;
  }

  window.RMXActions = { groups: GROUPS, markup: markup, open: open, close: close };
})();
