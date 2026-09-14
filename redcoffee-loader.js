(function () {
  var script = document.currentScript;
  if (!script) return;
  var targetSelector = script.getAttribute('data-redcoffee-target') || '#redcoffee-embed';
  var target = document.querySelector(targetSelector);
  if (!target) { target = document.createElement('div'); target.id = targetSelector.replace(/^#/, '') || 'redcoffee-embed'; script.parentNode.insertBefore(target, script); }
  if (target.dataset.redcoffeeLoading === 'true' || target.querySelector('.rc-site')) return;
  target.dataset.redcoffeeLoading = 'true';
  var base = new URL('.', script.src);
  function asset(path) { return new URL(path, base).href; }
  if (!document.querySelector('link[data-redcoffee-style]')) {
    var link = document.createElement('link'); link.rel = 'stylesheet'; link.href = asset('redcoffee.css'); link.dataset.redcoffeeStyle = 'true'; document.head.appendChild(link);
  }
  fetch(asset('redcoffee-fragment.html')).then(function (response) {
    if (!response.ok) throw new Error('HTTP ' + response.status);
    return response.text();
  }).then(function (markup) {
    target.innerHTML = markup;
    var root = target.querySelector('.rc-site');
    if (!root) throw new Error('Redcoffee root not found');
    root.querySelectorAll('[src^="/assets/"]').forEach(function (node) { node.src = asset('assets/' + node.getAttribute('src').split('/').pop()); });
    window.__REDCOFFEE_PENDING_ROOT__ = root;
    var runtime = document.createElement('script'); runtime.src = asset('redcoffee-runtime.js'); runtime.async = false; document.body.appendChild(runtime);
  }).catch(function (error) {
    target.innerHTML = '<p style="padding:24px;font:14px sans-serif;color:#8b1e1e">紅菓咖啡頁面暫時無法載入，請稍後再試。</p>';
    console.error('[Redcoffee]', error);
  }).finally(function () { delete target.dataset.redcoffeeLoading; });
})();