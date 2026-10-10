/* Hope Dental — interactions & scroll animations */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Preloader ---------- */
  window.addEventListener("load", function () {
    var pre = document.getElementById("preloader");
    if (!pre) return;
    setTimeout(function () {
      pre.classList.add("done");
      setTimeout(function () { if (pre.parentNode) pre.remove(); }, 550);
    }, reduce ? 0 : 900);
  });
  // safety: never trap the user behind the preloader
  setTimeout(function () {
    var pre = document.getElementById("preloader");
    if (pre) { pre.classList.add("done"); setTimeout(function(){ if(pre.parentNode) pre.remove(); }, 550); }
  }, 3500);

  /* ---------- Floating nav: persistent on mobile, scroll-reveal on desktop ---------- */
  var nav = document.getElementById("nav");
  function onScrollNav() {
    if (!nav) return;
    var mobile = window.matchMedia("(max-width: 960px)").matches;
    if (mobile || window.scrollY > 110) nav.classList.add("show");
    else nav.classList.remove("show");
  }
  window.addEventListener("scroll", onScrollNav, { passive: true });
  window.addEventListener("resize", onScrollNav);
  onScrollNav();

  /* ---------- Mobile nav ---------- */
  var burger = document.getElementById("burger");
  var mobnav = document.getElementById("mobnav");
  function closeMob() {
    if (!mobnav) return;
    mobnav.classList.remove("open");
    burger.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }
  if (burger && mobnav) {
    burger.addEventListener("click", function () {
      var open = mobnav.classList.toggle("open");
      burger.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
    });
    mobnav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMob);
    });
  }

  /* ---------- Scroll reveal (staggered) ---------- */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if (reduce || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var d = parseInt(e.target.getAttribute("data-reveal-delay") || "0", 10);
          setTimeout(function () { e.target.classList.add("in"); }, d);
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Hero parallax ---------- */
  var para = document.querySelector("[data-parallax]");
  if (para && !reduce) {
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        if (y < window.innerHeight * 1.2) {
          para.style.transform = "translateY(" + (y * 0.18).toFixed(1) + "px) scale(1.04)";
        }
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---------- Count-up stats ---------- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var plain = el.getAttribute("data-plain") === "1"; // no thousands separator
    var suffix = el.getAttribute("data-suffix") || "";
    var isFloat = suffix.indexOf(".") === 0;
    var dur = 1400, start = null;
    function fmt(n) {
      if (isFloat) return n.toFixed(0) + suffix;
      var s = Math.round(n).toString();
      if (!plain) s = s.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
      return s + suffix;
    }
    function tick(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * eased);
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = fmt(target);
    }
    requestAnimationFrame(tick);
  }
  var counts = document.querySelectorAll("[data-count]");
  if (counts.length) {
    if (reduce || !("IntersectionObserver" in window)) {
      counts.forEach(animateCount);
    } else {
      var co = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { animateCount(e.target); co.unobserve(e.target); }
        });
      }, { threshold: 0.6 });
      counts.forEach(function (el) { co.observe(el); });
    }
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var btn = item.querySelector(".faq-q-btn");
    var ans = item.querySelector(".faq-ans");
    function setOpen(open) {
      item.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      ans.style.maxHeight = open ? ans.scrollHeight + "px" : "0px";
    }
    setOpen(item.classList.contains("is-open"));
    btn.addEventListener("click", function () {
      var willOpen = !item.classList.contains("is-open");
      item.parentNode.querySelectorAll(".faq-item.is-open").forEach(function (other) {
        if (other !== item) {
          other.classList.remove("is-open");
          other.querySelector(".faq-q-btn").setAttribute("aria-expanded", "false");
          other.querySelector(".faq-ans").style.maxHeight = "0px";
        }
      });
      setOpen(willOpen);
    });
  });
  window.addEventListener("resize", function () {
    document.querySelectorAll(".faq-item.is-open .faq-ans").forEach(function (ans) {
      ans.style.maxHeight = ans.scrollHeight + "px";
    });
  });

  /* ---------- Reviews marquee (seamless loop) ---------- */
  var mqTrack = document.querySelector("[data-marquee] .mq-track");
  if (mqTrack) {
    var mqGroup = mqTrack.querySelector(".mq-group");
    if (mqGroup) mqTrack.appendChild(mqGroup.cloneNode(true));
  }

  /* ---------- Bento gallery stagger-in ---------- */
  var bento = document.querySelector("[data-bento]");
  if (bento) {
    if (reduce || !("IntersectionObserver" in window)) {
      bento.classList.add("show");
    } else {
      var bo = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { bento.classList.add("show"); bo.unobserve(bento); }
        });
      }, { threshold: 0.15 });
      bo.observe(bento);
    }
  }

  /* ---------- Services: cascade reveal + cursor glow ---------- */
  (function () {
    var grid = document.querySelector(".svc-grid[data-stagger]");
    if (!grid) return;
    if (reduce || !("IntersectionObserver" in window)) {
      grid.classList.add("show");
    } else {
      var so = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { grid.classList.add("show"); so.unobserve(grid); }
        });
      }, { threshold: 0.18 });
      so.observe(grid);
    }
    grid.querySelectorAll(".svc-card").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty("--mx", (e.clientX - r.left) + "px");
        card.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });
  })();

  /* ---------- Lightbox + draggable dock ---------- */
  (function () {
    var lb = document.getElementById("lightbox");
    if (!lb || !bento) return;
    var tiles = Array.prototype.slice.call(bento.querySelectorAll(".bento-tile"));
    if (!tiles.length) return;

    var items = tiles.map(function (t) {
      return {
        full: t.getAttribute("data-full"),
        title: t.getAttribute("data-title") || "",
        desc: t.getAttribute("data-desc") || "",
        thumb: t.querySelector("img") ? t.querySelector("img").getAttribute("src") : t.getAttribute("data-full")
      };
    });

    var imgEl = lb.querySelector(".lb-img");
    var titleEl = lb.querySelector(".lb-title");
    var descEl = lb.querySelector(".lb-desc");
    var dock = lb.querySelector("[data-lb-dock]");
    var current = 0;
    var dockPos = { x: 0, y: 0 };

    var thumbs = items.map(function (it, i) {
      var b = document.createElement("button");
      b.className = "lb-thumb";
      b.type = "button";
      b.setAttribute("aria-label", it.title);
      var im = document.createElement("img");
      im.src = it.thumb; im.alt = "";
      b.appendChild(im);
      b.addEventListener("click", function (e) { e.stopPropagation(); show(i); });
      dock.appendChild(b);
      return b;
    });

    function show(i) {
      current = (i + items.length) % items.length;
      var it = items[current];
      imgEl.src = it.full;
      imgEl.alt = it.title;
      titleEl.textContent = it.title;
      descEl.textContent = it.desc;
      thumbs.forEach(function (t, k) { t.classList.toggle("active", k === current); });
    }

    function open(i) {
      show(i);
      lb.classList.add("open");
      lb.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }
    function close() {
      lb.classList.remove("open");
      lb.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }

    tiles.forEach(function (t, i) {
      t.addEventListener("click", function () { open(i); });
    });
    lb.querySelectorAll("[data-lb-close]").forEach(function (el) {
      el.addEventListener("click", close);
    });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") show(current + 1);
      else if (e.key === "ArrowLeft") show(current - 1);
    });

    var dragging = false, sx = 0, sy = 0, ox = 0, oy = 0, moved = false;
    dock.addEventListener("pointerdown", function (e) {
      dragging = true; moved = false;
      sx = e.clientX; sy = e.clientY; ox = dockPos.x; oy = dockPos.y;
      dock.classList.add("dragging");
      dock.setPointerCapture(e.pointerId);
    });
    dock.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
      dockPos.x = ox + dx; dockPos.y = oy + dy;
      dock.style.transform = "translate(calc(-50% + " + dockPos.x + "px), " + dockPos.y + "px)";
    });
    function endDrag(e) {
      if (!dragging) return;
      dragging = false;
      dock.classList.remove("dragging");
      try { dock.releasePointerCapture(e.pointerId); } catch (err) {}
    }
    dock.addEventListener("pointerup", endDrag);
    dock.addEventListener("pointercancel", endDrag);
    dock.addEventListener("click", function (e) { if (moved) { e.stopPropagation(); e.preventDefault(); } }, true);
  })();

  /* ---------- Scroll-draw timeline (process) ---------- */
  (function () {
    var tl = document.querySelector("[data-timeline]");
    if (!tl) return;
    var fill = tl.querySelector("[data-tl-fill]");
    var items = Array.prototype.slice.call(tl.querySelectorAll(".tl-item"));
    var n = items.length;
    if (reduce) {
      if (fill) fill.style.height = "100%";
      items.forEach(function (it) { it.classList.add("is-active"); });
      return;
    }
    var ticking = false;
    function update() {
      var rect = tl.getBoundingClientRect();
      var trigger = window.innerHeight / 2;
      var total = rect.height || 1;
      var progress = (trigger - rect.top) / total;
      progress = Math.max(0, Math.min(1, progress));
      if (fill) fill.style.height = (progress * 100) + "%";
      items.forEach(function (it, i) {
        var threshold = n > 1 ? i / (n - 1) : 0;
        it.classList.toggle("is-active", progress >= threshold - 0.05);
      });
    }
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { update(); ticking = false; });
    }, { passive: true });
    window.addEventListener("resize", update);
    update();
  })();

  /* ---------- Booking form (demo) ---------- */
  var form = document.getElementById("booking");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var note = document.getElementById("formnote");
      var name = form.querySelector("#f-name");
      var phone = form.querySelector("#f-phone");
      if (!name.value.trim() || !phone.value.trim()) {
        note.textContent = "Molimo unesite ime i broj telefona.";
        note.classList.remove("ok");
        return;
      }
      note.textContent = "Hvala, " + name.value.trim().split(" ")[0] + "! Zahtev je poslat — javljamo vam se uskoro.";
      note.classList.add("ok");
      form.reset();
    });
  }
})();
