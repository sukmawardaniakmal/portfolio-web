/* ==========================================================================
   Portfolio — interaction layer
   Light, minimal. No dependencies.
   ========================================================================== */
(function () {
  'use strict';

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- Preloader ---------------- */
  (function preloader() {
    var bar = $('#plBar');
    var pct = $('#plPct');
    var pre = $('#preloader');
    if (!bar || !pct || !pre) return;

    var value = 0;
    var done = false;
    var step = setInterval(function () {
      value = Math.min(value + Math.random() * 11 + 3, 92);
      paint(value);
    }, 110);

    function paint(v) {
      var n = Math.round(v);
      bar.style.width = n + '%';
      pct.textContent = n;
    }

    function finish() {
      if (done) return;
      done = true;
      clearInterval(step);
      paint(100);
      setTimeout(function () {
        document.body.classList.remove('is-loading');
        document.body.classList.add('is-loaded');
        setTimeout(function () {
          pre.setAttribute('hidden', '');
          revealInView();
        }, 800);
      }, 320);
    }

    if (document.readyState === 'complete') {
      setTimeout(finish, 700);
    } else {
      window.addEventListener('load', function () { setTimeout(finish, 700); });
    }
    // safety net
    setTimeout(finish, 5200);
  })();

  /* ---------------- Header ---------------- */
  (function header() {
    var el = $('#header');
    var burger = $('#burger');
    var nav = $('#nav');
    if (!el) return;

    var lastState = false;
    function onScroll() {
      var scrolled = window.scrollY > 12;
      if (scrolled !== lastState) {
        el.classList.toggle('is-scrolled', scrolled);
        lastState = scrolled;
      }
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    if (!burger || !nav) return;

    function closeNav() {
      nav.classList.remove('is-open');
      burger.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Buka menu');
    }

    burger.addEventListener('click', function () {
      var open = !nav.classList.contains('is-open');
      nav.classList.toggle('is-open', open);
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
    });

    $$('.nav__link', nav).forEach(function (a) {
      a.addEventListener('click', closeNav);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) closeNav();
    });
  })();

  /* ---------------- Reveal on scroll ---------------- */
  var revealObserver = null;
  if ('IntersectionObserver' in window) {
    revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  }

  function revealInView() {
    var items = $$('.reveal:not(.is-in)');
    items.forEach(function (el) {
      var delay = parseInt(el.getAttribute('data-delay') || '0', 10);
      if (delay) el.style.transitionDelay = delay + 'ms';
      if (revealObserver) {
        revealObserver.observe(el);
      } else {
        el.classList.add('is-in');
      }
    });
  }

  if (document.readyState !== 'loading') revealInView();
  else document.addEventListener('DOMContentLoaded', revealInView);

  /* ---------------- Active nav link ---------------- */
  (function activeNav() {
    var links = $$('.nav__link');
    if (!links.length || !('IntersectionObserver' in window)) return;

    var map = {};
    links.forEach(function (link) {
      var id = link.getAttribute('href');
      if (id && id.charAt(0) === '#') map[id.slice(1)] = link;
    });

    var ids = Object.keys(map);
    // Tech stack has no dedicated nav item — keep "Experience" active through it.
    if (map.experience && !map.skills && document.getElementById('skills')) {
      map.skills = map.experience;
      ids.push('skills');
    }
    var sections = ids
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean);

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (l) { l.classList.remove('is-active'); });
        var active = map[entry.target.id];
        if (active) active.classList.add('is-active');
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach(function (s) { obs.observe(s); });
  })();

  /* ---------------- Typing roles ---------------- */
  (function typing() {
    var el = $('#roleText');
    if (!el) return;
    var roles = [
      'Graphic Designer',
      'Front-End Developer',
      'UI/UX Designer',
      'Information Systems Student'
    ];
    if (reduceMotion) return;

    var idx = 0;
    var char = roles[0].length;
    var deleting = false;

    function tick() {
      var word = roles[idx];
      if (!deleting) {
        char += 1;
        el.textContent = word.slice(0, char);
        if (char >= word.length) {
          deleting = true;
          setTimeout(tick, 1700);
          return;
        }
        setTimeout(tick, 62);
      } else {
        char -= 1;
        el.textContent = word.slice(0, char);
        if (char <= 0) {
          deleting = false;
          idx = (idx + 1) % roles.length;
          setTimeout(tick, 260);
          return;
        }
        setTimeout(tick, 32);
      }
    }

    setTimeout(function () {
      el.textContent = '';
      char = 0;
      tick();
    }, 1400);
  })();

  /* ---------------- Counters ---------------- */
  (function counters() {
    var nodes = $$('.count');
    if (!nodes.length) return;

    function run(el) {
      var target = parseInt(el.getAttribute('data-count') || '0', 10);
      if (reduceMotion) { el.textContent = target; return; }
      var start = performance.now();
      var dur = 1300;
      function frame(now) {
        var p = Math.min((now - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased);
        if (p < 1) requestAnimationFrame(frame);
        else el.textContent = target;
      }
      requestAnimationFrame(frame);
    }

    if (!('IntersectionObserver' in window)) {
      nodes.forEach(run);
      return;
    }

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        run(entry.target);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.5 });

    nodes.forEach(function (n) { obs.observe(n); });
  })();

  /* ---------------- Project modal ---------------- */
  (function modal() {
    var wrap = $('#projectModal');
    if (!wrap) return;
    var panel = $('.modal__panel', wrap);
    var img = $('#modalImg');
    var meta = $('#modalMeta');
    var title = $('#modalTitle');
    var desc = $('#modalDesc');
    var list = $('#modalList');
    var tech = $('#modalTech');
    var lastFocus = null;

    function open(card) {
      var cardImg = $('img', card);
      var cardMeta = $('.work__meta', card);
      var cardTitle = $('.work__title', card);
      var cardDesc = $('.work__desc', card);
      var feats = $$('.work__features li', card);
      var techs = $$('.work__tech span', card);

      if (cardImg) { img.src = cardImg.currentSrc || cardImg.src; img.alt = cardImg.alt || ''; }
      meta.textContent = cardMeta ? cardMeta.textContent : '';
      title.textContent = cardTitle ? cardTitle.textContent : '';
      desc.textContent = cardDesc ? cardDesc.textContent.trim() : '';

      list.innerHTML = '';
      feats.forEach(function (li) {
        var item = document.createElement('li');
        item.textContent = li.textContent;
        list.appendChild(item);
      });

      tech.innerHTML = '';
      techs.forEach(function (span) {
        var t = document.createElement('span');
        t.textContent = span.textContent;
        tech.appendChild(t);
      });

      lastFocus = document.activeElement;
      wrap.hidden = false;
      document.body.style.overflow = 'hidden';
      var x = $('.modal__x', wrap);
      if (x) x.focus();
    }

    function close() {
      wrap.hidden = true;
      document.body.style.overflow = '';
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('[data-project]');
      if (trigger) {
        var card = trigger.closest('.work');
        if (card) { e.preventDefault(); open(card); }
        return;
      }
      if (e.target.closest('[data-close]')) { close(); }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !wrap.hidden) close();
      if (e.key === 'Tab' && !wrap.hidden) {
        var focusables = $$('button, a[href], input, textarea', panel);
        if (!focusables.length) return;
        var first = focusables[0];
        var last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  })();

  /* ---------------- Assistant chat ---------------- */
  (function assistant() {
    var root = $('#assistant');
    var fab = $('#assistantFab');
    var panel = $('#assistantPanel');
    var closeBtn = $('#assistantClose');
    var form = $('#chatForm');
    var input = $('#chatInput');
    var body = $('#chatBody');
    var quick = $('#chatQuick');
    if (!root || !fab || !panel || !form) return;

    var answers = [
      {
        k: ['project', 'karya', 'proyek', 'portfolio', 'portofolio', 'works'],
        a: 'Ada 6 karya utama: website HIMSI Arka Nika, identity &amp; ID card 5 divisi, logo &amp; visual identity kabinet, kalender &amp; materi promosi, modul pembayaran QRIS, dan dokumentasi kegiatan. Detail lengkapnya ada di section <a href="#works">Projects</a>.'
      },
      {
        k: ['skill', 'keahlian', 'tools', 'stack', 'kemampuan', 'bisa apa', 'bisa ngapain'],
        a: 'Skill utamanya: Figma, Canva, PixelLab, HTML5, CSS3, JavaScript, Tailwind CSS, Flutter (Dart), Git &amp; GitHub, VS Code, plus Microsoft Office. Untuk organisasi: event management, koordinasi tim, dan pengarsipan dokumen.'
      },
      {
        k: ['pengalaman', 'experience', 'organisasi', 'himsi', 'kerja', 'magang', 'intern'],
        a: 'Saat ini Sekretaris HIMSI Universitas Alma Ata (2025—sekarang): administrasi, surat kepanitiaan, notulensi, dan koordinasi antar divisi. Sebelumnya aktif sebagai graphic designer untuk proyek dan kepanitiaan himpunan.'
      },
      {
        k: ['pendidikan', 'kuliah', 'kampus', 'alma', 'jurusan', 'nim', 'mahasiswa'],
        a: 'S1 Sistem Informasi, Universitas Alma Ata (Bantul, DIY), 2024—sekarang. NIM 243100411. Fokus: basis data, pemrograman web, IMK, dan rekayasa perangkat lunak.'
      },
      {
        k: ['kontak', 'contact', 'email', 'whatsapp', 'wa', 'instagram', 'hubungi', 'nomor', 'telpon', 'telepon'],
        a: 'Bisa lewat email <a href="mailto:sukmawardaniakmal@gmail.com">sukmawardaniakmal@gmail.com</a>, WhatsApp <a href="https://wa.me/6282285718916">+62 822-8571-8916</a>, atau Instagram <a href="https://www.instagram.com/akmal.skw">@akmal.skw</a>.'
      },
      {
        k: ['cv', 'resume', 'download', 'unduh'],
        a: 'CV lengkapnya bisa diunduh di sini: <a href="assets/cv/CV-Akmal-Sukma-Wardani.pdf" target="_blank" rel="noopener">CV Akmal Sukma Wardani (PDF)</a>.'
      },
      {
        k: ['sertifikat', 'kemnaker', 'desainer', 'kompetensi', 'bnsp', 'pelatihan'],
        a: 'Punya sertifikat Pelatihan Desainer Grafis Madya (260 JP) dari Kemnaker RI, Juni 2024, No. 2406239A8861EA — lulus 10 unit kompetensi desain grafis.'
      },
      {
        k: ['desain', 'design', 'figma', 'canva', 'pixel', 'visual', 'branding', 'logo'],
        a: 'Desain adalah titik mulai: identitas visual, logo, poster, kalender, ID card, sampai materi promosi. Tools harian: Figma, Canva, dan PixelLab.'
      },
      {
        k: ['lokasi', 'domisili', 'tinggal', 'alamat', 'bantul', 'yogya', 'jogja'],
        a: 'Sekarang tinggal di Bantul, Yogyakarta. Asalnya dari Sungai Batang, Indragiri Hilir, Riau.'
      },
      {
        k: ['hobi', 'hobby', 'suka', 'minat', 'interest', 'waktu luang'],
        a: 'Minatnya di desain dan komunikasi — merancang visual, menata informasi, dan menjaga alur kerja tim tetap jelas.'
      },
      {
        k: ['harga', 'biaya', 'rate', 'tarif', 'jasa', 'freelance', 'proyek baru'],
        a: 'Untuk kerja sama, silakan ceritakan dulu kebutuhan dan timeline-nya lewat <a href="mailto:sukmawardaniakmal@gmail.com">email</a> atau <a href="https://wa.me/6282285718916">WhatsApp</a> — nanti dibalas dengan penawaran yang sesuai.'
      },
      {
        k: ['halo', 'hai', 'hi', 'hello', 'pagi', 'siang', 'malam', 'assalam'],
        a: 'Halo! Senang bisa bantu. Kamu bisa tanya soal project, skill, pengalaman, pendidikan, atau kontak Akmal.'
      },
      {
        k: ['terima kasih', 'makasih', 'thanks', 'thank'],
        a: 'Sama-sama! Kalau butuh yang lain, tinggal tanya saja.'
      },
      {
        k: ['siapa', 'who', 'nama', 'kamu', 'kenalan', 'perkenalan'],
        a: 'Saya asisten AI di portofolio Moh. Akmal Sukma Wardani — mahasiswa Sistem Informasi Universitas Alma Ata yang fokus di desain grafis, UI/UX, dan front-end.'
      }
    ];

    var fallback = 'Maaf, saya belum punya jawaban untuk itu. Coba tanya soal <b>project</b>, <b>skill</b>, <b>pengalaman</b>, <b>pendidikan</b>, <b>sertifikat</b>, atau <b>kontak</b> — atau langsung hubungi Akmal lewat <a href="mailto:sukmawardaniakmal@gmail.com">email</a>.';

    function now() {
      var d = new Date();
      return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
    }

    function scrollBottom() {
      body.scrollTop = body.scrollHeight;
    }

    function addMessage(html, who) {
      var wrap = document.createElement('div');
      wrap.className = 'msg msg--' + who;
      var p = document.createElement('p');
      p.innerHTML = html;
      var t = document.createElement('time');
      t.textContent = now();
      wrap.appendChild(p);
      wrap.appendChild(t);
      body.appendChild(wrap);
      scrollBottom();
    }

    function answerFor(text) {
      var q = text.toLowerCase();
      for (var i = 0; i < answers.length; i += 1) {
        var entry = answers[i];
        for (var j = 0; j < entry.k.length; j += 1) {
          if (q.indexOf(entry.k[j]) !== -1) return entry.a;
        }
      }
      return fallback;
    }

    function respond(text) {
      var typing = document.createElement('div');
      typing.className = 'msg msg--bot msg--typing';
      typing.innerHTML = '<p><i></i><i></i><i></i></p>';
      body.appendChild(typing);
      scrollBottom();

      var wait = reduceMotion ? 200 : 700 + Math.random() * 500;
      setTimeout(function () {
        typing.remove();
        addMessage(answerFor(text), 'bot');
      }, wait);
    }

    function send(text) {
      var clean = text.trim();
      if (!clean) return;
      addMessage(clean.replace(/[<>&]/g, function (c) {
        return { '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c];
      }), 'user');
      if (quick) quick.remove();
      respond(clean);
    }

    function open() {
      panel.hidden = false;
      root.classList.add('is-open');
      fab.setAttribute('aria-expanded', 'true');
      setTimeout(function () {
        if (window.innerWidth > 640) input.focus();
        scrollBottom();
      }, 240);
    }

    function close() {
      panel.hidden = true;
      root.classList.remove('is-open');
      fab.setAttribute('aria-expanded', 'false');
      fab.focus();
    }

    fab.addEventListener('click', function () {
      if (panel.hidden) open();
      else close();
    });

    if (closeBtn) closeBtn.addEventListener('click', close);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      send(input.value);
      input.value = '';
    });

    if (quick) {
      quick.addEventListener('click', function (e) {
        var btn = e.target.closest('button[data-q]');
        if (!btn) return;
        send(btn.textContent.trim());
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panel.hidden) close();
    });
  })();

  /* ---------------- Contact form ---------------- */
  (function contactForm() {
    var form = $('#contactForm');
    if (!form) return;
    var btn = $('#submitBtn');
    var toast = $('#toast');
    var toastTimer = null;

    function fieldOf(input) { return input.closest('.field'); }

    function validate() {
      var ok = true;
      var name = $('#name', form);
      var email = $('#email', form);
      var message = $('#message', form);

      if (!name.value.trim() || name.value.trim().length < 2) {
        fieldOf(name).classList.add('is-error');
        ok = false;
      } else fieldOf(name).classList.remove('is-error');

      if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email.value.trim())) {
        fieldOf(email).classList.add('is-error');
        ok = false;
      } else fieldOf(email).classList.remove('is-error');

      if (message.value.trim().length < 10) {
        fieldOf(message).classList.add('is-error');
        ok = false;
      } else fieldOf(message).classList.remove('is-error');

      return ok;
    }

    $$('input, textarea', form).forEach(function (el) {
      el.addEventListener('input', function () {
        var f = fieldOf(el);
        if (f && f.classList.contains('is-error')) validate();
      });
    });

    function showToast() {
      if (!toast) return;
      toast.classList.add('is-on');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () { toast.classList.remove('is-on'); }, 4200);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate()) {
        var firstErr = $('.field.is-error input, .field.is-error textarea', form);
        if (firstErr) firstErr.focus();
        return;
      }

      var name = $('#name', form).value.trim();
      var email = $('#email', form).value.trim();
      var message = $('#message', form).value.trim();

      btn.classList.add('is-busy');
      btn.disabled = true;

      setTimeout(function () {
        var subject = encodeURIComponent('Project inquiry — ' + name);
        var bodyText = encodeURIComponent(message + '\n\n—\n' + name + '\n' + email);
        window.location.href = 'mailto:sukmawardaniakmal@gmail.com?subject=' + subject + '&body=' + bodyText;

        btn.classList.remove('is-busy');
        btn.disabled = false;
        showToast();
        form.reset();
      }, 750);
    });
  })();

  /* ---------------- Back to top ---------------- */
  (function toTop() {
    var btn = $('#toTop');
    if (!btn) return;
    window.addEventListener('scroll', function () {
      btn.classList.toggle('is-on', window.scrollY > 700);
    }, { passive: true });
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  })();

  /* ---------------- Year ---------------- */
  (function year() {
    var el = $('#year');
    if (el) el.textContent = new Date().getFullYear();
  })();
})();
