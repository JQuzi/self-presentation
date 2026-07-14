(function () {
  "use strict";

  /* ============================================================
     Hero name: letter hover effect
     ============================================================ */
  document.querySelectorAll("[data-letter-hover]").forEach(function (node) {
    var words = node.textContent.trim().split(/\s+/);
    node.textContent = "";
    words.forEach(function (word) {
      var wordSpan = document.createElement("span");
      wordSpan.className = "hero-name-word";
      wordSpan.setAttribute("aria-hidden", "true");
      Array.from(word).forEach(function (letter) {
        var letterSpan = document.createElement("span");
        letterSpan.className = "logo-letter";
        letterSpan.textContent = letter;
        wordSpan.appendChild(letterSpan);
      });
      node.appendChild(wordSpan);
    });
  });

  /* ============================================================
     Theme: system / light / dark
     ============================================================ */
  var THEME_KEY = "amerkurev-theme";
  var themeButtons = Array.from(document.querySelectorAll("[data-theme-option]"));
  var darkQuery = window.matchMedia("(prefers-color-scheme: dark)");

  function readThemeSetting() {
    try {
      var stored = localStorage.getItem(THEME_KEY);
      return stored === "light" || stored === "dark" ? stored : "system";
    } catch (e) {
      return "system";
    }
  }

  function applyTheme() {
    var setting = readThemeSetting();
    var resolved = setting === "system" ? (darkQuery.matches ? "dark" : "light") : setting;
    document.documentElement.setAttribute("data-theme", resolved);
    themeButtons.forEach(function (button) {
      button.setAttribute("aria-pressed", String(button.dataset.themeOption === setting));
    });
  }

  themeButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var next = button.dataset.themeOption;
      try {
        if (next === "system") {
          localStorage.removeItem(THEME_KEY);
        } else {
          localStorage.setItem(THEME_KEY, next);
        }
      } catch (e) { /* storage unavailable */ }
      applyTheme();
    });
  });

  darkQuery.addEventListener("change", function () {
    if (readThemeSetting() === "system") applyTheme();
  });

  applyTheme();

  /* ============================================================
     Settings panel + rotating gear
     ============================================================ */
  var settingsButton = document.querySelector("[data-settings-toggle]");
  var settingsPanel = document.querySelector("[data-settings-panel]");
  var gear = document.querySelector("[data-gear]");

  if (settingsButton && settingsPanel) {
    var setPanelOpen = function (open) {
      settingsButton.setAttribute("aria-expanded", String(open));
      settingsPanel.classList.toggle("site-settings-panel-open", open);
      themeButtons.forEach(function (button) {
        if (open) {
          button.removeAttribute("tabindex");
        } else {
          button.setAttribute("tabindex", "-1");
        }
      });
    };

    settingsButton.addEventListener("click", function () {
      setPanelOpen(settingsButton.getAttribute("aria-expanded") !== "true");
    });
  }

  if (gear && settingsButton) {
    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    var rotation = 0;
    var speed = 45;
    var lastTime = null;
    var frame = null;

    var isHot = function () {
      return settingsButton.matches(":hover, :focus-visible") ||
        settingsButton.getAttribute("aria-expanded") === "true";
    };

    var rotate = function (timestamp) {
      var last = lastTime === null ? timestamp : lastTime;
      var delta = Math.min((timestamp - last) / 1000, 0.05);
      lastTime = timestamp;
      var targetSpeed = isHot() ? 138 : 45;
      speed += (targetSpeed - speed) * Math.min(delta * 10, 1);
      rotation = (rotation + speed * delta) % 360;
      gear.style.transform = "rotate(" + rotation + "deg)";
      frame = window.requestAnimationFrame(rotate);
    };

    var syncMotion = function () {
      if (frame !== null) {
        window.cancelAnimationFrame(frame);
        frame = null;
      }
      lastTime = null;
      if (reducedMotion.matches) {
        gear.style.transform = "";
        return;
      }
      frame = window.requestAnimationFrame(rotate);
    };

    syncMotion();
    reducedMotion.addEventListener("change", syncMotion);
  }

  /* ============================================================
     Timeline filters
     ============================================================ */
  var filterButtons = Array.from(document.querySelectorAll("[data-filter]"));
  var timelineItems = Array.from(document.querySelectorAll(".timeline-item"));
  var activeFilter = "all";

  function refreshTimelineLayout() {
    var previousYear = null;
    var lastVisible = null;
    timelineItems.forEach(function (item) {
      var visible = activeFilter === "all" || item.dataset.kind === activeFilter;
      item.hidden = !visible;
      item.classList.remove("timeline-item-last");
      if (!visible) return;
      item.classList.toggle("timeline-item-repeat", item.dataset.year === previousYear);
      previousYear = item.dataset.year;
      lastVisible = item;
    });
    if (lastVisible) lastVisible.classList.add("timeline-item-last");
  }

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      activeFilter = button.dataset.filter;
      filterButtons.forEach(function (other) {
        other.setAttribute("aria-pressed", String(other === button));
      });
      refreshTimelineLayout();
    });
  });

  refreshTimelineLayout();

  /* ============================================================
     Timeline entries: inline details accordion + ?entry= URL
     ============================================================ */
  var expandableItems = timelineItems.filter(function (item) {
    return item.querySelector("[data-entry-trigger]");
  });

  function setEntryExpanded(item, expanded) {
    var card = item.querySelector(".timeline-entry-card");
    var trigger = item.querySelector("[data-entry-trigger]");
    var shell = item.querySelector(".timeline-entry-details-shell");
    var dot = item.querySelector(".timeline-dot");
    card.classList.toggle("timeline-entry-card-expanded", expanded);
    trigger.setAttribute("aria-expanded", String(expanded));
    shell.classList.toggle("timeline-entry-details-shell-open", expanded);
    shell.setAttribute("aria-hidden", String(!expanded));
    if (dot) dot.classList.toggle("timeline-dot-active", expanded);
  }

  function getExpandedItem() {
    return expandableItems.find(function (item) {
      return item.querySelector(".timeline-entry-card-expanded");
    }) || null;
  }

  function updateEntryParam(slug, push) {
    var url = new URL(window.location.href);
    if (slug) {
      url.searchParams.set("entry", slug);
    } else {
      url.searchParams.delete("entry");
    }
    var next = url.pathname + url.search + url.hash;
    if (push) {
      window.history.pushState({}, "", next);
    } else {
      window.history.replaceState({}, "", next);
    }
  }

  function openEntry(item) {
    var current = getExpandedItem();
    if (current === item) return;
    if (current) setEntryExpanded(current, false);
    setEntryExpanded(item, true);
    updateEntryParam(item.id, true);
  }

  function closeEntry() {
    var current = getExpandedItem();
    if (!current) return;
    setEntryExpanded(current, false);
    updateEntryParam(null, false);
  }

  expandableItems.forEach(function (item) {
    item.querySelector("[data-entry-trigger]").addEventListener("click", function () {
      openEntry(item);
    });
    var close = item.querySelector("[data-entry-close]");
    if (close) {
      close.addEventListener("click", function (event) {
        event.stopPropagation();
        closeEntry();
      });
    }
  });

  function syncFromUrl() {
    var params = new URLSearchParams(window.location.search);
    var slug = params.get("entry") || window.location.hash.replace("#", "");
    var target = expandableItems.find(function (item) { return item.id === slug; }) || null;
    var current = getExpandedItem();
    if (current && current !== target) setEntryExpanded(current, false);
    if (target && current !== target) setEntryExpanded(target, true);
  }

  window.addEventListener("popstate", syncFromUrl);
  syncFromUrl();

  /* ============================================================
     Cursor spotlight
     ============================================================ */
  if (window.matchMedia("(pointer: fine)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var spotlightFrame = 0;
    window.addEventListener("pointermove", function (event) {
      window.cancelAnimationFrame(spotlightFrame);
      spotlightFrame = window.requestAnimationFrame(function () {
        document.documentElement.style.setProperty("--spotlight-x", event.clientX + "px");
        document.documentElement.style.setProperty("--spotlight-y", event.clientY + "px");
      });
    }, { passive: true });
  }
})();
