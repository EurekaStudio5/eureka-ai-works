/* ============================================================
   Eureka AI works — interactions
   ============================================================ */
(function () {
  "use strict";

  /* ---- Sticky header shadow on scroll ---- */
  const header = document.getElementById("siteHeader");
  const onScroll = () => {
    if (window.scrollY > 12) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- Mobile navigation ---- */
  const toggle = document.getElementById("navToggle");
  const nav = document.getElementById("primaryNav");

  const closeNav = () => {
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "メニューを開く");
  };
  const openNav = () => {
    nav.classList.add("open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "メニューを閉じる");
  };

  toggle.addEventListener("click", () => {
    nav.classList.contains("open") ? closeNav() : openNav();
  });

  // Close the menu after tapping a link (mobile)
  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeNav);
  });

  // Close on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("open")) closeNav();
  });

  /* ---- Scroll reveal (progressive enhancement) ---- */
  const revealEls = document.querySelectorAll(".reveal");
  const revealAll = () => revealEls.forEach((el) => el.classList.add("in"));

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            // small stagger for groups appearing together
            const delay = Math.min(i * 70, 280);
            entry.target.style.transitionDelay = delay + "ms";
            entry.target.classList.add("in");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));

    // Safety net: if the observer never fires (throttled/offscreen
    // rendering, prerender, etc.), force everything visible so the
    // page is never stuck blank. Also reveal on first interaction.
    window.addEventListener("load", () => setTimeout(revealAll, 1500), { once: true });
    window.addEventListener("scroll", revealAll, { once: true, passive: true });
  } else {
    revealAll();
  }

  const reducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Animated stat counters ---- */
  const statValues = document.querySelectorAll(".stat-value");
  const setFinal = (el) => { el.textContent = el.dataset.count; };

  const animateCount = (el) => {
    const target = parseFloat(el.dataset.count) || 0;
    const duration = 1100;
    let startTime = null;
    const tick = (now) => {
      if (startTime === null) startTime = now;
      const p = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toString();
      if (p < 1) requestAnimationFrame(tick);
      else setFinal(el);
    };
    requestAnimationFrame(tick);
  };

  if (statValues.length) {
    const statsWrap = document.querySelector(".hero-stats");
    if (reducedMotion || !("IntersectionObserver" in window) || !statsWrap) {
      statValues.forEach(setFinal);
    } else {
      const so = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              statValues.forEach(animateCount);
              obs.disconnect();
            }
          });
        },
        { threshold: 0.4 }
      );
      so.observe(statsWrap);
      // Safety net: never leave counters stuck at 0
      window.addEventListener(
        "load",
        () => setTimeout(() => statValues.forEach((el) => {
          if (el.textContent === "0") setFinal(el);
        }), 1800),
        { once: true }
      );
    }
  }

  /* ---- FAQ: keep only one item open ---- */
  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (item.open) {
        faqItems.forEach((other) => { if (other !== item) other.open = false; });
      }
    });
  });

  /* ---- Scroll-spy + back-to-top (shared scroll handler) ---- */
  const spyLinks = Array.prototype.slice
    .call(nav.querySelectorAll('a[href^="#"]'))
    .filter((a) => !a.classList.contains("nav-cta"));
  const spySections = spyLinks
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);
  const toTop = document.getElementById("toTop");

  const updateScrollState = () => {
    const y = window.scrollY + 130;
    let currentId = spySections.length ? spySections[0].id : null;
    spySections.forEach((s) => { if (s.offsetTop <= y) currentId = s.id; });
    spyLinks.forEach((a) =>
      a.classList.toggle("active", a.getAttribute("href") === "#" + currentId)
    );
    if (toTop) toTop.classList.toggle("show", window.scrollY > 600);
  };

  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => { updateScrollState(); ticking = false; });
      }
    },
    { passive: true }
  );
  updateScrollState();

  if (toTop) {
    toTop.addEventListener("click", () =>
      window.scrollTo({ top: 0, behavior: "smooth" })
    );
  }
})();
