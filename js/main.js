/* =========================================================
   THE CAKE BOUTIQUE - main.js
   Config
   01 Helpers            08 Footer year
   02 Header scroll      09 Testimonials carousel
   03 Mobile sheet       10 Menu: sizes, price, filter
   04 Scroll reveals     11 Custom order form
   05 Hero parallax      12 Gallery lightbox
   06 Pointer light      13 Contact enquiry form
   07 Page transitions
   Every feature checks that its elements exist, so one file
   works on all five pages.
   ========================================================= */
(() => {
  "use strict";

  /* ---------- CONFIG ---------- */
  // TODO: replace with the real WhatsApp number.
  // Country code first, no + sign, no spaces. Example: 919876543210
  const WA_NUMBER = "910000000000";
  const waLink = (text) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;

  /* ---------- 01 HELPERS ---------- */
  const $ = (sel, scope = document) => scope.querySelector(sel);
  const $$ = (sel, scope = document) => [...scope.querySelectorAll(sel)];

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- 02 HEADER: shrink + glass on scroll ---------- */
  const header = $(".header");
  if (header) {
    let ticking = false;
    const update = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 24);
      ticking = false;
    };
    window.addEventListener("scroll", () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
    update();
  }

  /* ---------- 03 MOBILE SHEET ---------- */
  const toggle = $(".menu-toggle");
  const sheet = $(".sheet");
  if (toggle && sheet) {
    const links = $$(".sheet__link", sheet);
    links.forEach((link, i) => link.style.setProperty("--i", i));

    const setOpen = (open) => {
      sheet.classList.toggle("is-open", open);
      document.body.classList.toggle("is-locked", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      sheet.setAttribute("aria-hidden", String(!open));
      if (open && links[0]) links[0].focus({ preventScroll: true });
    };

    setOpen(false);
    toggle.addEventListener("click", () => setOpen(!sheet.classList.contains("is-open")));
    links.forEach((link) => link.addEventListener("click", () => setOpen(false)));

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && sheet.classList.contains("is-open")) {
        setOpen(false);
        toggle.focus();
      }
    });

    // Close automatically if the window grows to desktop size
    window.matchMedia("(min-width: 1024px)").addEventListener("change", (e) => {
      if (e.matches) setOpen(false);
    });
  }

  /* ---------- 04 SCROLL REVEALS ---------- */
  // Put data-stagger on a parent to stagger its .reveal children.
  $$("[data-stagger]").forEach((group) => {
    $$(".reveal", group).forEach((el, i) => el.style.setProperty("--i", i));
  });

  const revealEls = $$(".reveal");
  if (revealEls.length) {
    if ("IntersectionObserver" in window && !reduceMotion) {
      const io = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
      revealEls.forEach((el) => io.observe(el));
    } else {
      revealEls.forEach((el) => el.classList.add("is-visible"));
    }
  }

  /* ---------- 05 HERO PARALLAX (transform only) ---------- */
  const heroImg = $(".hero__media img");
  if (heroImg && !reduceMotion) {
    let ticking = false;
    const move = () => {
      const y = Math.min(window.scrollY, window.innerHeight);
      heroImg.style.transform = `translate3d(0, ${y * 0.18}px, 0) scale(1.05)`;
      ticking = false;
    };
    window.addEventListener("scroll", () => {
      if (!ticking) {
        requestAnimationFrame(move);
        ticking = true;
      }
    }, { passive: true });
    move();
  }

  /* ---------- 06 POINTER LIGHT ON GLASS (desktop only) ---------- */
  if (finePointer && !reduceMotion) {
    let frame = null;
    document.addEventListener("pointermove", (e) => {
      const target = e.target.closest(".glass, .card, .tilt-light");
      if (!target || frame) return;
      frame = requestAnimationFrame(() => {
        const r = target.getBoundingClientRect();
        target.style.setProperty("--mx", `${e.clientX - r.left}px`);
        target.style.setProperty("--my", `${e.clientY - r.top}px`);
        frame = null;
      });
    }, { passive: true });
  }

  /* ---------- 07 PAGE TRANSITIONS ---------- */
  // Browsers with View Transitions handle this in CSS.
  // Everyone else gets a quick fade-out before navigating.
  const hasViewTransitions = "CSSViewTransitionRule" in window;
  if (!hasViewTransitions && !reduceMotion) {
    document.addEventListener("click", (e) => {
      const link = e.target.closest("a[href]");
      if (!link) return;
      const url = new URL(link.href, location.href);
      const isInternal = url.origin === location.origin && url.pathname !== location.pathname;
      const opensNew = link.target === "_blank" || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;
      if (!isInternal || opensNew || link.hasAttribute("download")) return;
      e.preventDefault();
      document.body.classList.add("is-leaving");
      setTimeout(() => { window.location.href = link.href; }, 280);
    });
    // Back/forward cache: clear the fade state when the page is restored
    window.addEventListener("pageshow", () => document.body.classList.remove("is-leaving"));
  }

  /* ---------- 08 FOOTER YEAR ---------- */
  const year = $("[data-year]");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- 09 TESTIMONIALS CAROUSEL ---------- */
  const track = $("[data-carousel]");
  if (track) {
    const step = () => track.firstElementChild.getBoundingClientRect().width + 24;
    const go = (dir) => track.scrollBy({ left: dir * step(), behavior: reduceMotion ? "auto" : "smooth" });
    $("[data-carousel-prev]")?.addEventListener("click", () => go(-1));
    $("[data-carousel-next]")?.addEventListener("click", () => go(1));
  }

    /* ---------- 10 MENU: sizes, price roll, tabs, search, views, surprise ---------- */
  const menuGrid = $("[data-menu-grid]");
  if (menuGrid) {
    const rupees = new Intl.NumberFormat("en-IN");
    const products = $$(".product", menuGrid);
    const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

    /* ---- 10a sizes, rolling price, WhatsApp link, eggless mark ---- */
    const rollPrice = (el, to) => {
      const from = Number(el.dataset.value ?? to);
      el.dataset.value = to;
      cancelAnimationFrame(el._raf);
      if (reduceMotion || from === to) { el.textContent = `₹${rupees.format(to)}`; return; }
      const t0 = performance.now();
      const step = (now) => {
        const t = Math.min((now - t0) / 500, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = `₹${rupees.format(Math.round(from + (to - from) * eased))}`;
        if (t < 1) el._raf = requestAnimationFrame(step);
      };
      el._raf = requestAnimationFrame(step);
    };

    products.forEach((card) => {
      const prices = card.dataset.prices.split(",").map(Number);
      const units = card.dataset.units.split(",");
      const sizes = $("[data-sizes]", card);
      const priceEl = $("[data-price]", card);
      const labelEl = $("[data-price-label]", card);
      const enquire = $("[data-enquire]", card);

      const select = (i) => {
        $$("button", sizes).forEach((b, n) => b.setAttribute("aria-pressed", String(n === i)));
        rollPrice(priceEl, prices[i]);
        labelEl.textContent = i === 0 ? "Starts from" : "Price";
        enquire.href = waLink(`Hi The Cake Boutique, I'd like to enquire about ${card.dataset.name} (${units[i]}), ₹${rupees.format(prices[i])}.`);
      };

      units.forEach((unit, i) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = unit;
        btn.addEventListener("click", () => select(i));
        sizes.append(btn);
      });
      select(0);

      // green eggless mark beside the name
      if (card.dataset.cat.split(" ").includes("eggless")) {
        const mark = document.createElement("span");
        mark.className = "veg";
        mark.innerHTML = '<span class="visually-hidden">Eggless. </span>';
        $(".card__title", card)?.prepend(mark);
      }
    });

    /* ---- 10b tabs + search, with cards that glide (FLIP) ---- */
    const toolbar = $("[data-toolbar]");
    const tabs = $("[data-tabs]");
    const glide = tabs && $(".tabs__glide", tabs);
    const tabBtns = $$("[data-filter]");
    const search = $("[data-search]");
    const countEl = $("[data-count]");
    const emptyEl = $("[data-empty]");
    const state = { filter: "all", q: "" };

    const haystack = new Map(products.map((c) => [
      c, `${c.dataset.name} ${$(".product__desc", c)?.textContent || ""} ${c.dataset.cat}`.toLowerCase(),
    ]));
    const matches = (c) =>
      (state.filter === "all" || c.dataset.cat.split(" ").includes(state.filter)) &&
      (!state.q || haystack.get(c).includes(state.q));

    // numbers each visible card so CSS can offset the columns
    const stagger = () => {
      let i = 0;
      products.forEach((c) => {
        if (c.hidden) return;
        c.dataset.p2 = i % 2;
        c.dataset.p3 = i % 3;
        i++;
      });
    };

    // keep the first card from hiding under the sticky bar
    const keepGridInView = () => {
      if (!tabs) return;
      const stickyEl = toolbar && getComputedStyle(toolbar).display !== "contents" ? toolbar : tabs;
      const gap = menuGrid.getBoundingClientRect().top - stickyEl.getBoundingClientRect().bottom;
      if (gap < 8) window.scrollBy({ top: gap - 16, behavior: reduceMotion ? "auto" : "smooth" });
    };

    let runId = 0;
    const update = () => {
      const id = ++runId;
      products.forEach((c) => c.getAnimations().forEach((a) => a.cancel()));

      const next = products.filter(matches);
      const leaving = products.filter((c) => !c.hidden && !next.includes(c));
      const entering = next.filter((c) => c.hidden);
      const staying = next.filter((c) => !c.hidden);

      next.forEach((c) => { c.classList.remove("is-out", "is-pending"); });
      if (countEl) countEl.textContent = next.length;
      if (emptyEl) emptyEl.hidden = next.length > 0;
      keepGridInView();

      const swap = () => {
        if (id !== runId) return;
        const first = new Map(staying.map((c) => [c, c.getBoundingClientRect()]));
        leaving.forEach((c) => { c.hidden = true; c.classList.remove("is-out"); });
        entering.forEach((c) => { c.hidden = false; });
        stagger();
        if (reduceMotion) return;

        // survivors glide from where they were to where they are now
        staying.forEach((c) => {
          const a = first.get(c);
          const b = c.getBoundingClientRect();
          const dx = a.left - b.left;
          const dy = a.top - b.top;
          if (dx || dy) c.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }], { duration: 750, easing: EASE });
        });
        // newcomers rise in
        entering.forEach((c, i) => c.animate(
          [{ opacity: 0, transform: "translateY(24px) scale(0.96)" }, { opacity: 1, transform: "none" }],
          { duration: 700, easing: EASE, delay: 120 + i * 60, fill: "backwards" }
        ));
      };

      if (leaving.length && !reduceMotion) {
        leaving.forEach((c) => c.classList.add("is-out"));
        setTimeout(swap, 260);
      } else {
        swap();
      }
    };

    // sliding pill behind the active tab
    const placeGlide = () => {
      const active = tabBtns.find((b) => b.getAttribute("aria-pressed") === "true");
      if (!active || !glide) return;
      glide.style.width = `${active.offsetWidth}px`;
      glide.style.transform = `translateX(${active.offsetLeft}px)`;
      if (tabs.scrollWidth > tabs.clientWidth) {
        tabs.scrollTo({ left: active.offsetLeft - (tabs.clientWidth - active.offsetWidth) / 2, behavior: reduceMotion ? "auto" : "smooth" });
      }
    };
    if (glide) {
      placeGlide();
      requestAnimationFrame(() => glide.classList.add("is-ready"));
      document.fonts?.ready.then(placeGlide);
      window.addEventListener("resize", placeGlide);
    }

    tabBtns.forEach((btn) => btn.addEventListener("click", () => {
      state.filter = btn.dataset.filter;
      tabBtns.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      placeGlide();
      update();
    }));

    let searchTimer;
    search?.addEventListener("input", () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => { state.q = search.value.trim().toLowerCase(); update(); }, 140);
    });

    $("[data-clear]")?.addEventListener("click", () => {
      if (search) search.value = "";
      state.q = "";
      state.filter = "all";
      tabBtns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.filter === "all")));
      placeGlide();
      update();
    });

    // press "/" anywhere to start searching
    document.addEventListener("keydown", (e) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey || !search) return;
      if (e.target.closest("input, textarea, select, [contenteditable]")) return;
      e.preventDefault();
      search.focus();
    });

    /* ---- 10c grid / menu card view ---- */
    const viewBtns = $$("[data-view]");
    let view = "grid";
    const paintView = () => viewBtns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.view === view)));

    const setView = (mode, animate = true) => {
      if (mode === view) return;
      view = mode;
      paintView();
      try { localStorage.setItem("tcb-view", mode); } catch (_) { /* storage blocked */ }
      const flip = () => menuGrid.classList.toggle("is-list", mode === "list");
      if (!animate || reduceMotion) { flip(); return; }

      const shown = products.filter((c) => !c.hidden);
      const out = menuGrid.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, easing: "ease-out", fill: "forwards" });
      out.onfinish = () => {
        flip();
        shown.forEach((c, i) => c.animate(
          [{ opacity: 0, transform: "translateY(20px)" }, { opacity: 1, transform: "none" }],
          { duration: 650, easing: EASE, delay: i * 45, fill: "backwards" }
        ));
        out.cancel();
      };
    };
    viewBtns.forEach((b) => b.addEventListener("click", () => setView(b.dataset.view)));

    let savedView = "grid";
    try { savedView = localStorage.getItem("tcb-view") === "list" ? "list" : "grid"; } catch (_) { /* storage blocked */ }
    setView(savedView, false);
    stagger();

    /* ---- 10d surprise me ---- */
    let lastPick = null;
    $("[data-surprise]")?.addEventListener("click", () => {
      let pool = products.filter((c) => !c.hidden);
      if (pool.length > 1) pool = pool.filter((c) => c !== lastPick);
      if (!pool.length) return;
      const pick = pool[Math.floor(Math.random() * pool.length)];
      lastPick = pick;

      pick.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
      setTimeout(() => {
        pick.classList.remove("is-spotlit");
        void pick.offsetWidth; // restart the ring animation
        pick.classList.add("is-spotlit");
        const r = pick.getBoundingClientRect();
        sprinkle(r.left + r.width / 2, r.top + r.height / 3, 26);
      }, reduceMotion ? 0 : 650);
      setTimeout(() => pick.classList.remove("is-spotlit"), 4200);
    });

    /* ---- 10e cards deal in as they scroll into view ---- */
    if (!reduceMotion && "IntersectionObserver" in window) {
      products.forEach((c) => c.classList.add("is-pending"));
      const io = new IntersectionObserver((entries, obs) => {
        let n = 0;
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const c = entry.target;
          obs.unobserve(c);
          c.classList.remove("is-pending");
          c.animate(
            [{ opacity: 0, transform: "translateY(48px) rotate(1.5deg)" }, { opacity: 1, transform: "none" }],
            { duration: 900, easing: EASE, delay: n++ * 90, fill: "backwards" }
          );
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
      products.forEach((c) => io.observe(c));
    }
  }

  /* ---------- 11 CUSTOM ORDER FORM ---------- */
  const orderForm = $("[data-order-form]");
  if (orderForm) {
    const success = $("[data-success]");
    const fields = {
      name: $("#name"), phone: $("#phone"), occasion: $("#occasion"),
      flavour: $("#flavour"), weight: $("#weight"), date: $("#date"),
      message: $("#message"), reference: $("#reference"),
    };

    // Earliest date: 2 days from today (local time). Change the 2 for more notice.
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 2);
    fields.date.min = minDate.toLocaleDateString("en-CA"); // YYYY-MM-DD

    // Each rule returns an error string, or "" when the value is fine
    const rules = {
      name: (f) => (f.value.trim().length < 2 ? "Please enter your name." : ""),
      phone: (f) => (/^(?:\+?91)?[6-9]\d{9}$/.test(f.value.replace(/[\s-]/g, "")) ? "" : "Enter a valid 10-digit mobile number."),
      occasion: (f) => (f.value ? "" : "Please choose an occasion."),
      flavour: (f) => (f.value ? "" : "Please choose a flavour."),
      weight: (f) => (f.value ? "" : "Please choose a weight."),
      date: (f) => {
        if (!f.value) return "Please pick the date you need the cake.";
        return f.value < f.min ? "We need at least 2 days' notice. Please pick a later date." : "";
      },
      message: (f) => (f.value.length > 40 ? "Please keep it under 40 characters." : ""),
      reference: (f) => {
        const file = f.files[0];
        if (!file) return "";
        if (!file.type.startsWith("image/")) return "Please choose an image file.";
        return file.size > 5 * 1024 * 1024 ? "Image must be smaller than 5 MB." : "";
      },
    };

    const check = (key) => {
      const input = fields[key];
      const error = rules[key](input);
      input.closest(".field").classList.toggle("is-invalid", Boolean(error));
      input.setAttribute("aria-invalid", String(Boolean(error)));
      $(`#${input.id}-error`).textContent = error;
      return !error;
    };

    // Validate when the user leaves a field, and re-check while they fix an error
    Object.keys(fields).forEach((key) => {
      fields[key].addEventListener("blur", () => check(key));
      const live = () => { if (fields[key].closest(".field").classList.contains("is-invalid")) check(key); };
      fields[key].addEventListener("input", live);
      fields[key].addEventListener("change", live);
    });

    orderForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const results = Object.keys(fields).map(check);
      if (results.includes(false)) {
        orderForm.querySelector(".is-invalid input, .is-invalid select")?.focus();
        return;
      }

      const v = (k) => fields[k].value.trim();
      const niceDate = new Date(`${v("date")}T00:00:00`).toLocaleDateString("en-IN", {
        weekday: "short", day: "numeric", month: "short", year: "numeric",
      });
      const lines = [
        "Hi The Cake Boutique, I'd like to order a custom cake.",
        "",
        `Name: ${v("name")}`,
        `Phone: ${v("phone")}`,
        `Occasion: ${v("occasion")}`,
        `Flavour: ${v("flavour")}`,
        `Weight: ${v("weight")}`,
        `Date needed: ${niceDate}`,
      ];
      if (v("message")) lines.push(`Message on cake: ${v("message")}`);
      if (fields.reference.files[0]) lines.push("", "I have a reference photo and will send it in this chat.");

      $("[data-success-name]").textContent = v("name").split(" ")[0];
      $("[data-success-link]").href = waLink(lines.join("\n"));
      orderForm.hidden = true;
      success.hidden = false;
      success.focus();
    });

    $("[data-reset]")?.addEventListener("click", () => {
      success.hidden = true;
      orderForm.hidden = false;
      fields.name.focus();
    });
  }

  /* ---------- 12 GALLERY LIGHTBOX ---------- */
  const lightbox = $("[data-lightbox]");
  const galleryBtns = $$("[data-gallery] .gallery__btn");
  if (lightbox && galleryBtns.length) {
    const lbImg = $("[data-lb-img]", lightbox);
    const lbCaption = $("[data-lb-caption]", lightbox);
    const lbCount = $("[data-lb-count]", lightbox);
    const lbClose = $("[data-lb-close]", lightbox);
    const lbPrev = $("[data-lb-prev]", lightbox);
    const lbNext = $("[data-lb-next]", lightbox);
    const focusable = [lbClose, lbPrev, lbNext];

    let current = 0;
    let opener = null;

    const show = (index) => {
      current = (index + galleryBtns.length) % galleryBtns.length;
      const btn = galleryBtns[current];
      const thumb = $("img", btn);

      lbImg.classList.remove("is-ready");
      lbImg.onload = () => lbImg.classList.add("is-ready");
      lbImg.src = btn.dataset.full;
      lbImg.alt = thumb.alt;
      // cached images may not fire load again
      if (lbImg.complete) lbImg.classList.add("is-ready");

      lbCaption.textContent = $(".gallery__cap", btn)?.textContent || thumb.alt;
      lbCount.textContent = `${current + 1} / ${galleryBtns.length}`;

      // preload neighbours so the arrows feel instant
      [current - 1, current + 1].forEach((n) => {
        const neighbour = galleryBtns[(n + galleryBtns.length) % galleryBtns.length];
        new Image().src = neighbour.dataset.full;
      });
    };

    const open = (index, trigger) => {
      opener = trigger;
      show(index);
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.classList.add("is-locked");
      lbClose.focus({ preventScroll: true });
    };

    const close = () => {
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.classList.remove("is-locked");
      opener?.focus({ preventScroll: true });
    };

    galleryBtns.forEach((btn, i) => btn.addEventListener("click", () => open(i, btn)));
    lbClose.addEventListener("click", close);
    lbPrev.addEventListener("click", () => show(current - 1));
    lbNext.addEventListener("click", () => show(current + 1));

    // clicking the dark backdrop (not the image or buttons) closes the viewer
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox || e.target.classList.contains("lightbox__figure")) close();
    });

    // keyboard: Esc, arrows, and a focus trap on Tab
    document.addEventListener("keydown", (e) => {
      if (!lightbox.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") show(current - 1);
      else if (e.key === "ArrowRight") show(current + 1);
      else if (e.key === "Tab") {
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        else if (!focusable.includes(document.activeElement)) { e.preventDefault(); first.focus(); }
      }
    });

    // swipe on touch screens
    let startX = 0;
    let startY = 0;
    lightbox.addEventListener("touchstart", (e) => {
      startX = e.changedTouches[0].clientX;
      startY = e.changedTouches[0].clientY;
    }, { passive: true });
    lightbox.addEventListener("touchend", (e) => {
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) show(current + (dx < 0 ? 1 : -1));
    }, { passive: true });
  }

  /* ---------- 13 CONTACT ENQUIRY FORM ---------- */
  const contactForm = $("[data-contact-form]");
  if (contactForm) {
    const contactSuccess = $("[data-contact-success]");
    const cFields = { name: $("#c-name"), phone: $("#c-phone"), message: $("#c-message") };

    const cRules = {
      name: (f) => (f.value.trim().length < 2 ? "Please enter your name." : ""),
      phone: (f) => (/^(?:\+?91)?[6-9]\d{9}$/.test(f.value.replace(/[\s-]/g, "")) ? "" : "Enter a valid 10-digit mobile number."),
      message: (f) => (f.value.trim().length < 5 ? "Please write a short message." : ""),
    };

    const cCheck = (key) => {
      const input = cFields[key];
      const error = cRules[key](input);
      input.closest(".field").classList.toggle("is-invalid", Boolean(error));
      input.setAttribute("aria-invalid", String(Boolean(error)));
      $(`#${input.id}-error`).textContent = error;
      return !error;
    };

    Object.keys(cFields).forEach((key) => {
      cFields[key].addEventListener("blur", () => cCheck(key));
      cFields[key].addEventListener("input", () => {
        if (cFields[key].closest(".field").classList.contains("is-invalid")) cCheck(key);
      });
    });

    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const results = Object.keys(cFields).map(cCheck);
      if (results.includes(false)) {
        contactForm.querySelector(".is-invalid input, .is-invalid textarea")?.focus();
        return;
      }
      const v = (k) => cFields[k].value.trim();
      const text = ["Hi The Cake Boutique,", "", v("message"), "", `Name: ${v("name")}`, `Phone: ${v("phone")}`].join("\n");

      $("[data-contact-name]").textContent = v("name").split(" ")[0];
      $("[data-contact-link]").href = waLink(text);
      contactForm.hidden = true;
      contactSuccess.hidden = false;
      contactSuccess.focus();
    });

    $("[data-contact-reset]")?.addEventListener("click", () => {
      contactSuccess.hidden = true;
      contactForm.hidden = false;
      cFields.name.focus();
    });
  }

    /* =========================================================
     14 ENHANCEMENT LAYER
     ========================================================= */

    /* ---------- 14a HEADLINE WORD REVEAL + PRELOADER ---------- */
  const splitEls = reduceMotion ? [] : $$(".hero__title, .page-hero__title");
  splitEls.forEach((el) => {
    const text = el.textContent.trim();
    el.setAttribute("aria-label", text);
    el.textContent = "";
    text.split(/\s+/).forEach((word, i) => {
      const outer = document.createElement("span");
      const inner = document.createElement("span");
      outer.className = "word";
      outer.setAttribute("aria-hidden", "true");
      inner.textContent = word;
      inner.style.setProperty("--i", i);
      outer.append(inner);
      el.append(outer, " ");
    });
  });

  let splitStarted = false;
  const startSplit = () => {
    if (splitStarted) return;
    splitStarted = true;
    requestAnimationFrame(() => splitEls.forEach((el) => el.classList.add("is-split-in")));
  };

  // Shows once per session on the home page. Add ?preloader to the URL to force it.
  let seenIntro = false;
  try { seenIntro = sessionStorage.getItem("tcb-intro") === "1"; } catch (_) { /* storage blocked */ }
  const forceIntro = location.search.includes("preloader");

  if ($(".hero") && !reduceMotion && (!seenIntro || forceIntro)) {
    // Scalloped badge edge, like the logo: a circle with a gentle 28-bump wave
    let scallop = "";
    for (let i = 0; i <= 360; i++) {
      const a = (i / 360) * Math.PI * 2;
      const r = 106 + 3.6 * Math.cos(a * 28);
      scallop += `${i ? "L" : "M"}${(120 + r * Math.cos(a)).toFixed(2)} ${(120 + r * Math.sin(a)).toFixed(2)}`;
    }
    scallop += "Z";

    // Wave surface of the icing (7 wavelengths so it can slide sideways forever)
    const wave = "M40 0" + "q15 -5 30 0 t30 0".repeat(1) + " q15 -5 30 0 t30 0".repeat(6) + " V200 H40 Z";

    const loader = document.createElement("div");
    loader.className = "loader";
    loader.setAttribute("aria-hidden", "true");
    loader.innerHTML = `
      <div class="loader__stage">
        <svg class="loader__badge" viewBox="0 0 240 240">
          <defs>
            <path id="ld-ring" d="M120,120 m-82,0 a82,82 0 1,1 164,0 a82,82 0 1,1 -164,0"/>
            <clipPath id="ld-well"><circle cx="120" cy="120" r="62"/></clipPath>
            <clipPath id="ld-liquid"><path data-ld-wave d="${wave}"/></clipPath>
          </defs>
          <path class="loader__scallop" pathLength="1" d="${scallop}"/>
          <g class="loader__ring">
            <text><textPath href="#ld-ring" textLength="512" lengthAdjust="spacing">THE CAKE BOUTIQUE · BAKED WITH LOVE · </textPath></text>
          </g>
          <circle class="loader__well" cx="120" cy="120" r="62"/>
          <text class="loader__tcb" x="120" y="134">TCB</text>
          <g clip-path="url(#ld-well)"><path class="loader__wave" data-ld-wave d="${wave}"/></g>
          <g clip-path="url(#ld-liquid)"><text class="loader__ink" x="120" y="134">TCB</text></g>
        </svg>
        <p class="loader__count"><span data-ld-count>0</span>%</p>
        <p class="loader__line">Baking your experience</p>
      </div>`;
    document.body.prepend(loader);
    document.body.classList.add("is-locked");

    const waves = $$("[data-ld-wave]", loader);
    const countEl = $("[data-ld-count]", loader);
    const MIN_MS = 1800;   // always show the full draw-in, even on fast connections
    const MAX_MS = 5000;   // never keep visitors waiting longer than this
    const t0 = performance.now();
    let loaded = document.readyState === "complete";
    let progress = 0;
    let finished = false;

    window.addEventListener("load", () => { loaded = true; });

    const setLevel = (p, time) => {
      const y = 186 - 136 * p;               // icing rises from below the badge to above it
      const x = -((time * 0.03) % 60);       // surface drifts sideways
      waves.forEach((w) => w.setAttribute("transform", `translate(${x.toFixed(2)} ${y.toFixed(2)})`));
      countEl.textContent = Math.round(p * 100);
    };

    const finish = () => {
      if (finished) return;
      finished = true;
      loader.classList.add("is-full");
      setTimeout(() => {
        loader.classList.add("is-done");
        document.body.classList.remove("is-locked");
        startSplit();
        setTimeout(() => loader.remove(), 1300);
      }, 450);
      try { sessionStorage.setItem("tcb-intro", "1"); } catch (_) { /* storage blocked */ }
    };

    const tick = (now) => {
      const elapsed = now - t0;
      const ready = (loaded && elapsed > MIN_MS) || elapsed > MAX_MS;
      const target = ready ? 1 : Math.min(0.9, (elapsed / MIN_MS) * 0.9);
      progress += (target - progress) * 0.06;
      if (ready && progress > 0.995) progress = 1;
      setLevel(progress, now);
      if (progress < 1) requestAnimationFrame(tick);
      else finish();
    };
    requestAnimationFrame(tick);
  } else {
    startSplit();
  }

  /* ---------- 14b SPRINKLES ---------- */
  const SPRINKLE_COLORS = ["#c9a27a", "#f2d6d0", "#f6efe6", "#2a2a2a", "#ffffff"];
  const sprinkle = (x, y, count = 20) => {
    if (reduceMotion) return;
    for (let i = 0; i < count; i++) {
      const bit = document.createElement("span");
      bit.className = "sprinkle";
      bit.style.left = `${x}px`;
      bit.style.top = `${y}px`;
      bit.style.background = SPRINKLE_COLORS[i % SPRINKLE_COLORS.length];
      document.body.append(bit);
      const angle = Math.random() * Math.PI * 2;
      const dist = 40 + Math.random() * 90;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist + 30;
      const rot = Math.random() * 540 - 270;
      bit.animate(
        [
          { transform: "translate(0, 0) rotate(0deg)", opacity: 1 },
          { transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg)`, opacity: 0 },
        ],
        { duration: 800 + Math.random() * 500, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }
      ).onfinish = () => bit.remove();
    }
  };

  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn--dark, .btn--solid, [data-enquire]");
    if (!btn) return;
    if (e.detail === 0) { // keyboard activation has no pointer position
      const r = btn.getBoundingClientRect();
      sprinkle(r.left + r.width / 2, r.top + r.height / 2, 14);
    } else {
      sprinkle(e.clientX, e.clientY, 18);
    }
  });

  // celebrate when a form reaches its success state
  ["[data-success]", "[data-contact-success]"].forEach((sel) => {
    const el = $(sel);
    if (!el) return;
    new MutationObserver(() => {
      if (el.hidden) return;
      const r = el.getBoundingClientRect();
      sprinkle(r.left + r.width / 2, r.top + Math.min(r.height / 2, 120), 48);
    }).observe(el, { attributes: true, attributeFilter: ["hidden"] });
  });

  /* ---------- 14c CAKE STUDIO ---------- */
  const builder = $("[data-builder]");
  if (builder) {
    const swatches = $$("[data-flavour]", builder);
    const msgInput = $("[data-builder-msg]", builder);
    const cakeText = $("[data-builder-text]", builder);
    const label = $("[data-builder-label]", builder);
    const orderLink = $("[data-builder-order]", builder);
    const cake = $(".cake", builder);
    let flavour = swatches[0];

    swatches.forEach((s) => {
      s.style.setProperty("--c1", s.dataset.sponge);
      s.style.setProperty("--c2", s.dataset.icing);
    });

    const update = (animate) => {
      builder.style.setProperty("--sponge", flavour.dataset.sponge);
      builder.style.setProperty("--icing", flavour.dataset.icing);
      builder.style.setProperty("--ink-on", flavour.dataset.ink);
      const msg = msgInput.value.trim();
      cakeText.textContent = msg;
      label.textContent = flavour.dataset.flavour;
      orderLink.href = waLink(
        `Hi The Cake Boutique, I designed a ${flavour.dataset.flavour} cake on your website` +
        (msg ? ` with the message "${msg}"` : "") + ". Could you share a quote?"
      );
      if (animate && !reduceMotion) {
        cake.classList.remove("is-pop");
        void cake.getBoundingClientRect(); // restart the animation
        cake.classList.add("is-pop");
      }
    };

    swatches.forEach((s) => s.addEventListener("click", () => {
      flavour = s;
      swatches.forEach((x) => x.setAttribute("aria-pressed", String(x === s)));
      update(true);
    }));
    msgInput.addEventListener("input", () => update(false));
    update(false);
  }

  /* ---------- 14d SMART HEADER + BACK TO TOP ---------- */
  const toTop = document.createElement("button");
  toTop.type = "button";
  toTop.className = "to-top glass";
  toTop.setAttribute("aria-label", "Back to top");
  toTop.innerHTML =
    '<svg class="to-top__ring" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="21"/></svg>' +
    '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V6M6 12l6-6 6 6"/></svg>';
  document.body.append(toTop);
  const ring = $("circle", toTop);
  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));

  let lastY = window.scrollY;
  let scrollTick = false;
  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    ring.style.strokeDashoffset = String(132 - 132 * (max > 0 ? Math.min(y / max, 1) : 0));
    toTop.classList.toggle("is-visible", y > 500);

    if (header && Math.abs(y - lastY) > 6) {
      const goingDown = y > lastY;
      const menuOpen = document.body.classList.contains("is-locked");
      header.classList.toggle("is-hidden", goingDown && y > 480 && !menuOpen && !header.contains(document.activeElement));
      lastY = y;
    }
    scrollTick = false;
  };
  window.addEventListener("scroll", () => {
    if (!scrollTick) { requestAnimationFrame(onScroll); scrollTick = true; }
  }, { passive: true });
  onScroll();

  /* ---------- 14e DRAG-TO-SCROLL (mouse only) ---------- */
  if (finePointer) {
    $$(".rail, .chips, .testimonials__track, .reels__rail").forEach((el) => {
      let down = false, moved = false, startX = 0, startLeft = 0;
      el.addEventListener("pointerdown", (e) => {
        if (e.pointerType !== "mouse" || e.button !== 0) return;
        down = true; moved = false; startX = e.clientX; startLeft = el.scrollLeft;
      });
      window.addEventListener("pointermove", (e) => {
        if (!down) return;
        const dx = e.clientX - startX;
        if (Math.abs(dx) > 4) { moved = true; el.classList.add("is-dragging"); }
        if (moved) el.scrollLeft = startLeft - dx;
      });
      window.addEventListener("pointerup", () => {
        if (!down) return;
        down = false;
        el.classList.remove("is-dragging");
      });
      // a drag must not count as a click on whatever is under the pointer
      el.addEventListener("click", (e) => {
        if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
      }, true);
      el.addEventListener("dragstart", (e) => e.preventDefault());
    });
  }

  /* ---------- 14f DESKTOP-ONLY: cursor ring, magnetic buttons, tilt, hero parallax ---------- */
  if (finePointer && !reduceMotion) {
    // glass cursor ring that eases toward the pointer
    const cursor = document.createElement("div");
    cursor.className = "cursor";
    cursor.setAttribute("aria-hidden", "true");
    document.body.append(cursor);

    let tx = -100, ty = -100, cx = tx, cy = ty, scale = 1, targetScale = 1;
    document.addEventListener("pointermove", (e) => {
      tx = e.clientX; ty = e.clientY;
      cursor.classList.add("is-on");
      if (e.target.closest("input, textarea, select")) targetScale = 0.4;
      else if (e.target.closest("a, button, .card__media, .gallery__btn")) targetScale = 1.9;
      else targetScale = 1;
    }, { passive: true });
    document.documentElement.addEventListener("mouseleave", () => cursor.classList.remove("is-on"));
    const follow = () => {
      cx += (tx - cx) * 0.18;
      cy += (ty - cy) * 0.18;
      scale += (targetScale - scale) * 0.18;
      cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0) scale(${scale})`;
      requestAnimationFrame(follow);
    };
    follow();

    // magnetic buttons
    $$(".btn:not(.form__submit), .round-btn, .whatsapp-fab").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--tx", `${(e.clientX - r.left - r.width / 2) * 0.25}px`);
        el.style.setProperty("--ty", `${(e.clientY - r.top - r.height / 2) * 0.35}px`);
      });
      el.addEventListener("pointerleave", () => {
        el.style.setProperty("--tx", "0px");
        el.style.setProperty("--ty", "0px");
      });
    });

    // 3D tilt with glare on cake photos
    $$(".product .card__media, .rail .card__media").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        el.style.setProperty("--ry", `${(px - 0.5) * 10}deg`);
        el.style.setProperty("--rx", `${(0.5 - py) * 10}deg`);
        el.style.setProperty("--gx", `${px * 100}%`);
        el.style.setProperty("--gy", `${py * 100}%`);
      });
      el.addEventListener("pointerleave", () => {
        el.style.setProperty("--rx", "0deg");
        el.style.setProperty("--ry", "0deg");
      });
    });

    // hero badge drifts opposite to the pointer
    const heroEl = $(".hero");
    if (heroEl) {
      let heroFrame = null;
      heroEl.addEventListener("pointermove", (e) => {
        if (heroFrame) return;
        heroFrame = requestAnimationFrame(() => {
          heroEl.style.setProperty("--bx", `${-(e.clientX / window.innerWidth - 0.5) * 28}px`);
          heroEl.style.setProperty("--by", `${-(e.clientY / window.innerHeight - 0.5) * 28}px`);
          heroFrame = null;
        });
      }, { passive: true });
    }
  }
    /* =========================================================
     15 INSTAGRAM REELS
     ========================================================= */
  const reelsRail = $("[data-reels]");
  if (reelsRail) {
    // TODO: your Instagram username (no @)
    const IG_HANDLE = "thecakeboutique.ahm";

    // MODE B (optional, automatic): paste your feed JSON URL, e.g. from Behold.so.
    // Leave empty to use the manual list below.
    const FEED_URL = "";

    // MODE A (manual): the code is the part after /reel/ in a reel link.
    // https://www.instagram.com/reel/C9xAbCdEfGh/  ->  "C9xAbCdEfGh"
    const REELS = [
      { code: "DPnl5e8kniq", label: "Belgian Dark Truffle" },
      { code: "REPLACE_ME_2", label: "Rose Pistachio" },
      { code: "REPLACE_ME_3", label: "Biscoff Crunch" },
      { code: "REPLACE_ME_4", label: "Cupcake box" },
      { code: "REPLACE_ME_5", label: "Behind the counter" },
    ];

    const profileUrl = `https://www.instagram.com/${IG_HANDLE}/`;
    const isValidCode = (c) => /^[\w-]{5,20}$/.test(c) && !c.startsWith("REPLACE");
    const cards = [];

    // Restore a card to its poster (used when another reel starts playing)
    const reset = (card) => {
      const frame = $("iframe", card.li);
      if (!frame) return;
      frame.remove();
      card.li.append(card.poster);
    };

    const play = (card) => {
      if (!isValidCode(card.code)) { window.open(profileUrl, "_blank", "noopener"); return; }
      cards.forEach((c) => { if (c !== card) reset(c); });
      const frame = document.createElement("iframe");
      frame.src = `https://www.instagram.com/reel/${card.code}/embed/`;
      frame.title = `Instagram reel: ${card.label}`;
      frame.allow = "autoplay; encrypted-media; fullscreen; picture-in-picture";
      frame.allowFullscreen = true;
      frame.setAttribute("scrolling", "no");
      frame.referrerPolicy = "strict-origin-when-cross-origin";
      card.poster.remove();
      card.li.append(frame);
    };

    const build = (items) => {
      reelsRail.textContent = "";
      cards.length = 0;
      items.forEach((item, i) => {
        const li = document.createElement("li");
        li.className = "reel";

        const poster = document.createElement("button");
        poster.type = "button";
        poster.className = "reel__poster";
        poster.setAttribute("aria-label", `Play reel: ${item.label}`);

        if (item.thumb) {
          const img = document.createElement("img");
          img.src = item.thumb; img.alt = ""; img.loading = "lazy";
          poster.append(img);
        }
        const mark = document.createElement("span");
        mark.className = "reel__mark"; mark.textContent = "TCB";
        const playBtn = document.createElement("span");
        playBtn.className = "reel__play glass";
        playBtn.innerHTML = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"/></svg>';
        const label = document.createElement("span");
        label.className = "reel__label glass"; label.textContent = item.label;
        poster.append(mark, playBtn, label);

        const card = { li, poster, code: item.code, label: item.label };
        poster.addEventListener("click", () => play(card));
        li.append(poster);
        reelsRail.append(li);
        cards.push(card);
      });
    };

    // Start with the manual list so the section is never empty
    build(REELS);

    // Optional live feed: replaces the manual list when it loads successfully.
    // Check your feed's JSON field names: this expects posts[].permalink / thumbnailUrl / caption.
    if (FEED_URL) {
      fetch(FEED_URL)
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Feed error"))))
        .then((data) => {
          const posts = (data.posts || data.data || []).filter((p) => /\/reel\//.test(p.permalink || ""));
          const items = posts.slice(0, 8).map((p) => ({
            code: (p.permalink.match(/\/reel\/([\w-]+)/) || [])[1] || "",
            thumb: p.thumbnailUrl || p.sizes?.medium?.mediaUrl || "",
            label: (p.caption || "Watch the reel").split("\n")[0].slice(0, 36),
          })).filter((x) => isValidCode(x.code));
          if (items.length) build(items);
        })
        .catch(() => { /* keep the manual list */ });
    }

    // Profile link + arrow buttons
    $("[data-ig-profile]")?.setAttribute("href", profileUrl);
    const reelStep = () => (reelsRail.firstElementChild?.getBoundingClientRect().width || 260) + 16;
    $("[data-reels-prev]")?.addEventListener("click", () => reelsRail.scrollBy({ left: -reelStep(), behavior: reduceMotion ? "auto" : "smooth" }));
    $("[data-reels-next]")?.addEventListener("click", () => reelsRail.scrollBy({ left: reelStep(), behavior: reduceMotion ? "auto" : "smooth" }));
  }

    /* =========================================================
     16 LIVE FEATURES: open status, story, counters, delivery
     ========================================================= */

  /* ---------- 16a OPEN-NOW BADGE (Ahmedabad time) ---------- */
  const statusEls = $$("[data-open-status]");
  if (statusEls.length) {
    const OPEN_HOUR = 10;   // TODO: match the real opening hours (24h clock)
    const CLOSE_HOUR = 22;
    const clock = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "numeric", hour12: false });
    const paint = () => {
      const parts = clock.formatToParts(new Date());
      const h = Number(parts.find((p) => p.type === "hour").value) % 24;
      const m = Number(parts.find((p) => p.type === "minute").value);
      const isOpen = h + m / 60 >= OPEN_HOUR && h + m / 60 < CLOSE_HOUR;
      statusEls.forEach((el) => {
        el.classList.toggle("is-open", isOpen);
        el.textContent = isOpen ? "Open now, until 10 pm" : "Closed, opens at 10 am";
      });
    };
    paint();
    setInterval(paint, 60000);
  }

  /* ---------- 16b SCROLL STORY: the cake builds as you scroll ---------- */
  const story = $("[data-story]");
  if (story && !reduceMotion) {
    const steps = $$("[data-step]", story);
    const layers = $$("[data-layer]", story);
    let storyTick = false;
    const paintStory = () => {
      const r = story.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      const p = span > 0 ? Math.min(Math.max(-r.top / span, 0), 1) : 0;
      const index = Math.min(steps.length - 1, Math.floor(p * steps.length));
      steps.forEach((s, i) => s.classList.toggle("is-active", i === index));
      layers.forEach((l, i) => l.classList.toggle("is-on", i <= index));
      story.style.setProperty("--p", p.toFixed(3));
      storyTick = false;
    };
    window.addEventListener("scroll", () => {
      if (!storyTick) { requestAnimationFrame(paintStory); storyTick = true; }
    }, { passive: true });
    window.addEventListener("resize", paintStory);
    paintStory();
  }

  /* ---------- 16c COUNT-UP NUMBERS ---------- */
  const counters = $$("[data-count-to]");
  if (counters.length) {
    const run = (el) => {
      const end = Number(el.dataset.countTo);
      const suffix = el.dataset.suffix || "";
      if (reduceMotion) { el.textContent = end.toLocaleString("en-IN") + suffix; return; }
      const dur = 1600;
      const t0 = performance.now();
      const frame = (now) => {
        const t = Math.min((now - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - t, 4);
        el.textContent = Math.round(end * eased).toLocaleString("en-IN") + suffix;
        if (t < 1) requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    };
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries, obs) => {
        entries.forEach((e) => { if (e.isIntersecting) { run(e.target); obs.unobserve(e.target); } });
      }, { threshold: 0.6 });
      counters.forEach((c) => io.observe(c));
    } else {
      counters.forEach(run);
    }
  }

  /* ---------- 16d DELIVERY CHECKER ---------- */
  const deliveryForm = $("[data-delivery]");
  if (deliveryForm) {
    const pin = $("input", deliveryForm);
    const out = $("[data-delivery-result]", deliveryForm);
    pin.addEventListener("input", () => { pin.value = pin.value.replace(/\D/g, ""); });

    deliveryForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const code = pin.value;
      if (!/^\d{6}$/.test(code)) { out.textContent = "Please enter a valid 6-digit pincode."; return; }

      // TODO: edit these rules to match the shop's real delivery area.
      if (/^380\d{3}$/.test(code)) {
        out.textContent = "Yes! We deliver to you. Order before 4 pm for same-day delivery.";
      } else if (/^38[12]\d{3}$/.test(code)) {
        out.innerHTML = `Nearby, so probably yes. <a href="${waLink(`Hi The Cake Boutique, can you deliver to ${code}?`)}" target="_blank" rel="noopener">Confirm on WhatsApp</a>.`;
      } else {
        out.innerHTML = `That's outside our usual area. <a href="${waLink(`Hi The Cake Boutique, can you deliver to ${code}?`)}" target="_blank" rel="noopener">Ask us on WhatsApp</a>, we may still be able to help.`;
      }
    });
  }
    /* =========================================================
     17 FAVOURITES, THEME TOGGLE, CAKE OF THE MONTH
     ========================================================= */

  /* ---------- 17a FAVOURITES (menu page) ---------- */
  const favGrid = $("[data-menu-grid]");
  if (favGrid) {
    const rupees = new Intl.NumberFormat("en-IN");
    const cards = $$(".product", favGrid);
    const STORE_KEY = "tcb-favs";
    const HEART = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>';

    let favs = [];
    try { favs = JSON.parse(localStorage.getItem(STORE_KEY) || "[]"); } catch (_) { favs = []; }
    if (!Array.isArray(favs)) favs = [];
    favs = favs.filter((n) => cards.some((c) => c.dataset.name === n));
    const save = () => { try { localStorage.setItem(STORE_KEY, JSON.stringify(favs)); } catch (_) { /* storage blocked */ } };
    const byName = (n) => cards.find((c) => c.dataset.name === n);

    // Reads the size currently chosen on a card (set by section 10)
    const selection = (card) => {
      const prices = card.dataset.prices.split(",").map(Number);
      const units = card.dataset.units.split(",");
      let i = $$("[data-sizes] button", card).findIndex((b) => b.getAttribute("aria-pressed") === "true");
      if (i < 0) i = 0;
      return { name: card.dataset.name, unit: units[i], price: prices[i] };
    };

    // Build the floating tray
    const bar = document.createElement("div");
    bar.className = "fav-bar glass";
    bar.setAttribute("role", "region");
    bar.setAttribute("aria-label", "Your favourites");
    bar.innerHTML = `
      <ul class="fav-bar__list" id="fav-list" hidden></ul>
      <div class="fav-bar__row">
        <button class="fav-bar__toggle" type="button" aria-expanded="false" aria-controls="fav-list">
          <span class="fav-bar__count">0</span>
          <span class="fav-bar__text"><strong>Favourites</strong><small></small></span>
        </button>
        <a class="btn btn--solid fav-bar__order" href="#" target="_blank" rel="noopener">
          <svg class="icon"><use href="#i-chat"/></svg>Order</a>
      </div>`;
    document.body.append(bar);

    const list = $(".fav-bar__list", bar);
    const toggleBtn = $(".fav-bar__toggle", bar);
    const countEl = $(".fav-bar__count", bar);
    const titleEl = $(".fav-bar__text strong", bar);
    const totalEl = $(".fav-bar__text small", bar);
    const orderLink = $(".fav-bar__order", bar);

    const setOpen = (open) => {
      list.hidden = !open;
      toggleBtn.setAttribute("aria-expanded", String(open));
    };
    toggleBtn.addEventListener("click", () => setOpen(list.hidden));

    const render = () => {
      const items = favs.map(byName).filter(Boolean).map(selection);
      const total = items.reduce((sum, it) => sum + it.price, 0);

      cards.forEach((card) => {
        $(".fav", card).setAttribute("aria-pressed", String(favs.includes(card.dataset.name)));
      });

      countEl.textContent = items.length;
      titleEl.textContent = items.length === 1 ? "1 favourite" : `${items.length} favourites`;
      totalEl.textContent = `About ₹${rupees.format(total)}`;

      list.textContent = "";
      items.forEach((it) => {
        const li = document.createElement("li");
        li.className = "fav-item";
        const label = document.createElement("span");
        label.textContent = it.name;
        const unit = document.createElement("small");
        unit.textContent = it.unit;
        label.append(unit);
        const price = document.createElement("strong");
        price.textContent = `₹${rupees.format(it.price)}`;
        const remove = document.createElement("button");
        remove.type = "button";
        remove.setAttribute("aria-label", `Remove ${it.name}`);
        remove.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#i-close"/></svg>';
        remove.addEventListener("click", () => {
          favs = favs.filter((n) => n !== it.name);
          save(); render();
        });
        li.append(label, price, remove);
        list.append(li);
      });
      if (items.length) {
        const li = document.createElement("li");
        const clear = document.createElement("button");
        clear.type = "button";
        clear.className = "fav-bar__clear";
        clear.textContent = "Clear all";
        clear.addEventListener("click", () => { favs = []; save(); render(); });
        li.append(clear);
        list.append(li);
      }

      orderLink.href = waLink([
        "Hi The Cake Boutique, I'd like to order these favourites:",
        "",
        ...items.map((it, i) => `${i + 1}. ${it.name} (${it.unit}) - ₹${rupees.format(it.price)}`),
        "",
        `Estimated total: ₹${rupees.format(total)}`,
        "Please confirm availability, design and delivery.",
      ].join("\n"));

      bar.classList.toggle("is-visible", items.length > 0);
      if (!items.length) setOpen(false);
    };

    // A heart on every cake photo
    cards.forEach((card) => {
      const heart = document.createElement("button");
      heart.type = "button";
      heart.className = "fav glass";
      heart.setAttribute("aria-label", `Save ${card.dataset.name} to favourites`);
      heart.setAttribute("aria-pressed", "false");
      heart.innerHTML = HEART;
      $(".card__media", card).append(heart);

      heart.addEventListener("click", () => {
        const name = card.dataset.name;
        const adding = !favs.includes(name);
        favs = adding ? [...favs, name] : favs.filter((n) => n !== name);
        save(); render();
        if (adding && !reduceMotion) {
          heart.animate(
            [{ transform: "scale(1)" }, { transform: "scale(1.3)" }, { transform: "scale(1)" }],
            { duration: 500, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }
          );
          const r = heart.getBoundingClientRect();
          sprinkle(r.left + r.width / 2, r.top + r.height / 2, 10);
        }
      });
    });

    // Changing a size updates the tray's price and message
    favGrid.addEventListener("click", (e) => {
      if (e.target.closest("[data-sizes] button")) render();
    });

    render();
  }

  /* ---------- 17b THEME TOGGLE ---------- */
  const headerBar = $(".header__bar");
  const menuBtn = headerBar && $(".menu-toggle", headerBar);
  if (headerBar && menuBtn) {
    const root = document.documentElement;
    const metaTheme = $('meta[name="theme-color"]');
    const currentTheme = () => (root.dataset.theme === "dark" ? "dark" : "light");

    const themeBtn = document.createElement("button");
    themeBtn.type = "button";
    themeBtn.className = "theme-toggle";
    themeBtn.innerHTML =
      '<svg class="icon i-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/></svg>' +
      '<svg class="icon i-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6L7 7M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/></svg>';

    // Group the theme button and the menu button so the bar layout stays balanced
    const actions = document.createElement("div");
    actions.className = "header__actions";
    menuBtn.before(actions);
    actions.append(themeBtn, menuBtn);

    const applyTheme = (t) => {
      root.dataset.theme = t;
      if (metaTheme) metaTheme.setAttribute("content", t === "dark" ? "#161514" : "#2a2a2a");
      themeBtn.setAttribute("aria-label", t === "dark" ? "Switch to light mode" : "Switch to dark mode");
    };
    applyTheme(currentTheme());

    themeBtn.addEventListener("click", () => {
      const next = currentTheme() === "dark" ? "light" : "dark";
      try { localStorage.setItem("tcb-theme", next); } catch (_) { /* storage blocked */ }

      if (!document.startViewTransition || reduceMotion) { applyTheme(next); return; }

      // circular reveal that grows from the button
      const r = themeBtn.getBoundingClientRect();
      const x = r.left + r.width / 2;
      const y = r.top + r.height / 2;
      const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
      root.classList.add("theme-switching");
      const vt = document.startViewTransition(() => applyTheme(next));
      vt.ready.then(() => {
        root.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: 800, easing: "cubic-bezier(0.22, 1, 0.36, 1)", pseudoElement: "::view-transition-new(root)" }
        );
      }).catch(() => { /* transition skipped */ });
      vt.finished.finally(() => root.classList.remove("theme-switching"));
    });
  }

    /* ---------- 17c CAKE OF THE MONTH: 12-month rotation + countdown ---------- */
  const spotlight = $("[data-spotlight]");
  if (spotlight) {
    /* ---------------------------------------------------------
       THE 12-MONTH LIST: the only thing the shop ever edits.
       Index 0 = January ... 11 = December.
       img: an Unsplash link for now. Swap for the shop's own photo,
            e.g. "assets/images/cotm-oct.webp" (no leading slash).
       --------------------------------------------------------- */
    const CAKES = [
      { name: "Chikki Crunch", desc: "Uttarayan in a cake. Jaggery cream, crushed peanut chikki and sesame brittle on soft vanilla sponge.",
        notes: ["Jaggery cream", "Peanut chikki", "Sesame"], price: 950, unit: "0.5 kg",
        img: "https://images.unsplash.com/photo-1558636508-e0db3814bd1d?auto=format&fit=crop&w=900&q=75", alt: "Layered cake with cream and crunchy topping" },
      { name: "Red Velvet Heart", desc: "Deep red sponge, tangy cream cheese frosting and a hand-piped heart. Made for February.",
        notes: ["Cream cheese", "Cocoa sponge", "Piped heart"], price: 900, unit: "0.5 kg",
        img: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=75", alt: "Slice of red velvet cake with cream cheese frosting" },
      { name: "Thandai Saffron", desc: "A Holi favourite. Spiced thandai cream, saffron strands and chopped almonds between light sponge layers.",
        notes: ["Thandai spice", "Saffron", "Almond"], price: 1000, unit: "0.5 kg",
        img: "https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?auto=format&fit=crop&w=900&q=75", alt: "Decorated celebration cake" },
      { name: "Strawberry Cream Tart Cake", desc: "Spring on a plate. Vanilla custard, glazed fresh strawberries and a buttery crumb base.",
        notes: ["Fresh strawberry", "Vanilla custard", "Buttery base"], price: 980, unit: "0.5 kg",
        img: "https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=900&q=75", alt: "Strawberry cream tart" },
      { name: "Alphonso Mango Cream", desc: "Mango season, finally. Eggless sponge layered with fresh Alphonso pulp and whipped cream.",
        notes: ["Alphonso pulp", "Eggless", "Whipped cream"], price: 900, unit: "0.5 kg",
        img: "https://images.unsplash.com/photo-1621303837174-89787a7d4729?auto=format&fit=crop&w=900&q=75", alt: "Eggless mango cream cake" },
      { name: "Mango Cheesecake Jar Cake", desc: "Cool and creamy for the hottest month. Mango cheesecake layers over a biscuit crumb.",
        notes: ["Mango", "Cream cheese", "Biscuit crumb"], price: 1100, unit: "0.5 kg",
        img: "https://images.unsplash.com/photo-1607478900766-efe13248b125?auto=format&fit=crop&w=900&q=75", alt: "Creamy dessert with swirled topping" },
      { name: "Filter Coffee Praline", desc: "A monsoon cake. Strong coffee sponge, hazelnut praline and a silky mocha cream.",
        notes: ["Coffee sponge", "Hazelnut praline", "Mocha cream"], price: 1050, unit: "0.5 kg",
        img: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=75", alt: "Chocolate coffee cake with glossy ganache" },
      { name: "Kesar Pista Rakhi Cake", desc: "For the sibling who always steals the last slice. Saffron cream, roasted pistachio and a gold-dusted top.",
        notes: ["Saffron", "Pistachio", "Gold dust"], price: 1150, unit: "0.5 kg",
        img: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=900&q=75", alt: "Pistachio cake with dried petals" },
      { name: "Biscoff Crunch", desc: "Spiced biscuit cream, a caramel drip and a crunchy cookie crown. Cosy before the festive rush.",
        notes: ["Biscoff cream", "Caramel drip", "Cookie crumb"], price: 950, unit: "0.5 kg",
        img: "https://images.unsplash.com/photo-1535141192574-5d4897c12636?auto=format&fit=crop&w=900&q=75", alt: "Biscoff cake with caramel drip" },
      { name: "Rose Pistachio", desc: "Rose-scented cream, a roasted pistachio crumb and dried petals on top. Light, floral and a little bit festive.",
        notes: ["Rose cream", "Roasted pistachio", "Dried petals"], price: 1100, unit: "0.5 kg",
        img: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=900&q=75", alt: "Rose Pistachio cake topped with dried petals" },
      { name: "Diwali Dry Fruit Truffle", desc: "Belgian dark chocolate truffle studded with roasted nuts and finished with edible gold. Made to gift.",
        notes: ["Dark chocolate", "Roasted nuts", "Edible gold"], price: 1250, unit: "0.5 kg",
        img: "https://images.unsplash.com/photo-1542826438-bd32f43d626f?auto=format&fit=crop&w=900&q=75", alt: "Dark chocolate dessert with berries" },
      { name: "Plum and Cinnamon Christmas Cake", desc: "Slow-soaked fruit, warm cinnamon and a snowy cream finish. The cake December was waiting for.",
        notes: ["Soaked fruit", "Cinnamon", "Cream snow"], price: 1200, unit: "0.5 kg",
        img: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=900&q=75", alt: "A baker finishing a festive cake" },
    ];

    const IST_MS = 330 * 60000; // India is UTC+5:30 with no daylight saving
    const rupees = new Intl.NumberFormat("en-IN");
    const pad = (n) => String(n).padStart(2, "0");

    const cd = {
      d: $('[data-cd="d"]', spotlight), h: $('[data-cd="h"]', spotlight),
      m: $('[data-cd="m"]', spotlight), s: $('[data-cd="s"]', spotlight),
    };
    const monthEls = $$("[data-month]", spotlight);
    const orderBtn = $("[data-spotlight-order]", spotlight);
    const el = {
      img: $("[data-sp-img]", spotlight), name: $("[data-sp-name]", spotlight),
      desc: $("[data-sp-desc]", spotlight), notes: $("[data-sp-notes]", spotlight),
      price: $("[data-sp-price]", spotlight), unit: $("[data-sp-unit]", spotlight),
    };

    // Preview any month while testing: index.html?cotm=3 shows April (1 = Jan ... 12 = Dec)
    const forced = Number(new URLSearchParams(location.search).get("cotm"));
    const forcedMonth = forced >= 1 && forced <= 12 ? forced - 1 : null;

    const show = (monthIndex, monthName) => {
      const cake = CAKES[monthIndex];
      monthEls.forEach((m) => { m.textContent = monthName; });
      if (!cake) return; // list incomplete: keep the fallback already in the HTML

      spotlight.dataset.cake = cake.name;
      if (el.img) { el.img.src = cake.img; el.img.alt = cake.alt || cake.name; }
      if (el.name) el.name.textContent = cake.name;
      if (el.desc) el.desc.textContent = cake.desc;
      if (el.price) el.price.textContent = `₹${rupees.format(cake.price)}`;
      if (el.unit) el.unit.textContent = cake.unit;
      if (el.notes) {
        el.notes.textContent = "";
        cake.notes.forEach((n) => {
          const li = document.createElement("li");
          li.textContent = n;
          el.notes.append(li);
        });
      }
      if (orderBtn) {
        orderBtn.href = waLink(
          `Hi The Cake Boutique, I'd like to pre-order the ${monthName} Cake of the Month (${cake.name}). Could you share the details?`
        );
      }
    };

    let shownMonth = -1;
    let lastSecond = -1;

    const tick = () => {
      const now = Date.now();
      const ist = new Date(now + IST_MS);
      const y = ist.getUTCFullYear();
      const m = ist.getUTCMonth();
      let left = Math.max(0, Date.UTC(y, m + 1, 1) - IST_MS - now); // the moment IST rolls into next month

      const d = Math.floor(left / 86400000); left -= d * 86400000;
      const h = Math.floor(left / 3600000);  left -= h * 3600000;
      const mi = Math.floor(left / 60000);   left -= mi * 60000;
      const s = Math.floor(left / 1000);

      cd.d.textContent = pad(d);
      cd.h.textContent = pad(h);
      cd.m.textContent = pad(mi);
      cd.s.textContent = pad(s);

      if (!reduceMotion && s !== lastSecond) {
        cd.s.animate(
          [{ opacity: 0.35, transform: "translateY(-4px)" }, { opacity: 1, transform: "none" }],
          { duration: 350, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }
        );
      }
      lastSecond = s;

      // New month (or first run): swap in that month's cake
      const active = forcedMonth ?? m;
      if (active !== shownMonth) {
        shownMonth = active;
        const name = new Date(Date.UTC(y, active, 1)).toLocaleString("en-IN", { month: "long", timeZone: "UTC" });
        show(active, name);
      }
    };
    tick();
    setInterval(tick, 1000);
  }
    /* =========================================================
     18 NAVBAR: gliding pill, progress line, order button
     ========================================================= */
  const navBar = $(".header__bar");
  if (navBar) {
    /* ---- 18a progress line ---- */
    const progress = document.createElement("span");
    progress.className = "header__progress";
    progress.setAttribute("aria-hidden", "true");
    navBar.append(progress);

    let navTick = false;
    const paintProgress = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.setProperty("--sp", max > 0 ? Math.min(window.scrollY / max, 1).toFixed(3) : 0);
      navTick = false;
    };
    window.addEventListener("scroll", () => {
      if (!navTick) { requestAnimationFrame(paintProgress); navTick = true; }
    }, { passive: true });
    paintProgress();

  
    /* ---- 18c gliding pill ---- */
    const navList = $(".nav__list", navBar);
    if (navList) {
      const links = $$(".nav__link", navList);
      const glide = document.createElement("span");
      glide.className = "nav__glide";
      glide.setAttribute("aria-hidden", "true");
      navList.prepend(glide);

      const current = links.find((l) => l.getAttribute("aria-current") === "page");
      const moveTo = (link, isCurrent, instant = false) => {
        if (!link) { glide.style.opacity = "0"; return; }
        glide.classList.toggle("is-instant", instant);
        glide.classList.toggle("is-current", isCurrent);
        glide.style.width = `${link.offsetWidth}px`;
        glide.style.transform = `translateX(${link.offsetLeft}px)`;
        glide.style.opacity = "1";
      };
      const home = (instant) => moveTo(current, true, instant);

      links.forEach((link) => {
        const enter = () => moveTo(link, link === current);
        link.addEventListener("pointerenter", enter);
        link.addEventListener("focus", enter);
        link.addEventListener("blur", () => home(false));
      });
      navList.addEventListener("pointerleave", () => home(false));

      // the nav is hidden below 1024px, so measure again once it shows
      const place = () => { if (navList.offsetWidth) home(true); };
      place();
      document.fonts?.ready.then(place);
      window.addEventListener("resize", place);
    }
  }
})();