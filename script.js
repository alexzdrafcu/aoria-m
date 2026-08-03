(function () {
  "use strict";

  const body = document.body;
  const menuButton = document.querySelector("[data-menu-toggle]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");
  const languageButtons = document.querySelectorAll("[data-language-toggle]");
  const toast = document.querySelector("[data-mock-toast]");
  const menuBackground = document.querySelectorAll(
    "main, .site-footer, .skip-link, .site-wordmark, .desktop-nav, .site-actions > .button, .language-wrap"
  );
  let toastTimer;

  function setMenu(open, restoreFocus) {
    if (!menuButton || !mobileMenu) return;
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    mobileMenu.dataset.open = String(open);
    mobileMenu.setAttribute("aria-hidden", String(!open));
    body.classList.toggle("menu-open", open);
    menuBackground.forEach(function (node) {
      node.inert = open;
    });
    if (open) {
      const firstLink = mobileMenu.querySelector("a");
      firstLink?.focus();
    } else if (restoreFocus !== false && document.activeElement && mobileMenu.contains(document.activeElement)) {
      menuButton.focus();
    }
  }

  menuButton?.addEventListener("click", function () {
    setMenu(menuButton.getAttribute("aria-expanded") !== "true");
  });

  mobileMenu?.addEventListener("click", function (event) {
    if (event.target.closest("a")) setMenu(false);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Tab" && menuButton?.getAttribute("aria-expanded") === "true" && mobileMenu) {
      const focusable = [menuButton, ...mobileMenu.querySelectorAll("a, button")];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    if (event.key === "Escape") {
      setMenu(false);
      languageButtons.forEach((button) => setLanguage(button, false));
    }
  });

  window.addEventListener("resize", function () {
    if (window.matchMedia("(min-width: 62rem)").matches) setMenu(false, false);
  });

  function setLanguage(button, open) {
    const noteId = button.getAttribute("aria-controls");
    const note = noteId ? document.getElementById(noteId) : null;
    if (!note) return;
    button.setAttribute("aria-expanded", String(open));
    note.hidden = !open;
  }

  languageButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const next = button.getAttribute("aria-expanded") !== "true";
      languageButtons.forEach((other) => setLanguage(other, false));
      setLanguage(button, next);
    });
  });

  document.addEventListener("click", function (event) {
    languageButtons.forEach(function (button) {
      const noteId = button.getAttribute("aria-controls");
      const note = noteId ? document.getElementById(noteId) : null;
      if (!note || note.hidden) return;
      if (!button.contains(event.target) && !note.contains(event.target)) {
        setLanguage(button, false);
      }
    });
  });

  function showToast(message) {
    if (!toast) return;
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.hidden = false;
    toastTimer = window.setTimeout(function () {
      toast.hidden = true;
    }, 4200);
  }

  document.querySelectorAll("[data-mock-link]").forEach(function (link) {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      showToast(link.dataset.mockMessage || "This destination is represented visually in the static mockup.");
    });
  });

  document.querySelectorAll("[data-mock-form]").forEach(function (form) {
    const status = form.querySelector("[data-form-status]");
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        if (status) {
          status.textContent = "Please complete the required fields before continuing.";
          status.style.color = "var(--error)";
        }
        return;
      }
      if (status) {
        status.textContent = "Thank you. This static mockup has completed the form interaction; no information was sent or stored.";
        status.style.color = "var(--success)";
        status.focus();
      }
    });
  });

  document.querySelectorAll("[data-start-date]").forEach(function (startInput) {
    const form = startInput.closest("form");
    const endInput = form?.querySelector("[data-end-date]");
    startInput.addEventListener("change", function () {
      if (!endInput) return;
      endInput.min = startInput.value;
      if (endInput.value && endInput.value < startInput.value) endInput.value = "";
    });
  });

  document.querySelectorAll("[data-year]").forEach(function (node) {
    node.textContent = new Date().getFullYear();
  });

  const revealNodes = document.querySelectorAll("[data-reveal]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealNodes.forEach((node) => node.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8%", threshold: 0.08 }
    );
    revealNodes.forEach((node) => observer.observe(node));
  }
})();
