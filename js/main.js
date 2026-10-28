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

  /* ---------- 10 MENU: size selector, live price, filter ---------- */
  const menuGrid = $("[data-menu-grid]");
  if (menuGrid) {
    const rupees = new Intl.NumberFormat("en-IN");
    const products = $$(".product", menuGrid);

    // Build the size buttons and wire the live price + WhatsApp link
    products.forEach((card) => {
      const prices = card.dataset.prices.split(",").map(Number);
      const units = card.dataset.units.split(",");
      const sizes = $("[data-sizes]", card);
      const priceEl = $("[data-price]", card);
      const labelEl = $("[data-price-label]", card);
      const enquire = $("[data-enquire]", card);

      const select = (i) => {
        $$("button", sizes).forEach((b, n) => b.setAttribute("aria-pressed", String(n === i)));
        priceEl.textContent = `₹${rupees.format(prices[i])}`;
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
    });

    // Filter chips: fade out, then remove from layout. Fade back in on return.
    const chips = $$("[data-filter]");
    const countEl = $("[data-count]");
    const HIDE_MS = reduceMotion ? 0 : 400;

    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        const filter = chip.dataset.filter;
        chips.forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
        let shown = 0;

        products.forEach((card) => {
          const match = filter === "all" || card.dataset.cat.split(" ").includes(filter);
          clearTimeout(card._hideTimer);
          if (match) {
            shown++;
            card.hidden = false;
            // two frames so the browser registers the start state before fading in
            requestAnimationFrame(() => requestAnimationFrame(() => card.classList.remove("is-out")));
          } else {
            card.classList.add("is-out");
            card._hideTimer = setTimeout(() => { card.hidden = true; }, HIDE_MS);
          }
        });
        if (countEl) countEl.textContent = shown;
      });
    });
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

  /* ---------- 14a HEADLINE WORD REVEAL + INTRO SPLASH ---------- */
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

  let seenIntro = false;
  try { seenIntro = sessionStorage.getItem("tcb-intro") === "1"; } catch (_) { /* storage blocked */ }

  if ($(".hero") && !reduceMotion && !seenIntro) {
    const loader = document.createElement("div");
    loader.className = "loader";
    loader.setAttribute("aria-hidden", "true");
    loader.innerHTML = '<span class="loader__mark">TCB</span><span class="loader__bar"></span>';
    document.body.prepend(loader);
    document.body.classList.add("is-locked");

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      loader.classList.add("is-done");
      document.body.classList.remove("is-locked");
      startSplit();
      setTimeout(() => loader.remove(), 1000);
      try { sessionStorage.setItem("tcb-intro", "1"); } catch (_) { /* storage blocked */ }
    };
    window.addEventListener("load", () => setTimeout(finish, 700));
    setTimeout(finish, 2600); // never block the page longer than this
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
    $$(".rail, .chips, .testimonials__track").forEach((el) => {
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
})();