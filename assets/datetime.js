/* ============================================================
   Date & Time pickers, shared
   ------------------------------------------------------------
   The calendar is the real RMX Date Picker (Style=Calendar,
   RMX Components 157:2396), transcribed rather than approximated.
   The time list is composed from the documented dropdown
   pattern, because RMX has no Time Picker component, see
   PROTOTYPE.md item 29.

   A screen picks both up with two lines:

     <link rel="stylesheet" href="assets/datetime.css">
     <script src="assets/datetime.js"></script>

   and opens them against any element:

     RMXDateTime.openDate(anchorEl, { value: '09/11/25', onPick: fn })
     RMXDateTime.openTime(anchorEl, { value: '4:37 PM',  onPick: fn })

   onPick receives the formatted string. Same self-injecting
   arrangement as assets/megamenu.js and assets/history-notes.js.
   ============================================================ */
(function () {
  'use strict';

  var SPRITE = "<symbol id=\"dt-chevron_left\" viewBox=\"0 0 24 24\"><g id=\"chevron_left\"><path id=\"Shape\" d=\"M15.705 7.41L14.295 6L8.295 12L14.295 18L15.705 16.59L11.125 12L15.705 7.41Z\" fill=\"currentColor\"/></g></symbol><symbol id=\"dt-chevron_right\" viewBox=\"0 0 24 24\"><g id=\"chevron_right\"><path id=\"Shape\" d=\"M9.705 6L8.295 7.41L12.875 12L8.295 16.59L9.705 18L15.705 12L9.705 6Z\" fill=\"currentColor\"/></g></symbol><symbol id=\"dt-calendar_today\" viewBox=\"0 0 20 20\" fill=\"currentColor\"><path d=\"M16.6667 2.5H15.8333V0.833336H14.1667V2.5H5.83332V0.833336H4.16666V2.5H3.33332C2.41666 2.5 1.66666 3.25 1.66666 4.16667V17.5C1.66666 18.4167 2.41666 19.1667 3.33332 19.1667H16.6667C17.5833 19.1667 18.3333 18.4167 18.3333 17.5V4.16667C18.3333 3.25 17.5833 2.5 16.6667 2.5ZM16.6667 17.5H3.33332V8.33334H16.6667V17.5ZM16.6667 6.66667H3.33332V4.16667H16.6667V6.66667Z\"/></symbol><symbol id=\"dt-schedule\" viewBox=\"0 0 20 20\" fill=\"currentColor\"><path d=\"M12.75 13.9167L13.9167 12.75L10.8334 9.66666V5.83333H9.16669V10.3333L12.75 13.9167ZM10 18.3333C8.84724 18.3333 7.76391 18.1146 6.75002 17.6771C5.73613 17.2396 4.85419 16.6458 4.10419 15.8958C3.35419 15.1458 2.76044 14.2639 2.32294 13.25C1.88544 12.2361 1.66669 11.1528 1.66669 10C1.66669 8.84722 1.88544 7.76389 2.32294 6.75C2.76044 5.73611 3.35419 4.85416 4.10419 4.10416C4.85419 3.35416 5.73613 2.76041 6.75002 2.32291C7.76391 1.88541 8.84724 1.66666 10 1.66666C11.1528 1.66666 12.2361 1.88541 13.25 2.32291C14.2639 2.76041 15.1459 3.35416 15.8959 4.10416C16.6459 4.85416 17.2396 5.73611 17.6771 6.75C18.1146 7.76389 18.3334 8.84722 18.3334 10C18.3334 11.1528 18.1146 12.2361 17.6771 13.25C17.2396 14.2639 16.6459 15.1458 15.8959 15.8958C15.1459 16.6458 14.2639 17.2396 13.25 17.6771C12.2361 18.1146 11.1528 18.3333 10 18.3333ZM10 16.6667C11.8472 16.6667 13.4202 16.0174 14.7188 14.7187C16.0174 13.4201 16.6667 11.8472 16.6667 10C16.6667 8.15278 16.0174 6.57986 14.7188 5.28125C13.4202 3.98264 11.8472 3.33333 10 3.33333C8.1528 3.33333 6.57988 3.98264 5.28127 5.28125C3.98266 6.57986 3.33335 8.15278 3.33335 10C3.33335 11.8472 3.98266 13.4201 5.28127 14.7187C6.57988 16.0174 8.1528 16.6667 10 16.6667Z\"/></symbol>";
  var WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  var MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

  var injected = false, dateEl = null, timeEl = null;
  var state = { view: null, selected: null, onPick: null };

  function two(n) { return (n < 10 ? '0' : '') + n; }

  /* The prototype's date format throughout: MM/DD/YY, and h:mm AM/PM. */
  function fmtDate(d) { return two(d.getMonth() + 1) + '/' + two(d.getDate()) + '/' + String(d.getFullYear()).slice(2); }
  function fmtTime(d) {
    var h = d.getHours(), ap = h < 12 ? 'AM' : 'PM';
    h = h % 12; if (!h) h = 12;
    return two(h) + ':' + two(d.getMinutes()) + ' ' + ap;
  }
  function parseDate(s) {
    var m = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/.exec((s || '').trim());
    if (!m) return null;
    var y = +m[3]; if (y < 100) y += 2000;
    var d = new Date(y, (+m[1]) - 1, +m[2]);
    return isNaN(d) ? null : d;
  }
  function parseTime(s) {
    var m = /^(\d{1,2}):(\d{2})\s*([AaPp])/.exec((s || '').trim());
    if (!m) return null;
    var h = (+m[1]) % 12;
    if (/[Pp]/.test(m[3])) h += 12;
    return { h: h, m: +m[2] };
  }
  function sameDay(a, b) {
    return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  /* The default this prototype hands a new task: today, an hour from now.
     Emma's call, 2026-09-11. Exact, not rounded to a tidy increment --
     "an hour later" means an hour later. */
  function defaultDateTime() {
    var d = new Date();
    d.setHours(d.getHours() + 1);
    return { date: fmtDate(d), time: fmtTime(d), at: d };
  }

  function inject() {
    if (injected) return;
    var wrap = document.createElement('div');
    wrap.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" style="display:none">' + SPRITE + '</svg>' +
      '<div class="dt-panel dt-cal" id="dtDate" hidden role="dialog" aria-label="Choose a date"></div>' +
      '<div class="dt-panel dt-time" id="dtTime" hidden role="listbox" aria-label="Choose a time"></div>';
    while (wrap.firstChild) document.body.appendChild(wrap.firstChild);
    dateEl = document.getElementById('dtDate');
    timeEl = document.getElementById('dtTime');
    injected = true;

    /* A click inside a panel is handled by the panel; anything else closes
       both. Bound once, in the capture phase, so a host screen's own
       click-outside handlers cannot pre-empt it. */
    document.addEventListener('click', function (e) {
      if (dateEl.contains(e.target) || timeEl.contains(e.target)) return;
      if (e.target.closest && e.target.closest('[data-dt-trigger]')) return;
      closeAll();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeAll();
    });
    window.addEventListener('resize', closeAll);
  }

  function closeAll() {
    if (dateEl) dateEl.hidden = true;
    if (timeEl) timeEl.hidden = true;
  }

  /* Same clamp-and-flip the Tasks screen's floating panels use: a fixed
     panel that runs past the viewport edge is unreachable, so put it below
     the anchor when it fits, above when there is more room that way, and
     never outside the edges. */
  function place(panel, anchor) {
    var GAP = 6, EDGE = 12;
    var r = anchor.getBoundingClientRect();
    panel.style.maxHeight = '';
    var h = panel.offsetHeight;
    var below = window.innerHeight - r.bottom - GAP - EDGE;
    var above = r.top - GAP - EDGE;
    var top, room;
    if (h <= below || below >= above) { top = r.bottom + GAP; room = below; }
    else { room = above; top = r.top - GAP - Math.min(h, above); }
    if (h > room) panel.style.maxHeight = room + 'px';
    var used = Math.min(h, room);
    panel.style.top = Math.max(EDGE, Math.min(top, window.innerHeight - used - EDGE)) + 'px';
    var left = r.left;
    var maxLeft = window.innerWidth - panel.offsetWidth - EDGE;
    if (left > maxLeft) left = Math.max(EDGE, maxLeft);
    panel.style.left = Math.max(EDGE, left) + 'px';
  }

  /* ---- calendar ---- */
  function renderCal() {
    var view = state.view, sel = state.selected, today = new Date();
    var first = new Date(view.getFullYear(), view.getMonth(), 1);
    var start = new Date(first);
    start.setDate(1 - first.getDay());               // back up to the Sunday
    var html = '<div class="dt-cal__header">' +
      '<button type="button" class="dt-nav" data-dt-step="-1" aria-label="Previous month">' +
        '<svg><use href="#dt-chevron_left"></use></svg></button>' +
      '<span class="dt-cal__month">' + MONTHS[view.getMonth()] + ' ' + view.getFullYear() + '</span>' +
      '<button type="button" class="dt-nav" data-dt-step="1" aria-label="Next month">' +
        '<svg><use href="#dt-chevron_right"></use></svg></button>' +
    '</div><div class="dt-cal__grid">' +
      '<div class="dt-cal__row dt-cal__row--head">' +
        WEEKDAYS.map(function (w) { return '<span class="dt-cell">' + w + '</span>'; }).join('') +
      '</div>';
    var cur = new Date(start);
    for (var row = 0; row < 6; row++) {
      html += '<div class="dt-cal__row' + (row % 2 === 1 ? ' dt-cal__row--alt' : '') + '">';
      for (var i = 0; i < 7; i++) {
        var outside = cur.getMonth() !== view.getMonth();
        var picked = sameDay(cur, sel);
        html += '<button type="button" class="dt-cell' +
          (outside ? ' dt-cell--muted' : '') + (picked ? ' dt-cell--sel' : '') +
          '" data-dt-day="' + fmtDate(cur) + '"' + (picked ? ' aria-current="date"' : '') + '>' +
          cur.getDate() + '</button>';
        cur.setDate(cur.getDate() + 1);
      }
      html += '</div>';
    }
    html += '</div><div class="dt-cal__divider"></div>' +
      '<div class="dt-cal__buttons">' +
        '<button type="button" data-dt-today>Today</button>' +
        '<button type="button" data-dt-clear>Clear</button>' +
      '</div>';
    dateEl.innerHTML = html;
  }

  function openDate(anchor, opts) {
    inject();
    opts = opts || {};
    timeEl.hidden = true;
    state.onPick = opts.onPick || null;
    state.selected = parseDate(opts.value) || new Date();
    state.view = new Date(state.selected.getFullYear(), state.selected.getMonth(), 1);
    renderCal();
    dateEl.hidden = false;
    place(dateEl, anchor);
    dateEl._anchor = anchor;
  }

  /* ---- time list ---- */
  function openTime(anchor, opts) {
    inject();
    opts = opts || {};
    dateEl.hidden = true;
    state.onPick = opts.onPick || null;
    var want = parseTime(opts.value);
    var html = '', selIdx = -1, n = 0;
    for (var h = 0; h < 24; h++) {
      for (var m = 0; m < 60; m += 15) {
        var d = new Date(2000, 0, 1, h, m);
        var label = fmtTime(d);
        var on = want && want.h === h && want.m === m;
        if (on) selIdx = n;
        html += '<button type="button" role="option" aria-selected="' + (on ? 'true' : 'false') +
                '" data-dt-time="' + label + '">' + label + '</button>';
        n++;
      }
    }
    timeEl.innerHTML = html;
    timeEl.hidden = false;
    place(timeEl, anchor);
    timeEl._anchor = anchor;
    /* Scroll to the current value, or to the nearest quarter hour when the
       value falls between them -- which it does by default, since the
       default is exactly an hour from now. */
    var target = selIdx;
    if (target < 0 && want) target = want.h * 4 + Math.round(want.m / 15);
    var btn = timeEl.children[Math.max(0, Math.min(timeEl.children.length - 1, target))];
    if (btn) timeEl.scrollTop = Math.max(0, btn.offsetTop - timeEl.clientHeight / 2);
  }

  /* ---- one delegated handler for both panels ---- */
  document.addEventListener('click', function (e) {
    if (!injected) return;
    var t = e.target.closest ? e.target : null;
    if (!t) return;
    var step = t.closest('[data-dt-step]');
    if (step && dateEl.contains(step)) {
      state.view = new Date(state.view.getFullYear(), state.view.getMonth() + Number(step.getAttribute('data-dt-step')), 1);
      renderCal();
      place(dateEl, dateEl._anchor);
      return;
    }
    var day = t.closest('[data-dt-day]');
    if (day && dateEl.contains(day)) {
      if (state.onPick) state.onPick(day.getAttribute('data-dt-day'));
      closeAll();
      return;
    }
    if (t.closest('[data-dt-today]') && dateEl.contains(t)) {
      if (state.onPick) state.onPick(fmtDate(new Date()));
      closeAll();
      return;
    }
    if (t.closest('[data-dt-clear]') && dateEl.contains(t)) {
      if (state.onPick) state.onPick('');
      closeAll();
      return;
    }
    var time = t.closest('[data-dt-time]');
    if (time && timeEl.contains(time)) {
      if (state.onPick) state.onPick(time.getAttribute('data-dt-time'));
      closeAll();
    }
  });

  window.RMXDateTime = {
    openDate: openDate,
    openTime: openTime,
    close: closeAll,
    defaults: defaultDateTime,
    formatDate: fmtDate,
    formatTime: fmtTime
  };
})();
