/* ============================================================
 * WeLink 风格群聊界面 · 交互逻辑（零依赖，classic script）
 *
 * 分层（对齐 GAME_DESIGN.md D8）：
 *   数据 data.js -> 状态 store（本文件内存态）-> 渲染 render*（纯 DOM 输出）
 * 本文件不写 localStorage：存档格式在 docs/GAME_DESIGN.md 第 4 节仍未决策。
 * ============================================================ */
(function () {
  'use strict';

  var PACKS = (window.HVV_DEMO_PACKS || []).slice();
  var ME = { id: 'me', alias: '我', seed: 'me-self', rarity: 'ME' };
  var EMOJIS = ['😊', '😂', '🫠', '😴', '🐱', '🎉', '👍', '🙌', '🔥', '💤', '📎', '🖼️', '☕', '🌙', '😭', '🤝'];

  /* ---------- 状态 ---------- */

  var store = PACKS.map(function (entry) {
    return {
      pack: entry.pack,
      ui: entry.ui,
      messages: entry.ui.messages.slice(),
      unread: entry.ui.unread || 0
    };
  });

  var state = {
    activeId: store.length ? store[0].pack.id : null,
    filter: 'all',
    query: '',
    infoOpen: true,
    emojiOpen: false
  };

  var els = {
    app: document.querySelector('.app'),
    railAvatar: document.getElementById('railAvatar'),
    railBadge: document.getElementById('railBadge'),
    convList: document.getElementById('convList'),
    search: document.getElementById('searchInput'),
    chips: document.getElementById('filterChips'),
    chatName: document.getElementById('chatName'),
    chatSub: document.getElementById('chatSub'),
    msgScroll: document.getElementById('msgScroll'),
    msgList: document.getElementById('msgList'),
    typing: document.getElementById('typingHint'),
    input: document.getElementById('input'),
    sendBtn: document.getElementById('sendBtn'),
    charHint: document.getElementById('charHint'),
    emojiPanel: document.getElementById('emojiPanel'),
    infoToggle: document.getElementById('infoToggle'),
    infoCol: document.getElementById('infoCol')
  };

  /* ---------- 工具 ---------- */

  function hash(str) {
    var h = 2166136261, i;
    str = String(str);
    for (i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  /* 程序生成头像：种子 -> 确定性渐变色（对齐 D1「程序生成头像」） */
  function avatarStyle(seed) {
    var h = hash(seed);
    var a = h % 360;
    var b = (a + 42) % 360;
    return 'background-image:linear-gradient(135deg,hsl(' + a + ' 62% 60%),hsl(' + b + ' 70% 45%))';
  }

  function makeAvatar(member, size) {
    var d = document.createElement('div');
    d.className = 'avatar' + (size ? ' ' + size : '');
    d.style.cssText = avatarStyle(member.seed);
    d.textContent = (member.alias || '?').slice(0, 1);
    d.title = member.alias || '';
    return d;
  }

  function activeEntry() {
    var i;
    for (i = 0; i < store.length; i++) {
      if (store[i].pack.id === state.activeId) return store[i];
    }
    return store[0] || null;
  }

  function memberOf(pack, id) {
    if (id === ME.id) return ME;
    var i;
    for (i = 0; i < pack.members.length; i++) {
      if (pack.members[i].id === id) return pack.members[i];
    }
    return { id: id, alias: '未知群友', seed: id, rarity: 'N' };
  }

  function nowTime() {
    var d = new Date();
    return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
  }

  function previewOf(msg) {
    if (!msg) return '暂无消息';
    if (msg.type === 'system') return msg.text;
    if (msg.type === 'sticker') return '[表情] ' + msg.emoji;
    if (msg.type === 'file') return '[文件] ' + msg.name;
    if (msg.type === 'meeting') return '[会议] ' + msg.title;
    if (msg.type === 'notice') return '[群公告] ' + msg.text;
    return msg.text || '';
  }

  function toast(text) {
    var old = document.querySelector('.toast');
    if (old) old.remove();
    var t = document.createElement('div');
    t.className = 'toast';
    t.textContent = text;
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 1800);
  }

  /* ---------- 渲染：会话列表 ---------- */

  function renderConvList() {
    var q = state.query.trim().toLowerCase();
    var list = els.convList;
    list.innerHTML = '';

    var rows = store.filter(function (e) {
      if (state.filter === 'unread' && e.unread <= 0) return false;
      if (state.filter === 'muted' && !e.ui.muted) return false;
      if (state.filter === 'group' && e.pack.members.length < 2) return false;
      if (!q) return true;
      var hay = [
        e.pack.display_name,
        e.pack.members.map(function (m) { return m.alias; }).join(' '),
        previewOf(e.messages[e.messages.length - 1])
      ].join(' ').toLowerCase();
      return hay.indexOf(q) >= 0;
    });

    if (!rows.length) {
      var empty = document.createElement('li');
      empty.className = 'list-empty';
      empty.textContent = '没有匹配的会话';
      list.appendChild(empty);
      return;
    }

    rows.forEach(function (e) {
      var pack = e.pack;
      var li = document.createElement('li');
      li.className = 'conv' + (pack.id === state.activeId ? ' is-active' : '');
      li.tabIndex = 0;

      var groupAvatar = document.createElement('div');
      groupAvatar.className = 'avatar';
      groupAvatar.style.cssText = avatarStyle(pack.id);
      groupAvatar.textContent = pack.display_name.slice(0, 1);

      var main = document.createElement('div');
      main.className = 'conv-main';

      var top = document.createElement('div');
      top.className = 'conv-top';
      var name = document.createElement('span');
      name.className = 'conv-name';
      name.textContent = (e.ui.pinned ? '📌 ' : '') + pack.display_name;
      var meta = document.createElement('span');
      meta.className = 'conv-meta';
      meta.textContent = e.ui.updated;
      top.appendChild(name);
      top.appendChild(meta);

      var bottom = document.createElement('div');
      bottom.className = 'conv-bottom';
      var prev = document.createElement('span');
      prev.className = 'conv-preview';
      var last = e.messages[e.messages.length - 1];
      prev.textContent = (last && last.from && last.from !== 'me'
        ? memberOf(pack, last.from).alias + '：' : '') + previewOf(last);
      bottom.appendChild(prev);

      if (e.ui.muted) {
        var mute = document.createElement('span');
        mute.className = 'conv-mute';
        mute.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="m16 9 5 6M21 9l-5 6"/></svg>';
        bottom.appendChild(mute);
      }

      if (e.unread > 0) {
        var badge = document.createElement('span');
        badge.className = 'conv-badge' + (e.ui.muted ? ' is-muted' : '');
        badge.textContent = e.unread > 99 ? '99+' : String(e.unread);
        bottom.appendChild(badge);
      }

      main.appendChild(top);
      main.appendChild(bottom);
      li.appendChild(groupAvatar);
      li.appendChild(main);

      li.addEventListener('click', function () { openConv(pack.id); });
      li.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); openConv(pack.id); }
      });

      list.appendChild(li);
    });
  }

  /* ---------- 渲染：聊天区 ---------- */

  function buildMessage(msg, pack) {
    if (msg.type === 'system') {
      var s = document.createElement('div');
      s.className = 'sys-msg';
      s.textContent = msg.text;
      return s;
    }

    var wrap = document.createElement('div');
    var isSelf = msg.from === ME.id;
    wrap.className = 'msg' + (isSelf ? ' is-self' : '');

    var author = memberOf(pack, msg.from);
    wrap.appendChild(makeAvatar(author, 'sm'));

    var body = document.createElement('div');
    body.className = 'msg-body';

    var head = document.createElement('div');
    head.className = 'msg-head';
    var nm = document.createElement('span');
    nm.className = 'msg-name';
    nm.textContent = isSelf ? '我' : author.alias;
    var tm = document.createElement('span');
    tm.textContent = msg.time || '';
    head.appendChild(nm);
    head.appendChild(tm);
    body.appendChild(head);

    if (msg.type === 'notice') {
      var notice = document.createElement('div');
      notice.className = 'notice-card';
      notice.innerHTML = '<b></b>';
      notice.querySelector('b').textContent = msg.title || '群公告';
      notice.appendChild(document.createTextNode(msg.text || ''));
      body.appendChild(notice);
      wrap.appendChild(body);
      return wrap;
    }

    if (msg.type === 'sticker') {
      var st = document.createElement('div');
      st.className = 'sticker';
      st.textContent = msg.emoji;
      body.appendChild(st);
      wrap.appendChild(body);
      return wrap;
    }

    if (msg.type === 'file') {
      var fc = document.createElement('div');
      fc.className = 'card';
      fc.innerHTML =
        '<div class="card-top"><div class="card-ico">📄</div><div>' +
        '<div class="card-title"></div><div class="card-sub"></div></div></div>' +
        '<div class="card-foot"><button class="card-btn">下载</button>' +
        '<button class="card-btn ghost">转发</button></div>';
      fc.querySelector('.card-title').textContent = msg.name;
      fc.querySelector('.card-sub').textContent = (msg.size || '') + ' · 群文件';
      fc.querySelector('.card-btn').addEventListener('click', function () {
        toast('演示版：文件下载未接入');
      });
      body.appendChild(fc);
      wrap.appendChild(body);
      return wrap;
    }

    if (msg.type === 'meeting') {
      var mc = document.createElement('div');
      mc.className = 'card';
      mc.innerHTML =
        '<div class="card-top"><div class="card-ico">📹</div><div>' +
        '<div class="card-title"></div><div class="card-sub"></div></div></div>' +
        '<div class="card-foot"><button class="card-btn">加入会议</button>' +
        '<button class="card-btn ghost">复制会议号</button></div>';
      mc.querySelector('.card-title').textContent = msg.title;
      mc.querySelector('.card-sub').textContent = (msg.when || '') + ' · 会议号 ' + (msg.code || '');
      mc.querySelector('.card-btn').addEventListener('click', function () {
        toast('演示版：会议未接入');
      });
      mc.querySelector('.card-btn.ghost').addEventListener('click', function () {
        toast('会议号 ' + msg.code + '（演示，未写入剪贴板）');
      });
      body.appendChild(mc);
      wrap.appendChild(body);
      return wrap;
    }

    var bubble = document.createElement('div');
    bubble.className = 'bubble';
    if (msg.quote) {
      var q = document.createElement('div');
      q.className = 'quote';
      var qb = document.createElement('b');
      qb.textContent = msg.quote.from + '：';
      q.appendChild(qb);
      q.appendChild(document.createTextNode(msg.quote.text));
      bubble.appendChild(q);
      bubble.appendChild(document.createElement('br'));
    }
    bubble.appendChild(document.createTextNode(msg.text || ''));
    body.appendChild(bubble);
    wrap.appendChild(body);
    return wrap;
  }

  function renderChat() {
    var entry = activeEntry();
    if (!entry) return;
    var pack = entry.pack;

    els.chatName.textContent = pack.display_name;
    els.chatSub.textContent = pack.members.length + ' 位群友 · 群等级 T' + pack.tier;

    var list = els.msgList;
    list.innerHTML = '';
    var day = null;
    entry.messages.forEach(function (msg) {
      if (msg.day && msg.day !== day) {
        day = msg.day;
        var d = document.createElement('div');
        d.className = 'day-divider';
        d.textContent = day;
        list.appendChild(d);
      }
      list.appendChild(buildMessage(msg, pack));
    });

    els.msgScroll.scrollTop = els.msgScroll.scrollHeight;
  }

  /* ---------- 渲染：群信息面板 ---------- */

  function renderInfo() {
    var entry = activeEntry();
    if (!entry) return;
    var pack = entry.pack;
    var ui = entry.ui;
    var col = els.infoCol;
    col.innerHTML = '';

    function block(title) {
      var b = document.createElement('div');
      b.className = 'info-block';
      var h = document.createElement('h2');
      h.textContent = title;
      b.appendChild(h);
      col.appendChild(b);
      return b;
    }

    var overview = block('群概况');
    var stats = document.createElement('div');
    stats.className = 'stat-row';
    stats.innerHTML = '<div class="stat"><b></b><span>群友</span></div>' +
                      '<div class="stat"><b></b><span>群等级</span></div>' +
                      '<div class="stat"><b></b><span>未读</span></div>';
    var bolds = stats.querySelectorAll('b');
    bolds[0].textContent = String(pack.members.length);
    bolds[1].textContent = 'T' + pack.tier;
    bolds[2].textContent = String(entry.unread);
    overview.appendChild(stats);

    var notice = block('群公告');
    var nt = document.createElement('div');
    nt.className = 'info-text';
    nt.textContent = ui.notice || '暂无群公告';
    notice.appendChild(nt);

    var members = block('群成员（' + pack.members.length + '）');
    var grid = document.createElement('div');
    grid.className = 'member-grid';
    pack.members.forEach(function (m) {
      var cell = document.createElement('div');
      cell.className = 'member';
      cell.title = m.quote || '';
      cell.appendChild(makeAvatar(m, 'lg'));
      var nm = document.createElement('div');
      nm.className = 'member-name';
      nm.textContent = m.alias;
      var rar = document.createElement('span');
      rar.className = 'rarity ' + m.rarity;
      rar.textContent = m.rarity;
      cell.appendChild(nm);
      cell.appendChild(rar);
      grid.appendChild(cell);
    });
    members.appendChild(grid);

    var files = block('群文件');
    if (ui.files && ui.files.length) {
      ui.files.forEach(function (f) {
        var row = document.createElement('div');
        row.className = 'file-row';
        row.innerHTML = '<span class="fico">📄</span><div style="min-width:0">' +
          '<div class="file-name"></div><div class="file-meta"></div></div>';
        row.querySelector('.file-name').textContent = f.name;
        row.querySelector('.file-meta').textContent = f.size + ' · ' + f.by + ' · ' + f.time;
        files.appendChild(row);
      });
    } else {
      var none = document.createElement('div');
      none.className = 'info-empty';
      none.textContent = '本群还没有文件';
      files.appendChild(none);
    }
  }

  /* ---------- 渲染：入口 ---------- */

  function renderRail() {
    var total = store.reduce(function (n, e) { return n + (e.ui.muted ? 0 : e.unread); }, 0);
    if (total > 0) {
      els.railBadge.hidden = false;
      els.railBadge.textContent = total > 99 ? '99+' : String(total);
    } else {
      els.railBadge.hidden = true;
    }
  }

  function renderAll() {
    renderConvList();
    renderChat();
    renderInfo();
    renderRail();
  }

  function openConv(id) {
    var entry;
    var i;
    for (i = 0; i < store.length; i++) {
      if (store[i].pack.id === id) entry = store[i];
    }
    if (!entry) return;
    state.activeId = id;
    entry.unread = 0;
    renderAll();
    els.input.focus();
  }

  /* ---------- 发送 + 模拟群友回复 ---------- */

  function pushMessage(entry, msg) {
    entry.messages.push(msg);
    entry.ui.updated = msg.time || nowTime();
  }

  function send() {
    var text = els.input.value.replace(/\s+$/, '');
    if (!text) return;
    var entry = activeEntry();
    if (!entry) return;

    pushMessage(entry, {
      id: 'm_' + Date.now(),
      day: '今天',
      time: nowTime(),
      from: ME.id,
      text: text
    });

    els.input.value = '';
    autoGrow();
    updateSendState();
    renderConvList();
    renderChat();
    renderRail();
    scheduleReply(entry);
  }

  var replyTimer = null;

  function scheduleReply(entry) {
    if (replyTimer) clearTimeout(replyTimer);
    var pool = entry.ui.replies || [];
    if (!pool.length || !entry.pack.members.length) return;

    var speaker = entry.pack.members[Math.floor(Math.random() * entry.pack.members.length)];
    els.typing.hidden = false;
    els.typing.textContent = '';
    var label = document.createElement('span');
    label.textContent = speaker.alias + ' 正在输入';
    var dots = document.createElement('span');
    dots.className = 'dots';
    dots.innerHTML = '<i></i><i></i><i></i>';
    els.typing.appendChild(label);
    els.typing.appendChild(dots);
    els.msgScroll.scrollTop = els.msgScroll.scrollHeight;

    replyTimer = setTimeout(function () {
      els.typing.hidden = true;
      if (state.activeId !== entry.pack.id) {
        entry.unread += 1;
        renderConvList();
        renderRail();
        return;
      }
      pushMessage(entry, {
        id: 'r_' + Date.now(),
        day: '今天',
        time: nowTime(),
        from: speaker.id,
        text: pool[Math.floor(Math.random() * pool.length)]
      });
      renderConvList();
      renderChat();
      renderRail();
    }, 900 + Math.random() * 1200);
  }

  /* ---------- 输入框 ---------- */

  function autoGrow() {
    els.input.style.height = 'auto';
    els.input.style.height = Math.min(els.input.scrollHeight, 132) + 'px';
  }

  function updateSendState() {
    var len = els.input.value.length;
    els.charHint.textContent = len + ' / 2000';
    els.sendBtn.disabled = els.input.value.trim().length === 0;
  }

  /* ---------- 事件绑定 ---------- */

  els.sendBtn.addEventListener('click', send);

  els.input.addEventListener('input', function () {
    if (els.input.value.length > 2000) els.input.value = els.input.value.slice(0, 2000);
    autoGrow();
    updateSendState();
  });

  els.input.addEventListener('keydown', function (ev) {
    if (ev.key === 'Enter' && !ev.shiftKey) {
      ev.preventDefault();
      send();
    }
  });

  els.search.addEventListener('input', function () {
    state.query = els.search.value;
    renderConvList();
  });

  els.chips.addEventListener('click', function (ev) {
    var btn = ev.target.closest('.chip');
    if (!btn) return;
    state.filter = btn.dataset.filter;
    Array.prototype.forEach.call(els.chips.querySelectorAll('.chip'), function (c) {
      c.classList.toggle('is-active', c === btn);
    });
    renderConvList();
  });

  els.infoToggle.addEventListener('click', function () {
    state.infoOpen = !state.infoOpen;
    els.app.classList.toggle('info-closed', !state.infoOpen);
    els.infoToggle.classList.toggle('is-active', state.infoOpen);
  });

  // 表情面板
  EMOJIS.forEach(function (e) {
    var b = document.createElement('button');
    b.type = 'button';
    b.textContent = e;
    b.addEventListener('click', function () {
      var start = els.input.selectionStart || els.input.value.length;
      var v = els.input.value;
      els.input.value = v.slice(0, start) + e + v.slice(start);
      els.input.focus();
      els.input.selectionStart = els.input.selectionEnd = start + e.length;
      autoGrow();
      updateSendState();
    });
    els.emojiPanel.appendChild(b);
  });

  document.querySelector('.composer-tools').addEventListener('click', function (ev) {
    var btn = ev.target.closest('.tool-btn');
    if (!btn) return;
    if (btn.dataset.tool === 'emoji') {
      state.emojiOpen = !state.emojiOpen;
      els.emojiPanel.hidden = !state.emojiOpen;
    } else {
      toast('演示版：' + btn.textContent.trim() + ' 未接入');
    }
  });

  document.addEventListener('click', function (ev) {
    if (!state.emojiOpen) return;
    if (ev.target.closest('.composer')) return;
    state.emojiOpen = false;
    els.emojiPanel.hidden = true;
  });

  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape' && state.emojiOpen) {
      state.emojiOpen = false;
      els.emojiPanel.hidden = true;
    }
  });

  // 左侧导航：仅消息模块实现，其余给出诚实提示
  document.querySelector('.rail').addEventListener('click', function (ev) {
    var btn = ev.target.closest('.rail-btn');
    if (!btn || btn.classList.contains('is-active')) return;
    var labels = { contacts: '通讯录', meeting: '会议', cloud: '云空间', apps: '应用', settings: '设置' };
    toast('演示版仅实现「消息」模块：' + (labels[btn.dataset.rail] || ''));
  });

  document.getElementById('newChatBtn').addEventListener('click', function () {
    toast('演示版：新建会话未接入');
  });

  /* ---------- 启动 ---------- */

  els.railAvatar.style.cssText = avatarStyle(ME.seed);
  els.infoToggle.classList.toggle('is-active', state.infoOpen);
  renderAll();
  updateSendState();
  autoGrow();
})();
