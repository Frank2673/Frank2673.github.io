/* ==========================================================================
   Frank2673.github.io — 交互脚本
   原则：渐进增强。禁用 JS 时页面依然可读、可导航（只是少了动效与主题记忆）。
   无框架、无依赖、无构建步骤。
   ========================================================================== */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var prefersReducedMotion = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  /* ----------------------------------------------------------------------
     1. 主题切换（深色 / 浅色）
     初始主题已在 <head> 内联脚本里决定，这里只负责切换与记忆
     ---------------------------------------------------------------------- */
  function initTheme() {
    var toggle = doc.querySelector('.theme-toggle');
    if (!toggle) return;

    var metaThemeColor = doc.querySelector('meta[name="theme-color"]');

    function syncMeta() {
      if (!metaThemeColor) return;
      metaThemeColor.setAttribute(
        'content',
        root.dataset.theme === 'light' ? '#f7f9fc' : '#0b1120'
      );
    }

    toggle.addEventListener('click', function () {
      var next = root.dataset.theme === 'light' ? 'dark' : 'light';
      root.dataset.theme = next;
      try {
        localStorage.setItem('theme', next);
      } catch (e) {
        /* 隐私模式下 localStorage 可能不可用，忽略即可 */
      }
      syncMeta();
    });

    syncMeta();
  }

  /* ----------------------------------------------------------------------
     2. 移动端导航
     ---------------------------------------------------------------------- */
  function initNav() {
    var toggle = doc.querySelector('.nav-toggle');
    var nav = doc.getElementById('site-nav');
    if (!toggle || !nav) return;

    function close() {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }

    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      if (open) {
        close();
      } else {
        nav.classList.add('is-open');
        toggle.setAttribute('aria-expanded', 'true');
      }
    });

    /* 点击链接后自动收起 */
    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) close();
    });

    /* Esc 关闭 */
    doc.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') close();
    });

    /* 点击空白处关闭 */
    doc.addEventListener('click', function (event) {
      if (!nav.classList.contains('is-open')) return;
      if (nav.contains(event.target) || toggle.contains(event.target)) return;
      close();
    });

    /* 视口变宽后重置状态，避免残留展开态 */
    window.addEventListener('resize', function () {
      if (window.innerWidth > 720) close();
    });
  }

  /* ----------------------------------------------------------------------
     3. 滚动揭示动效
     ---------------------------------------------------------------------- */
  function initReveal() {
    var items = Array.prototype.slice.call(doc.querySelectorAll('.reveal'));
    if (!items.length) return;

    /* 无 IntersectionObserver 或用户要求减少动效：直接显示 */
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );

    items.forEach(function (el, index) {
      /* 同组元素错开一点，避免整块同时弹出 */
      el.style.transitionDelay = Math.min(index % 6, 5) * 55 + 'ms';
      observer.observe(el);
    });
  }

  /* ----------------------------------------------------------------------
     4. 导航高亮 + 顶栏投影
     ---------------------------------------------------------------------- */
  function initScrollSpy() {
    var header = doc.querySelector('.site-header');
    var links = Array.prototype.slice.call(doc.querySelectorAll('.site-nav a[href^="#"]'));
    var sections = links
      .map(function (link) {
        var id = link.getAttribute('href').slice(1);
        return doc.getElementById(id);
      })
      .filter(Boolean);

    /* 顶栏：滚动后加阴影 */
    if (header) {
      var onScroll = function () {
        header.classList.toggle('is-scrolled', window.scrollY > 8);
      };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    if (!sections.length || !('IntersectionObserver' in window)) return;

    var visible = new Set();

    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        });

        /* 取当前视口中最靠上的已激活区块 */
        var activeId = sections
          .map(function (s) { return s.id; })
          .filter(function (id) { return visible.has(id); })[0];

        links.forEach(function (link) {
          var isActive = activeId && link.getAttribute('href') === '#' + activeId;
          if (isActive) link.setAttribute('aria-current', 'true');
          else link.removeAttribute('aria-current');
        });
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    );

    sections.forEach(function (section) {
      spy.observe(section);
    });
  }

  /* ----------------------------------------------------------------------
     5. 其它细节
     ---------------------------------------------------------------------- */
  function initMisc() {
    /* 年份自动更新，避免每年手改 */
    var year = doc.getElementById('year');
    if (year) year.textContent = String(new Date().getFullYear());

    /* 平滑滚动：原生支持不佳时降级（CSS scroll-behavior 已覆盖现代浏览器） */
    if (!('scrollBehavior' in doc.documentElement.style)) {
      doc.querySelectorAll('a[href^="#"]').forEach(function (link) {
        link.addEventListener('click', function (event) {
          var id = link.getAttribute('href').slice(1);
          var target = doc.getElementById(id);
          if (!target) return;
          event.preventDefault();
          window.scrollTo(0, target.getBoundingClientRect().top + window.scrollY - 80);
        });
      });
    }
  }

  /* 启动 */
  function boot() {
    initTheme();
    initNav();
    initReveal();
    initScrollSpy();
    initMisc();
  }

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
