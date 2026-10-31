/* EduPlay i18n
 * 规则：默认英文；浏览器语言以 zh 开头时显示中文；手动切换后用 localStorage 记忆。
 * 用法：
 *   1. 页面在 <head> 末尾引入 <script src="/js/i18n.js"></script>
 *   2. 页面定义 <script>window.__DICT = { zh:{...}, en:{...} };</script>（可选，公共文案已内置）
 *   3. 静态文案：元素加 data-i18n="key"（文本）/ data-i18n-ph（placeholder）/ data-i18n-aria（aria-label）/ data-i18n-title（title）
 *   4. 动态文案：window.EDU.t('key')
 *   5. 语言切换按钮由脚本自动注入到 nav .nav-inner 和 #mobileMenu
 */
(function () {
  'use strict';
  var STORAGE_KEY = 'eduplay-lang';

  /* 公共文案：导航 / 页脚 / 通用 */
  var COMMON = {
    zh: {
      'nav.games': '游戏大厅',
      'nav.blog': '学习博客',
      'nav.about': '关于我们',
      'nav.sitemap': '网站地图',
      'nav.privacy': '隐私政策',
      'nav.terms': '使用条款',
      'nav.contact': '联系我们',
      'nav.home': '首页',
      'skip.main': '跳到主内容',
      'lang.switchAria': 'Switch language / 切换语言',
      'footer.tagline': '免费在线教育游戏，让学习更有趣 🎮'
    },
    en: {
      'nav.games': 'Game Hub',
      'nav.blog': 'Blog',
      'nav.about': 'About Us',
      'nav.sitemap': 'Sitemap',
      'nav.privacy': 'Privacy Policy',
      'nav.terms': 'Terms of Use',
      'nav.contact': 'Contact Us',
      'nav.home': 'Home',
      'skip.main': 'Skip to main content',
      'lang.switchAria': 'Switch language / 切换语言',
      'footer.tagline': 'Free educational games that make learning fun 🎮'
    }
  };

  function detect() {
    try {
      var saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === 'zh' || saved === 'en') return saved;
    } catch (e) { /* localStorage 不可用时回退浏览器语言 */ }
    var nav = ((navigator.language || navigator.userLanguage || navigator.browserLanguage || '') + '').toLowerCase();
    return nav.indexOf('zh') === 0 ? 'zh' : 'en';
  }

  var lang = detect();

  function dictFor(l) {
    var d = window.__DICT || {};
    return d[l] || {};
  }

  function lookup(key) {
    var v = dictFor(lang)[key];
    if (v === undefined || v === null) v = COMMON[lang][key];
    return (v === undefined || v === null) ? key : v;
  }

  function t(key, vars) {
    var v = lookup(key);
    if (vars && typeof v === 'string') {
      Object.keys(vars).forEach(function (k) {
        v = v.split('{' + k + '}').join(vars[k]);
      });
    }
    return v;
  }

  function apply() {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    var els, i, key, v;
    els = document.querySelectorAll('[data-i18n]');
    for (i = 0; i < els.length; i++) {
      key = els[i].getAttribute('data-i18n');
      v = lookup(key);
      if (v !== key) els[i].textContent = v;
    }
    els = document.querySelectorAll('[data-i18n-html]');
    for (i = 0; i < els.length; i++) {
      key = els[i].getAttribute('data-i18n-html');
      v = lookup(key);
      if (v !== key) els[i].innerHTML = v;
    }
    els = document.querySelectorAll('[data-i18n-ph]');
    for (i = 0; i < els.length; i++) els[i].setAttribute('placeholder', lookup(els[i].getAttribute('data-i18n-ph')));
    els = document.querySelectorAll('[data-i18n-aria]');
    for (i = 0; i < els.length; i++) els[i].setAttribute('aria-label', lookup(els[i].getAttribute('data-i18n-aria')));
    els = document.querySelectorAll('[data-i18n-title]');
    for (i = 0; i < els.length; i++) els[i].setAttribute('title', lookup(els[i].getAttribute('data-i18n-title')));
    els = document.querySelectorAll('.lang-switch');
    for (i = 0; i < els.length; i++) els[i].textContent = lang === 'zh' ? 'EN' : '中文';
    els = document.querySelectorAll('[data-i18n-doc]');
    for (i = 0; i < els.length; i++) {
      key = els[i].getAttribute('data-i18n-doc');
      v = lookup(key);
      if (v !== key && document.title) document.title = v;
    }
  }

  function setLang(l) {
    lang = l === 'zh' ? 'zh' : 'en';
    try { window.localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* ignore */ }
    apply();
  }

  function makeSwitchBtn(id) {
    var b = document.createElement('button');
    b.id = id;
    b.type = 'button';
    b.className = 'lang-switch';
    b.setAttribute('data-i18n-aria', 'lang.switchAria');
    b.setAttribute('aria-label', 'Switch language / 切换语言');
    b.textContent = lang === 'zh' ? 'EN' : '中文';
    b.addEventListener('click', function () { setLang(lang === 'zh' ? 'en' : 'zh'); });
    return b;
  }

  function ensureSwitch() {
    var navInner = document.querySelector('nav .nav-inner') || document.querySelector('nav .site-nav-inner');
    if (navInner && !document.getElementById('langSwitch')) {
      navInner.appendChild(makeSwitchBtn('langSwitch'));
    }
    var mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu && !document.getElementById('langSwitchMobile')) {
      mobileMenu.appendChild(makeSwitchBtn('langSwitchMobile'));
    }
  }

  window.EDU = {
    getLang: function () { return lang; },
    setLang: setLang,
    t: t,
    apply: apply
  };

  function boot() {
    ensureSwitch();
    apply();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
