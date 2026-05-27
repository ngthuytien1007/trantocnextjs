/**
 * Trần Tộc – Shared Bottom Navigation
 * ────────────────────────────────────
 * Tự động inject thanh điều hướng phía dưới cho mọi trang.
 * 4 tab chính + 1 nút "Thêm" mở popup 4 trang phụ.
 * Hỗ trợ 3 theme: dark / light / pattern (đồng bộ qua localStorage).
 *
 * Cách dùng: thêm <script src="js/shared-nav.js"></script> trước </body>
 */
(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════
     CẤU HÌNH MENU
     ═══════════════════════════════════════════════════ */
  var MAIN_TABS = [
    { page: 'index.html', label: 'Trang chủ', icon: 'fa-home' },
    { page: 'gia-pha.html', label: 'Gia Phả', icon: 'fa-sitemap' },
    { page: 'su-kien-tam-linh.html', label: 'Tâm Linh', icon: 'fa-om' },
    { page: 'quan-tri.html', label: 'Quản Trị', icon: 'fa-shield-halved' }
  ];

  var MORE_TABS = [
    { page: 'tin-tuc-quy-toc.html', label: 'Tin Tức & Quỹ Tộc', icon: 'fa-newspaper' },
    { page: 'lich-su-toc.html', label: 'Lịch Sử Dòng Tộc', icon: 'fa-landmark' },
    { page: 'lien-he.html', label: 'Liên Hệ Gia Tộc', icon: 'fa-address-book' },
    { page: 'ca-nhan.html', label: 'Cá Nhân & Thiết Lập', icon: 'fa-user-gear' }
  ];

  /* ═══════════════════════════════════════════════════
     XÁC ĐỊNH TRANG HIỆN TẠI
     ═══════════════════════════════════════════════════ */
  var raw = location.pathname.split('/').pop() || 'index.html';
  var currentPage = raw.split('?')[0].split('#')[0];
  var isMoreActive = MORE_TABS.some(function (t) { return t.page === currentPage; });

  /* ═══════════════════════════════════════════════════
     THEME
     ═══════════════════════════════════════════════════ */
  function getTheme() {
    return localStorage.getItem('trantoc_theme') || 'dark';
  }

  /* ═══════════════════════════════════════════════════
     INJECT CSS
     ═══════════════════════════════════════════════════ */
  var style = document.createElement('style');
  style.id = 'trantoc-nav-css';
  style.textContent = '\
/* ─── Bottom Nav Container ─── */\
.tt-nav {\
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 9000;\
  border-top: 1px solid; font-family: "Inter", -apple-system, sans-serif;\
  padding-bottom: env(safe-area-inset-bottom, 0px);\
  transition: background-color .3s, border-color .3s;\
  -webkit-tap-highlight-color: transparent;\
}\
.tt-nav .tt-row {\
  display: flex; justify-content: space-around; align-items: center;\
  height: 62px; max-width: 600px; margin: 0 auto;\
}\
/* ─── Tab Button / Link ─── */\
.tt-nav .tt-tab {\
  display: flex; flex-direction: column; align-items: center; justify-content: center;\
  flex: 1; height: 100%; text-decoration: none !important;\
  transition: color .2s, transform .1s;\
  cursor: pointer; background: none; border: none; padding: 0; outline: none;\
  -webkit-tap-highlight-color: transparent;\
}\
.tt-nav .tt-tab:active { transform: scale(.9); }\
.tt-nav .tt-tab i { font-size: 20px; margin-bottom: 3px; }\
.tt-nav .tt-tab span { font-size: 10px; font-weight: 500; letter-spacing: .01em; }\
.tt-nav .tt-tab.on i { font-size: 22px; }\
.tt-nav .tt-tab.on span { font-weight: 700; }\
/* ─── Overlay ─── */\
.tt-overlay {\
  position: fixed; inset: 0; z-index: 8999;\
  background: rgba(0,0,0,.35); backdrop-filter: blur(2px);\
  opacity: 0; pointer-events: none; transition: opacity .25s ease;\
}\
.tt-overlay.open { opacity: 1; pointer-events: auto; }\
/* ─── Popup ─── */\
.tt-popup {\
  position: fixed;\
  bottom: calc(62px + env(safe-area-inset-bottom, 0px) + 10px);\
  right: 12px; left: 12px; max-width: 380px; margin-left: auto;\
  z-index: 9001; border-radius: 18px; border: 1px solid; overflow: hidden;\
  transform: translateY(14px) scale(.96); opacity: 0; pointer-events: none;\
  transition: transform .28s cubic-bezier(.4,0,.2,1), opacity .22s ease;\
}\
.tt-popup.open {\
  transform: translateY(0) scale(1); opacity: 1; pointer-events: auto;\
}\
.tt-popup a {\
  display: flex; align-items: center; gap: 14px;\
  padding: 15px 18px; text-decoration: none !important;\
  transition: background-color .15s;\
  font-weight: 600; font-size: 15px;\
  font-family: "Inter", -apple-system, sans-serif;\
}\
.tt-popup a i {\
  width: 24px; text-align: center; font-size: 18px; flex-shrink: 0;\
}\
.tt-popup a.active-link { font-weight: 800; }\
.tt-popup .tt-div { height: 1px; margin: 0; }\
\
/* ═══ DARK THEME ═══ */\
.tt-nav[data-theme="dark"]   { background: #1a2332; border-color: #2d3a4d; }\
.tt-nav[data-theme="dark"] .tt-tab { color: #4b5e78; }\
.tt-nav[data-theme="dark"] .tt-tab:hover { color: #8899aa; }\
.tt-nav[data-theme="dark"] .tt-tab.on { color: #f5c518; }\
.tt-popup[data-theme="dark"] { background: #1a2332; border-color: #2d3a4d; box-shadow: 0 -6px 32px rgba(0,0,0,.5); }\
.tt-popup[data-theme="dark"] a { color: #dce4ec; }\
.tt-popup[data-theme="dark"] a:hover { background: rgba(255,255,255,.05); }\
.tt-popup[data-theme="dark"] a i { color: #f5c518; }\
.tt-popup[data-theme="dark"] .tt-div { background: #2d3a4d; }\
\
/* ═══ LIGHT THEME ═══ */\
.tt-nav[data-theme="light"]   { background: #ffffff; border-color: #e2e6ea; }\
.tt-nav[data-theme="light"] .tt-tab { color: #a0a8b4; }\
.tt-nav[data-theme="light"] .tt-tab:hover { color: #4b5563; }\
.tt-nav[data-theme="light"] .tt-tab.on { color: #b8860b; }\
.tt-popup[data-theme="light"] { background: #ffffff; border-color: #e2e6ea; box-shadow: 0 -6px 32px rgba(0,0,0,.1); }\
.tt-popup[data-theme="light"] a { color: #1f2937; }\
.tt-popup[data-theme="light"] a:hover { background: rgba(0,0,0,.03); }\
.tt-popup[data-theme="light"] a i { color: #b8860b; }\
.tt-popup[data-theme="light"] .tt-div { background: #e5e7eb; }\
\
/* ═══ PATTERN THEME ═══ */\
.tt-nav[data-theme="pattern"]   { background: rgba(35,25,16,.97); border-color: rgba(212,175,55,.22); }\
.tt-nav[data-theme="pattern"] .tt-tab { color: rgba(253,250,242,.3); }\
.tt-nav[data-theme="pattern"] .tt-tab:hover { color: rgba(253,250,242,.7); }\
.tt-nav[data-theme="pattern"] .tt-tab.on { color: #d4af37; }\
.tt-popup[data-theme="pattern"] { background: rgba(35,25,16,.97); border-color: rgba(212,175,55,.22); box-shadow: 0 -6px 32px rgba(0,0,0,.55); }\
.tt-popup[data-theme="pattern"] a { color: #fdfaf2; }\
.tt-popup[data-theme="pattern"] a:hover { background: rgba(212,175,55,.08); }\
.tt-popup[data-theme="pattern"] a i { color: #d4af37; }\
.tt-popup[data-theme="pattern"] .tt-div { background: rgba(212,175,55,.15); }\
';
  document.head.appendChild(style);

  /* ═══════════════════════════════════════════════════
     TẠO OVERLAY
     ═══════════════════════════════════════════════════ */
  var overlay = document.createElement('div');
  overlay.className = 'tt-overlay';
  document.body.appendChild(overlay);

  /* ═══════════════════════════════════════════════════
     TẠO POPUP "THÊM"
     ═══════════════════════════════════════════════════ */
  var popup = document.createElement('div');
  popup.className = 'tt-popup';
  popup.setAttribute('data-theme', getTheme());

  var popupHTML = '';
  MORE_TABS.forEach(function (tab, i) {
    if (i > 0) popupHTML += '<div class="tt-div"></div>';
    var isActive = (currentPage === tab.page);
    popupHTML += '<a href="' + tab.page + '" class="' + (isActive ? 'active-link' : '') + '">'
      + '<i class="fas ' + tab.icon + '"></i>'
      + '<span>' + tab.label + '</span>'
      + (isActive ? '<i class="fas fa-circle" style="font-size:6px;color:#d4af37;margin-left:auto"></i>' : '')
      + '</a>';
  });
  popup.innerHTML = popupHTML;
  document.body.appendChild(popup);

  /* ═══════════════════════════════════════════════════
     TẠO THANH NAV CHÍNH
     ═══════════════════════════════════════════════════ */
  var nav = document.createElement('nav');
  nav.className = 'tt-nav';
  nav.setAttribute('data-theme', getTheme());

  var tabsHTML = '';
  MAIN_TABS.forEach(function (tab) {
    var isActive = (currentPage === tab.page);
    tabsHTML += '<a href="' + tab.page + '" class="tt-tab ' + (isActive ? 'on' : '') + '">'
      + '<i class="fas ' + tab.icon + '"></i>'
      + '<span>' + tab.label + '</span>'
      + '</a>';
  });
  tabsHTML += '<button class="tt-tab ' + (isMoreActive ? 'on' : '') + '" id="tt-more-btn" type="button" aria-label="Xem thêm">'
    + '<i class="fas fa-ellipsis"></i>'
    + '<span>Thêm</span>'
    + '</button>';

  nav.innerHTML = '<div class="tt-row">' + tabsHTML + '</div>';
  document.body.appendChild(nav);

  /* ═══════════════════════════════════════════════════
     XỬ LÝ POPUP TOGGLE
     ═══════════════════════════════════════════════════ */
  var isOpen = false;

  function togglePopup(open) {
    isOpen = (open !== undefined) ? open : !isOpen;
    popup.classList.toggle('open', isOpen);
    overlay.classList.toggle('open', isOpen);
    var btn = document.getElementById('tt-more-btn');
    var icon = btn.querySelector('i');
    if (isOpen) {
      btn.classList.add('on');
      icon.className = 'fas fa-xmark';
    } else {
      if (!isMoreActive) btn.classList.remove('on');
      icon.className = 'fas fa-ellipsis';
    }
  }

  document.getElementById('tt-more-btn').addEventListener('click', function (e) {
    e.stopPropagation();
    togglePopup();
  });
  overlay.addEventListener('click', function () { togglePopup(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen) togglePopup(false);
  });

  /* ═══════════════════════════════════════════════════
     ĐỒNG BỘ THEME
     ═══════════════════════════════════════════════════ */
  function syncTheme() {
    var t = getTheme();
    nav.setAttribute('data-theme', t);
    popup.setAttribute('data-theme', t);
  }
  window.addEventListener('theme_changed', syncTheme);
  window.addEventListener('storage', function (e) {
    if (e.key === 'trantoc_theme') syncTheme();
  });

  /* ═══════════════════════════════════════════════════
     PADDING CHO CÁC TRANG BOOTSTRAP (không dùng h-screen)
     ═══════════════════════════════════════════════════ */
  var appDiv = document.getElementById('app');
  if (!appDiv || !appDiv.className || appDiv.className.indexOf('h-screen') === -1) {
    document.body.style.paddingBottom = '80px';
  }

})();
