/* =========================================================
   Макс — сайты для Яндекс.Директ
   Динамика лендинга: скролл-анимации, меню, формы, FAQ
   ========================================================= */
(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Прогресс чтения страницы ---------- */
  var progress = document.querySelector('.scroll-progress');

  /* ---------- Шапка при скролле + кнопка "наверх" ---------- */
  var header = document.querySelector('.header');
  var toTop = document.querySelector('.fab__top');

  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;

    if (header) header.classList.toggle('is-scrolled', y > 40);

    if (progress) {
      var docH = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (docH > 0 ? (y / docH) * 100 : 0) + '%';
    }

    if (toTop) toTop.classList.toggle('is-visible', y > 700);

    spyHighlight(y);
    activeSection(y);
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Плавная прокрутка по якорям ---------- */
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link) return;
    var id = link.getAttribute('href');
    if (!id || id === '#') return;
    var target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    closeMenu();
    var offset = 68;
    var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top: top, behavior: reducedMotion ? 'auto' : 'smooth' });
    history.replaceState(null, '', id);
  });

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------- Мобильное меню ---------- */
  var burger = document.querySelector('.burger');
  var mobileMenu = document.querySelector('.mobile-menu');

  function closeMenu() {
    if (!burger || !mobileMenu) return;
    burger.classList.remove('is-open');
    mobileMenu.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (burger && mobileMenu) {
    burger.addEventListener('click', function () {
      var open = mobileMenu.classList.toggle('is-open');
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    mobileMenu.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeMenu();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeMenu();
      closeModal();
    }
  });

  /* ---------- Появление блоков при скролле ---------- */
  var revealItems = document.querySelectorAll('.reveal');

  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    revealItems.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Счётчики в блоке цифр ---------- */
  var counters = document.querySelectorAll('[data-count]');

  function animateCounter(el) {
    var end = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    var prefix = el.getAttribute('data-prefix') || '';
    var decimals = (String(end).split('.')[1] || '').length;
    var start = 0;
    var dur = 1400;
    var t0 = null;

    /* Разряды числа разделяем неразрывным пробелом: «4 900» */
    function fmt(num) {
      var p = Number(num).toFixed(decimals).split('.');
      p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0');
      return p.join(',');
    }

    function frame(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = start + (end - start) * eased;
      el.textContent = prefix + fmt(val) + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  if (counters.length) {
    if (reducedMotion || !('IntersectionObserver' in window)) {
      counters.forEach(function (el) {
        var end = parseFloat(el.getAttribute('data-count'));
        var dec = (String(end).split('.')[1] || '').length;
        var p = end.toFixed(dec).split('.');
        p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0');
        el.textContent = (el.getAttribute('data-prefix') || '') +
          p.join(',') + (el.getAttribute('data-suffix') || '');
      });
    } else {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            cio.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      counters.forEach(function (el) { cio.observe(el); });
    }
  }

  /* ---------- Аккордеон FAQ ---------- */
  document.querySelectorAll('.faq__item').forEach(function (item) {
    var btn = item.querySelector('.faq__q');
    var panel = item.querySelector('.faq__a');
    if (!btn || !panel) return;

    btn.addEventListener('click', function () {
      var isOpen = item.classList.contains('is-open');

      document.querySelectorAll('.faq__item.is-open').forEach(function (other) {
        if (other === item) return;
        other.classList.remove('is-open');
        var ob = other.querySelector('.faq__q');
        var op = other.querySelector('.faq__a');
        if (ob) ob.setAttribute('aria-expanded', 'false');
        if (op) op.style.maxHeight = null;
      });

      item.classList.toggle('is-open', !isOpen);
      btn.setAttribute('aria-expanded', String(!isOpen));
      panel.style.maxHeight = !isOpen ? panel.scrollHeight + 'px' : null;
    });
  });

  window.addEventListener('resize', function () {
    var open = document.querySelector('.faq__item.is-open .faq__a');
    if (open) open.style.maxHeight = open.scrollHeight + 'px';
    if (window.innerWidth > 960) closeMenu();
  });

  /* ---------- Подсветка пунктов меню ---------- */
  var navLinks = Array.prototype.slice.call(
    document.querySelectorAll('.nav a[href^="#"], .mobile-menu a.m-link[href^="#"]')
  );
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  function spyHighlight(y) {
    var current = null;
    sections.forEach(function (sec) {
      if (sec.getBoundingClientRect().top - 140 <= 0) current = sec.id;
    });
    navLinks.forEach(function (a) {
      a.classList.toggle('is-active', current !== null && a.getAttribute('href') === '#' + current);
    });
  }

  /* ---------- Активная страница в меню (для внутренних страниц) ---------- */
  function activeSection() {}
  var pageNav = document.querySelectorAll('.nav a[data-page], .mobile-menu a[data-page]');
  var here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  pageNav.forEach(function (a) {
    if (a.getAttribute('href').toLowerCase() === here) a.classList.add('is-active');
  });

  /* ---------- Модальное окно заявки ---------- */
  var modal = document.querySelector('.modal');

  function openModal() {
    if (!modal) return;
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    var first = modal.querySelector('input, textarea, button');
    if (first) setTimeout(function () { first.focus(); }, 250);
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('is-open');
    if (!mobileMenu || !mobileMenu.classList.contains('is-open')) {
      document.body.style.overflow = '';
    }
  }

  document.querySelectorAll('[data-modal-open]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      closeMenu();
      openModal();
    });
  });

  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === modal || e.target.closest('[data-modal-close]')) closeModal();
    });
  }

  /* ---------- Валидация и отправка форм ---------- */
  function validate(form) {
    var ok = true;
    form.querySelectorAll('[required]').forEach(function (field) {
      var wrap = field.closest('.field');
      var value = (field.value || '').trim();
      var valid = value.length > 0;

      if (field.type === 'checkbox') valid = field.checked;
      if (valid && field.type === 'tel') {
        valid = value.replace(/\D/g, '').length >= 10;
      }
      if (valid && field.type === 'email') {
        valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
      }
      if (wrap) wrap.classList.toggle('field--error', !valid);
      if (!valid) ok = false;
    });
    return ok;
  }

  document.querySelectorAll('form[data-lead-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate(form)) {
        var bad = form.querySelector('.field--error input, .field--error textarea');
        if (bad) bad.focus();
        return;
      }

      var data = new FormData(form);
      var name = (data.get('name') || 'Клиент').toString();
      var phone = (data.get('phone') || '').toString();
      var email = (data.get('email') || '').toString();
      var task = (data.get('task') || '').toString();

      var subject = 'Заказ обратного звонка — ' + name;
      var body = [
        'Имя: ' + name,
        'Телефон: ' + phone,
        'E-mail: ' + email,
        '',
        'Задача:',
        task
      ].join('\n');

      var mailLink = 'mailto:sey3@yandex.ru?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);

      var success = form.querySelector('.form-success') || form.parentElement.querySelector('.form-success');
      var fields = form.querySelector('.form-grid');
      var note = form.querySelector('.form-note');

      if (fields) fields.style.display = 'none';
      if (note) note.style.display = 'none';
      if (success) success.classList.add('is-visible');

      /* Открываем почтовый клиент, чтобы письмо ушло сразу */
      setTimeout(function () { window.location.href = mailLink; }, 400);
    });

    form.querySelectorAll('input, textarea').forEach(function (field) {
      field.addEventListener('input', function () {
        var wrap = field.closest('.field');
        if (wrap) wrap.classList.remove('field--error');
      });
    });
  });

  /* ---------- Лёгкий параллакс для декоративных сфер ---------- */
  if (!reducedMotion && window.matchMedia('(pointer: fine)').matches) {
    var blobs = document.querySelectorAll('.blob');
    if (blobs.length) {
      window.addEventListener('mousemove', function (e) {
        var cx = (e.clientX / window.innerWidth - 0.5) * 2;
        var cy = (e.clientY / window.innerHeight - 0.5) * 2;
        blobs.forEach(function (b, i) {
          var k = (i + 1) * 8;
          b.style.transform = 'translate(' + cx * k + 'px,' + cy * k + 'px)';
        });
      }, { passive: true });
    }
  }

  /* ---------- Прячем плавающие кнопки у формы заявки ---------- */
  var fabBox = document.querySelector('.fab');
  var contactZone = document.querySelector('#contacts') || document.querySelector('#form');
  if (fabBox && contactZone && 'IntersectionObserver' in window) {
    var fio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        fabBox.classList.toggle('is-muted', entry.isIntersecting);
      });
    }, { threshold: 0.18 });
    fio.observe(contactZone);
  }

  /* ---------- Год в подвале ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  onScroll();
})();
