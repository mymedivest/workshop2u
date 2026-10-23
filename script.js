(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* Mobile menu (all pages) */
  var toggle = $('.nav-toggle'), nav = $('#nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      toggle.setAttribute('aria-expanded', nav.classList.toggle('open'));
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }
    });
  }

  /* Footer: year, today's hours, open/closed status (Malaysia time) */
  var yr = $('#year'); if (yr) yr.textContent = new Date().getFullYear();
  var now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kuala_Lumpur' }));
  var day = now.getDay(), mins = now.getHours() * 60 + now.getMinutes();
  var isOpen = day !== 0 && mins >= 480 && mins < (day === 6 ? 720 : 1020);
  var today = $('#hours li[data-d="' + day + '"]'); if (today) today.classList.add('today');
  var status = $('#open-status'); if (status) status.textContent = isOpen ? 'We are open now.' : 'We are closed right now.';

  /* Home: hero slider */
  var slides = $$('.slide'), dotsBox = $('.dots');
  if (slides.length && dotsBox) {
    var current = 0, timer;
    var show = function (i) {
      current = (i + slides.length) % slides.length;
      slides.forEach(function (s, n) { s.classList.toggle('active', n === current); });
      $$('button', dotsBox).forEach(function (d, n) { d.classList.toggle('on', n === current); });
    };
    var restart = function () { clearInterval(timer); timer = setInterval(function () { show(current + 1); }, 6000); };
    slides.forEach(function (_, i) {
      var b = document.createElement('button');
      b.setAttribute('aria-label', 'Show slide ' + (i + 1));
      b.addEventListener('click', function () { show(i); restart(); });
      dotsBox.appendChild(b);
    });
    show(0); restart();
  }

  /* Home: counters */
  var counters = $$('.count');
  if (counters.length) {
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var run = function (el) {
      var to = +el.dataset.to;
      if (reduce) { el.textContent = to.toLocaleString(); return; }
      var start = null;
      requestAnimationFrame(function step(t) {
        start = start || t;
        var p = Math.min((t - start) / 1400, 1);
        el.textContent = Math.floor(to * p).toLocaleString();
        if (p < 1) requestAnimationFrame(step);
      });
    };
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (en) { if (en.isIntersecting) { run(en.target); io.unobserve(en.target); } });
      }, { threshold: 0.6 });
      counters.forEach(function (c) { io.observe(c); });
    } else { counters.forEach(run); }
  }

  /* Home: testimonials */
  var quotes = $$('.quotes blockquote'), qp = $('#q-prev'), qn = $('#q-next');
  if (quotes.length && qp && qn) {
    var q = 0;
    var showQuote = function (i) {
      q = (i + quotes.length) % quotes.length;
      quotes.forEach(function (el, n) { el.classList.toggle('active', n === q); });
    };
    qp.addEventListener('click', function () { showQuote(q - 1); });
    qn.addEventListener('click', function () { showQuote(q + 1); });
    setInterval(function () { showQuote(q + 1); }, 9000);
  }

  /* Forms (contact, members, book): validate, then show a message.
     Front-end only: connect to your backend, email service or WhatsApp. */
  $$('form.std').forEach(function (form) {
    var msg = $('.form-msg', form);
    var date = form.elements.date;
    if (date) date.min = new Date().toISOString().split('T')[0];
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      $$('input,select,textarea', form).forEach(function (f) { f.classList.add('touched'); });
      if (!form.checkValidity()) {
        msg.className = 'form-msg err';
        msg.textContent = 'Fill in every required field and try again.';
        return;
      }
      var text = (form.dataset.ok || 'Thanks. We will be in touch.').replace(/\{(\w+)\}/g, function (_, k) {
        var el = form.elements[k]; return el && el.value ? el.value : '';
      });
      msg.className = 'form-msg';
      msg.textContent = text;
      form.reset();
      $$('input,select,textarea', form).forEach(function (f) { f.classList.remove('touched'); });
    });
  });
})();
