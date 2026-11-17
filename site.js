function isPlainClick(event) {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

(() => {
  const viewer = document.querySelector("#viewer");
  const image = document.querySelector("#viewer-image");

  if (typeof viewer.showModal !== "function") return;

  let active = null;
  for (const link of document.querySelectorAll("[data-scan]")) {
    link.addEventListener("click", (event) => {
      if (!isPlainClick(event)) return;
      event.preventDefault();

      const thumb = link.querySelector("img");
      active = link;
      image.alt = thumb.alt;
      image.src = thumb.currentSrc || thumb.src;
      viewer.showModal();

      const full = new Image();
      full.onload = () => {
        if (active === link && viewer.open) image.src = full.src;
      };
      full.src = link.href;
    });
  }

  viewer.addEventListener("click", () => viewer.close());
  viewer.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      viewer.close();
    }
  });
  viewer.addEventListener("close", () => {
    const link = active;
    active = null;
    image.removeAttribute("src");
    link?.focus({ preventScroll: true });
  });
})();

(() => {
  const viewer = document.querySelector("#pdf-viewer");
  const frame = document.querySelector("#pdf-frame");
  const title = document.querySelector("#pdf-title");
  if (typeof viewer.showModal !== "function" || navigator.pdfViewerEnabled === false) return;

  let active = null;
  for (const link of document.querySelectorAll("[data-pdf-title]")) {
    link.addEventListener("click", (event) => {
      if (!isPlainClick(event)) return;
      event.preventDefault();
      active = link;
      title.textContent = link.dataset.pdfTitle;
      frame.title = title.textContent;
      frame.src = link.href + "#view=FitH&toolbar=0&navpanes=0";
      viewer.showModal();
    });
  }

  viewer.addEventListener("click", (event) => {
    if (event.target === viewer) viewer.close();
  });
  viewer.addEventListener("close", () => {
    frame.removeAttribute("src");
    active?.focus({ preventScroll: true });
    active = null;
  });
})();

(() => {
  const header = document.querySelector(".masthead");
  const sections = Array.from(header.querySelectorAll("nav a"), (link) => ({
    link,
    section: document.getElementById(link.hash.slice(1)),
  }));
  let current = null;
  let scheduled = false;

  function updateCurrentLink() {
    const anchorLine = header.offsetHeight + 34;
    let next = sections[0].link;
    for (const { link, section } of sections) {
      if (section.getBoundingClientRect().top <= anchorLine) next = link;
    }
    const { clientHeight, scrollHeight } = document.documentElement;
    if (window.scrollY > 0 && window.scrollY + clientHeight >= scrollHeight - 2) {
      next = sections[sections.length - 1].link;
    }
    if (next !== current) {
      current?.removeAttribute("aria-current");
      next?.setAttribute("aria-current", "location");
      current = next;
    }
    scheduled = false;
  }

  function scheduleUpdate() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(updateCurrentLink);
  }

  function updateHeaderHeight() {
    document.documentElement.style.setProperty("--nav-height", header.offsetHeight + "px");
    scheduleUpdate();
  }

  window.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("resize", updateHeaderHeight);
  window.addEventListener("load", updateHeaderHeight);
  updateHeaderHeight();
})();
