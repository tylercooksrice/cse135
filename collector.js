// collector.js

(function() {
    const endpoint = "https://akhils.site/json/analytics";
    let sessionId = Date.now() + "-" + Math.random().toString(36).substr(2, 9);
    let eventBuffer = [];
  
    // ---------- Utility: Save + Send ----------
    function saveEvent(type, data) {
      const payload = {
        sessionId,
        type,
        data,
        timestamp: Date.now(),
        page: window.location.href
      };
      eventBuffer.push(payload);
      trySend();
    }
  
    function trySend() {
      if (navigator.sendBeacon) {
        while (eventBuffer.length > 0) {
          const item = eventBuffer.shift();
          navigator.sendBeacon(endpoint, JSON.stringify(item));
        }
      } else {
        // fallback fetch
        while (eventBuffer.length > 0) {
          const item = eventBuffer.shift();
          fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item)
          }).catch(err => {
            // put back if failed
            eventBuffer.unshift(item);
          });
        }
      }
    }
  
    // ---------- 1. Static Data ----------
    function collectStaticData() {
      const staticData = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        cookiesEnabled: navigator.cookieEnabled,
        javascriptEnabled: true, // if this runs, JS is enabled
        imagesEnabled: document.images.length > 0,
        cssEnabled: (function() {
          const test = document.createElement("div");
          test.style.display = "none";
          return test.style.display === "none";
        })(),
        screen: { width: screen.width, height: screen.height },
        window: { width: window.innerWidth, height: window.innerHeight },
        connection: navigator.connection ? navigator.connection.effectiveType : "unknown"
      };
      saveEvent("static", staticData);
    }
  
    // ---------- 2. Performance Data ----------
    function collectPerformanceData() {
      const timing = performance.timing;
      const perfData = {
        timing,
        start: timing.navigationStart,
        end: timing.loadEventEnd,
        totalLoadTime: timing.loadEventEnd - timing.navigationStart
      };
      saveEvent("performance", perfData);
    }
  
    // ---------- 3. Activity Data ----------
    // Errors
    window.onerror = function(msg, url, line, col, error) {
      saveEvent("error", { msg, url, line, col, error: error?.stack });
    };
  
    // Mouse
    document.addEventListener("mousemove", e => {
      saveEvent("mousemove", { x: e.clientX, y: e.clientY });
    });
    document.addEventListener("click", e => {
      saveEvent("click", { x: e.clientX, y: e.clientY, button: e.button });
    });
    document.addEventListener("scroll", e => {
      saveEvent("scroll", { x: window.scrollX, y: window.scrollY });
    });
  
    // Keyboard
    document.addEventListener("keydown", e => {
      saveEvent("keydown", { key: e.key, code: e.code });
    });
    document.addEventListener("keyup", e => {
      saveEvent("keyup", { key: e.key, code: e.code });
    });
  
    // Idle time
    let idleStart = null;
    function resetIdle() {
      if (idleStart) {
        const duration = Date.now() - idleStart;
        saveEvent("idleEnd", { duration });
        idleStart = null;
      }
      clearTimeout(window.idleTimer);
      window.idleTimer = setTimeout(() => {
        idleStart = Date.now();
        saveEvent("idleStart", {});
      }, 2000);
    }
    ["mousemove", "keydown", "scroll", "click"].forEach(ev =>
      document.addEventListener(ev, resetIdle)
    );
  
    // Page enter + leave
    saveEvent("pageEnter", {});
    window.addEventListener("beforeunload", () => {
      saveEvent("pageLeave", {});
    });
  
    // ---------- Run after load ----------
    window.addEventListener("load", () => {
      collectStaticData();
      collectPerformanceData();
    });
  })();
  