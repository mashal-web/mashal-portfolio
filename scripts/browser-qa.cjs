const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const AxeBuilder = require(process.env.AXE_MODULE || "@axe-core/playwright").default;

const base = "http://127.0.0.1:8000";
const pages = ["index.html", "about.html", "projects.html", "journal.html", "contact.html"];
const viewports = [320, 360, 375, 390, 430, 768, 1024, 1280, 1440, 1920];
const failures = [];
const record = (page, width, issue) => failures.push({ page, width, issue });

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const path of pages) {
      for (const width of viewports) {
        const page = await browser.newPage({
          viewport: { width, height: 900 },
          reducedMotion: "reduce"
        });
        const consoleErrors = [];
        const pageErrors = [];
        page.on("console", msg => { if (msg.type() === "error") consoleErrors.push(msg.text()); });
        page.on("pageerror", error => pageErrors.push(error.message));

        const response = await page.goto(base + "/" + path, { waitUntil: "networkidle" });
        if (!response || response.status() >= 400) record(path, width, "HTTP response " + (response && response.status()));
        if (!(await page.locator("main h1").count())) record(path, width, "Missing main h1");
        if (path !== "index.html" && !(await page.locator(".nav-links a[aria-current=page]").count())) record(path, width, "Current page is not identified in navigation");
        if (path === "index.html" && (await page.locator(".nav-links a[aria-current=page]").count())) record(path, width, "Home page has an unexpected current navigation item");

        const dimensions = await page.evaluate(() => ({
          viewport: document.documentElement.clientWidth,
          document: document.documentElement.scrollWidth,
          body: document.body.scrollWidth,
          brokenImages: [...document.images].filter(img => !img.complete || img.naturalWidth === 0).map(img => img.src)
        }));
        if (dimensions.document > dimensions.viewport || dimensions.body > dimensions.viewport) {
          record(path, width, "Horizontal overflow: viewport=" + dimensions.viewport +
            ", document=" + dimensions.document + ", body=" + dimensions.body);
        }
        if (dimensions.brokenImages.length) record(path, width, "Broken images: " + dimensions.brokenImages.join(", "));
        for (const error of pageErrors) record(path, width, "JavaScript exception: " + error);
        for (const error of consoleErrors) record(path, width, "Console error: " + error);

        const hamburger = page.locator(".hamburger");
        if (width <= 768) {
          if (!(await hamburger.isVisible())) record(path, width, "Mobile menu button is not visible");
          else {
            await hamburger.click();
            if (await hamburger.getAttribute("aria-expanded") !== "true") record(path, width, "Menu did not set aria-expanded=true");
            if (!(await page.locator(".nav-links").evaluate(el => el.classList.contains("active")))) record(path, width, "Menu did not open");
            await page.keyboard.press("Escape");
            if (await hamburger.getAttribute("aria-expanded") !== "false") record(path, width, "Escape did not close menu");
            if (await page.locator(".nav-links").evaluate(el => el.classList.contains("active"))) record(path, width, "Menu remained open after Escape");
          }
        } else if (await hamburger.isVisible()) {
          record(path, width, "Desktop menu button unexpectedly visible");
        }

        if ([390, 1440].includes(width)) {
          const accessibility = await new AxeBuilder({ page }).analyze();
          for (const violation of accessibility.violations) {
            record(path, width, "Accessibility " + violation.id + ": " + violation.nodes.map(n => n.target.join(" ")).join(", "));
          }
        }

        if (path === "contact.html") {
          const form = page.locator("#contactForm");
          if (!(await form.count())) record(path, width, "Contact form missing");
          else {
            const valid = await form.evaluate(el => el.checkValidity());
            if (valid) record(path, width, "Empty contact form incorrectly passes required-field validation");
          }
        }

        await page.close();
      }
    }

    // Verify back-to-top behaviour on a long page at desktop and mobile widths.
    for (const width of [390, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 800 }, reducedMotion: "reduce" });
      await page.goto(base + "/index.html", { waitUntil: "networkidle" });
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(100);
      const button = page.locator("#backToTop");
      const glyph = await button.evaluate(el => getComputedStyle(el, "::before").content);
      if (!glyph || glyph === "none" || glyph === "normal") record("index.html", width, "Back-to-top button has no visible glyph");
      if (!(await button.evaluate(el => el.classList.contains("show")))) record("index.html", width, "Back-to-top did not appear after scrolling");
      await button.click();
      await page.waitForTimeout(100);
      const scrollY = await page.evaluate(() => window.scrollY);
      if (scrollY > 10) record("index.html", width, "Back-to-top did not return to top; scrollY=" + scrollY);
      await page.close();
    }

    console.log(JSON.stringify({ pages: pages.length, viewports, combinations: pages.length * viewports.length, failures }, null, 2));
    if (failures.length) process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
