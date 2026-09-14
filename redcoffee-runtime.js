
(function () {
  var script = document.currentScript;
  var root = window.__REDCOFFEE_PENDING_ROOT__;
  try { delete window.__REDCOFFEE_PENDING_ROOT__; } catch (_) { window.__REDCOFFEE_PENDING_ROOT__ = null; }
  if (!root) root = script && script.previousElementSibling;
  if (!root || !root.classList.contains('rc-site')) root = document.querySelector('.rc-site[data-redcoffee-site]');
  if (!root || root.dataset.rcInitialized === 'true') return;
  root.dataset.rcInitialized = 'true';

  var logoTrack = root.querySelector('.logo-track');
  if (logoTrack && !logoTrack.dataset.rcCloned) {
    logoTrack.dataset.rcCloned = 'true';
    Array.from(logoTrack.children).forEach(function (logo) { logoTrack.appendChild(logo.cloneNode(true)); });
  }

  var STORAGE_KEY = 'redcoffee_locale';
  var CHINESE_REGIONS = ['TW', 'HK', 'MO', 'CN'];
  var chineseZones = ['Asia/Taipei', 'Asia/Hong_Kong', 'Asia/Macau', 'Asia/Shanghai', 'Asia/Chongqing', 'Asia/Urumqi'];
  var saved = null;
  try { saved = localStorage.getItem(STORAGE_KEY); } catch (_) {}

  function browserLanguage() {
    var locale = navigator.languages && navigator.languages[0] || navigator.language || '';
    var match = locale.match(/[-_]([A-Za-z]{2})\b/);
    if (match) return CHINESE_REGIONS.indexOf(match[1].toUpperCase()) >= 0 ? 'zh' : 'en';
    var zone = '';
    try { zone = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (_) {}
    return chineseZones.indexOf(zone) >= 0 ? 'zh' : 'en';
  }

  var language = saved === 'zh' || saved === 'en' ? saved : browserLanguage();

  function applyLanguage(nextLanguage, remember) {
    language = nextLanguage === 'zh' ? 'zh' : 'en';
    root.lang = language === 'zh' ? 'zh-Hant' : 'en';
    root.classList.toggle('zh', language === 'zh');
    root.classList.toggle('en', language === 'en');
    root.querySelectorAll('[data-rc-en][data-rc-zh]').forEach(function (element) {
      element.textContent = element.getAttribute('data-rc-' + language) || '';
    });
    ['aria-label', 'placeholder', 'title'].forEach(function (name) {
      root.querySelectorAll('[data-rc-' + name + '-en][data-rc-' + name + '-zh]').forEach(function (element) {
        element.setAttribute(name, element.getAttribute('data-rc-' + name + '-' + language) || '');
      });
    });
    root.querySelectorAll('.language-toggle').forEach(function (button) {
      var labels = button.querySelectorAll('span');
      if (labels[0]) labels[0].classList.toggle('active', language === 'en');
      if (labels[1]) labels[1].classList.toggle('active', language === 'zh');
    });
    if (remember) {
      try { localStorage.setItem(STORAGE_KEY, language); } catch (_) {}
      document.cookie = STORAGE_KEY + '=' + language + '; Max-Age=31536000; Path=/; SameSite=Lax';
    }
  }

  applyLanguage(language, false);
  root.classList.add('rc-ready');

  root.querySelectorAll('.language-toggle').forEach(function (button) {
    button.addEventListener('click', function () { applyLanguage(language === 'zh' ? 'en' : 'zh', true); });
  });

  if (!saved) {
    var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timeout = setTimeout(function () { if (controller) controller.abort(); }, 1400);
    fetch('/cdn-cgi/trace', { signal: controller && controller.signal, credentials: 'same-origin' })
      .then(function (response) { return response.ok ? response.text() : ''; })
      .then(function (text) {
        var match = text.match(/^loc=([A-Z]{2})$/m);
        if (match) applyLanguage(CHINESE_REGIONS.indexOf(match[1]) >= 0 ? 'zh' : 'en', false);
      })
      .catch(function () {})
      .finally(function () { clearTimeout(timeout); });
  }

  var modal = root.querySelector('.contact-modal');
  function setModal(open) {
    if (!modal) return;
    modal.classList.toggle('open', open);
    modal.setAttribute('aria-hidden', open ? 'false' : 'true');
  }
  root.querySelectorAll('main .button.primary, .nav-cta, .plan-card.full > button').forEach(function (button) {
    button.addEventListener('click', function () { setModal(true); });
  });
  root.querySelectorAll('.modal-backdrop, .modal-close').forEach(function (button) {
    button.addEventListener('click', function () { setModal(false); });
  });
  document.addEventListener('keydown', function (event) { if (event.key === 'Escape') setModal(false); });

  var form = root.querySelector('.modal-card form');
  if (form) form.addEventListener('submit', function (event) {
    event.preventDefault();
    form.innerHTML = '<div class="sent-state"><span>✓</span><h2>' + (language === 'zh' ? '收到，謝謝你。' : 'Thank you—we’ve got it.') + '</h2><p>' + (language === 'zh' ? '這是離線研究版，不會真的送出資料。' : 'This offline study does not send any information.') + '</p><button type="button">' + (language === 'zh' ? '回到頁面' : 'Back to the page') + '</button></div>';
    form.querySelector('button').addEventListener('click', function () { setModal(false); });
  });

  root.querySelectorAll('.faq-item > button').forEach(function (button) {
    button.addEventListener('click', function () {
      var item = button.closest('.faq-item');
      var open = !item.classList.contains('open');
      root.querySelectorAll('.faq-item.open').forEach(function (other) {
        other.classList.remove('open');
        var otherButton = other.querySelector(':scope > button');
        if (otherButton) { otherButton.setAttribute('aria-expanded', 'false'); otherButton.querySelector('i').textContent = '+'; }
      });
      item.classList.toggle('open', open);
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
      button.querySelector('i').textContent = open ? '−' : '+';
    });
  });

  var revealObserver = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) { if (entry.isIntersecting) entry.target.classList.add('is-visible'); });
  }, { threshold: 0.1 }) : null;
  root.querySelectorAll('.reveal, .stagger > *').forEach(function (element) {
    if (revealObserver) revealObserver.observe(element); else element.classList.add('is-visible');
  });

  var scene = root.querySelector('#rc-scene');
  var context = scene && scene.getContext('2d');
  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var beanCount = window.innerWidth < 680 ? 72 : 144;
  var beans = Array.from({ length: beanCount }, function (_, index) {
    function random(salt) { var value = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453; return value - Math.floor(value); }
    return { x: random(1) * innerWidth, y: random(2) * innerHeight, size: 7 + random(3) * 17, rotation: random(4) * Math.PI, seed: random(5) };
  });
  var width = 1, height = 1, dpr = Math.min(devicePixelRatio || 1, 1.25), currentForm = 'field', dark = false;

  function resizeScene() {
    if (!scene || !context) return;
    width = innerWidth; height = innerHeight;
    scene.width = Math.round(width * dpr); scene.height = Math.round(height * dpr);
    scene.style.width = width + 'px'; scene.style.height = height + 'px';
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function targetFor(index, form) {
    var bean = beans[index], x = bean.seed, y = (bean.seed * 7.17) % 1;
    if (form === 'clusters') {
      var centers = [[.2,.28],[.5,.63],[.8,.3]]; var c = centers[index % centers.length];
      return { x: (c[0] + (x - .5) * .25) * width, y: (c[1] + (y - .5) * .22) * height };
    }
    if (form === 'towers7') {
      var columns = 7; return { x: ((index % columns) + .5) / columns * width, y: ((Math.floor(index / columns) % 10) + .8) / 11 * height };
    }
    if (form === 'towers2') {
      var side = index % 2; return { x: (side ? .79 : .21) * width + (x - .5) * width * .16, y: (.12 + y * .78) * height };
    }
    if (form === 'grid') {
      var cols = 18, row = Math.floor(index / cols), col = index % cols, depth = row / Math.max(1, Math.ceil(beanCount / cols) - 1);
      return { x: width * .5 + (col - (cols - 1) / 2) * (34 + depth * 26), y: height * (.35 + depth * .58) };
    }
    if (form === 'scatter') return { x: (.04 + x * .92) * width, y: (.08 + y * .84) * height };
    var gridCols = 16; return { x: ((index % gridCols) + .5) / gridCols * width, y: ((Math.floor(index / gridCols) % 9) + .5) / 9 * height };
  }

  function drawBean(ctx, x, y, size, rotation, alpha) {
    ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y); ctx.rotate(rotation); ctx.scale(.82, 1);
    ctx.shadowColor = 'rgba(25,8,2,.28)'; ctx.shadowBlur = size * .18; ctx.shadowOffsetY = size * .1;
    var gradient = ctx.createRadialGradient(-size * .18, -size * .25, 1, 0, 0, size * .62);
    gradient.addColorStop(0, '#c77b40'); gradient.addColorStop(.45, '#96502d'); gradient.addColorStop(1, '#482218');
    ctx.beginPath(); ctx.moveTo(0, -size * .52); ctx.bezierCurveTo(size * .5, -size * .43, size * .53, size * .28, size * .04, size * .53); ctx.bezierCurveTo(-size * .45, size * .48, -size * .55, -size * .27, 0, -size * .52); ctx.fillStyle = gradient; ctx.fill();
    ctx.shadowColor = 'transparent'; ctx.beginPath(); ctx.moveTo(-size * .04, -size * .4); ctx.bezierCurveTo(size * .17, -size * .18, -size * .16, size * .12, size * .06, size * .4); ctx.strokeStyle = 'rgba(253,190,120,.63)'; ctx.lineWidth = Math.max(1, size * .055); ctx.lineCap = 'round'; ctx.stroke(); ctx.restore();
  }

  function updateSceneState() {
    var line = height * .5, nearest = null, distance = Infinity;
    root.querySelectorAll('[data-form]').forEach(function (section) {
      var rect = section.getBoundingClientRect();
      var nextDistance = rect.top <= line && rect.bottom >= line ? 0 : Math.min(Math.abs(rect.top - line), Math.abs(rect.bottom - line));
      if (nextDistance < distance) { distance = nextDistance; nearest = section; }
    });
    if (nearest) currentForm = nearest.getAttribute('data-form') || 'field';
    var rootRect = root.getBoundingClientRect();
    var progress = Math.max(0, Math.min(1, -rootRect.top / Math.max(1, root.scrollHeight - height)));
    dark = progress > .48;
    root.classList.toggle('dark', dark); root.classList.toggle('light', !dark);
  }

  function renderScene(time) {
    if (!context) return;
    context.clearRect(0, 0, width, height);
    beans.forEach(function (bean, index) {
      var target = targetFor(index, currentForm);
      bean.x += (target.x - bean.x) * .065; bean.y += (target.y - bean.y) * .065;
      var float = reducedMotion ? 0 : Math.sin(time * .00065 + bean.seed * 12) * 4.5;
      drawBean(context, bean.x, bean.y + float, bean.size, bean.rotation + time * .00008 * (bean.seed - .5), dark ? .67 : .48);
    });
    requestAnimationFrame(renderScene);
  }
  resizeScene(); updateSceneState(); addEventListener('resize', resizeScene); addEventListener('scroll', updateSceneState, { passive: true }); requestAnimationFrame(renderScene);

  var contact = root.querySelector('#rc-contact');
  var transition = root.querySelector('.cinema-transition');
  var cinemaCanvas = root.querySelector('#rc-cinema-bean');
  var cinemaContext = cinemaCanvas && cinemaCanvas.getContext('2d');
  var cinemaPlayed = false;
  function playCinema() {
    if (cinemaPlayed || !transition || !cinemaContext) return;
    cinemaPlayed = true; transition.classList.add('is-active');
    var cw = innerWidth, ch = innerHeight, cdpr = Math.min(devicePixelRatio || 1, 1.3);
    cinemaCanvas.width = Math.round(cw * cdpr); cinemaCanvas.height = Math.round(ch * cdpr); cinemaCanvas.style.width = cw + 'px'; cinemaCanvas.style.height = ch + 'px'; cinemaContext.setTransform(cdpr, 0, 0, cdpr, 0, 0);
    var start = performance.now(), duration = reducedMotion ? 1 : 2700;
    function ease(value) { return value * value * (3 - 2 * value); }
    function point(a, b, c, t) { var inv = 1 - t; return inv * inv * a + 2 * inv * t * b + t * t * c; }
    function frame(now) {
      var p = Math.min(1, (now - start) / duration), path = p < .34 ? ease(p / .34) * .48 : p < .66 ? .48 + ease((p - .34) / .32) * .08 : .56 + ease((p - .66) / .34) * .44;
      cinemaContext.clearRect(0, 0, cw, ch);
      var x = point(-cw * .22, cw * .5, cw * 1.22, path), y = point(ch * .67, ch * .26, ch * .63, path);
      var size = Math.min(cw * .72, ch * 1.04) * Math.pow(Math.sin(Math.PI * path), .72) + Math.min(cw, ch) * .09;
      cinemaContext.fillStyle = 'rgba(10,3,2,' + (.12 + Math.sin(Math.PI * path) * .2) + ')'; cinemaContext.fillRect(0, 0, cw, ch);
      drawBean(cinemaContext, x, y, size, -.58 + path * 1.08 + Math.sin(p * Math.PI * 4.4) * .24, 1);
      if (p > .7) transition.classList.add('show-title');
      if (p < 1) requestAnimationFrame(frame); else {
        cinemaContext.clearRect(0, 0, cw, ch);
        setTimeout(function () { transition.classList.remove('show-title'); }, 1900);
        setTimeout(function () { transition.classList.remove('is-active'); }, 2550);
      }
    }
    requestAnimationFrame(frame);
  }
  if (contact && 'IntersectionObserver' in window) {
    var cinemaObserver = new IntersectionObserver(function (entries) { if (entries.some(function (entry) { return entry.isIntersecting; })) { playCinema(); cinemaObserver.disconnect(); } }, { threshold: .06, rootMargin: '-18% 0px -26% 0px' });
    cinemaObserver.observe(contact);
  }
})();