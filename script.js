(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);

  const progress = $(".scroll-progress");
  const navbar = $(".navbar");
  const backToTop = $("#backToTop");
  const navMenu = $(".nav-links");
  const hamburger = $(".hamburger");

  // One passive scroll listener updates all scroll-dependent UI in one frame.
  let scrollTicking = false;
  const updateScrollUI = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const percent = scrollable > 0 ? Math.min(100, Math.max(0, (scrollTop / scrollable) * 100)) : 0;

    if (progress) {
      progress.value = percent;
    }
    if (navbar) navbar.classList.toggle("scrolled", scrollTop > 40);
    if (backToTop) backToTop.classList.toggle("show", scrollTop > 300);

    scrollTicking = false;
  };

  window.addEventListener("scroll", () => {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(updateScrollUI);
  }, { passive: true });
  updateScrollUI();

  // Mark the current page in the primary navigation.
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a[href]").forEach((link) => {
    const target = link.getAttribute("href").split("#")[0];
    const isCurrent = target === currentPage;
    link.classList.toggle("active", isCurrent);
    if (isCurrent) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });

  // Mobile navigation: maintain button state and close on navigation/outside/Escape.
  if (hamburger && navMenu) {
    const setMenuOpen = (open) => {
      navMenu.classList.toggle("active", open);
      hamburger.classList.toggle("active", open);
      document.body.classList.toggle("menu-open", open);
      hamburger.setAttribute("aria-expanded", String(open));
    };

    hamburger.addEventListener("click", () => {
      setMenuOpen(hamburger.getAttribute("aria-expanded") !== "true");
    });
    navMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setMenuOpen(false));
    });
    document.addEventListener("pointerdown", (event) => {
      if (navMenu.classList.contains("active") &&
          !navMenu.contains(event.target) &&
          !hamburger.contains(event.target)) setMenuOpen(false);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && navMenu.classList.contains("active")) {
        setMenuOpen(false);
        hamburger.focus();
      }
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 768) setMenuOpen(false);
    }, { passive: true });
  }

  if (backToTop) {
    backToTop.addEventListener("click", () => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  const year = $("#currentYear");
  if (year) year.textContent = String(new Date().getFullYear());

  // Formspree delivery is external; report failures without losing the entered message.
  const contactForm = $("#contactForm");
  const formStatus = $("#formStatus");
  const submitButton = $("#submitBtn");

  if (contactForm && formStatus && submitButton) {
    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!contactForm.reportValidity()) return;

      submitButton.disabled = true;
      submitButton.setAttribute("aria-busy", "true");
      formStatus.textContent = "Sending message…";
      formStatus.className = "form-status";

      try {
        const response = await fetch(contactForm.action, {
          method: "POST",
          body: new FormData(contactForm),
          headers: { Accept: "application/json" }
        });
        if (!response.ok) throw new Error("Form service returned " + response.status);

        formStatus.textContent = "Message sent successfully. Thank you for getting in touch.";
        formStatus.classList.add("success");
        contactForm.reset();
      } catch (error) {
        formStatus.textContent = "The message could not be sent. Please email imashalweb@gmail.com directly.";
        formStatus.classList.add("error");
      } finally {
        submitButton.disabled = false;
        submitButton.removeAttribute("aria-busy");
      }
    });
  }
})();
