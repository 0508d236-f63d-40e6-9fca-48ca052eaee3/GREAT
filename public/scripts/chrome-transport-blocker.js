/**
 * ULTRA-AGGRESSIVE ChromeTransport Error Blocker
 * Specifically targets: [ChromeTransport] connectChrome error: Error: MetaMask extension not found
 */

// Execute with maximum priority BEFORE any other code
!(function () {
  "use strict";

  // Define the EXACT error patterns we need to block
  const CHROME_TRANSPORT_PATTERNS = [
    "[ChromeTransport] connectChrome error",
    "ChromeTransport",
    "connectChrome error",
    "connectChrome",
    "MetaMask extension not found",
    "chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn",
    "scripts/inpage.js",
    ":1:16512",
    "inpage.js:1:",
    "Error: MetaMask extension not found",
    "MetaMask extension",
    "extension not found",
    "chrome-extension:",
    "nkbihfbeogaeaoehlefnkodbefgpgknn",
  ];

  // Ultra-specific detection for ChromeTransport errors
  function isChromeTransportError(message) {
    if (!message) return false;
    const msgStr = String(message);

    // Check against all patterns
    if (CHROME_TRANSPORT_PATTERNS.some((pattern) => msgStr.includes(pattern))) {
      return true;
    }

    // Additional pattern checking for complex error objects
    if (typeof message === "object" && message !== null) {
      try {
        const jsonStr = JSON.stringify(message);
        if (
          CHROME_TRANSPORT_PATTERNS.some((pattern) => jsonStr.includes(pattern))
        ) {
          return true;
        }
      } catch (e) {
        // Ignore JSON stringify errors
      }

      // Check error object properties
      if (
        message.message &&
        CHROME_TRANSPORT_PATTERNS.some((pattern) =>
          String(message.message).includes(pattern),
        )
      ) {
        return true;
      }
      if (
        message.stack &&
        CHROME_TRANSPORT_PATTERNS.some((pattern) =>
          String(message.stack).includes(pattern),
        )
      ) {
        return true;
      }
      if (
        message.filename &&
        CHROME_TRANSPORT_PATTERNS.some((pattern) =>
          String(message.filename).includes(pattern),
        )
      ) {
        return true;
      }
    }

    return false;
  }

  // Immediate console hijacking - highest priority
  const originalConsole = {
    log: console.log.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
    info: console.info.bind(console),
    debug: console.debug.bind(console),
  };

  // Override ALL console methods immediately
  console.log = function (...args) {
    if (!args.some(isChromeTransportError)) {
      originalConsole.log(...args);
    }
  };

  console.warn = function (...args) {
    if (!args.some(isChromeTransportError)) {
      originalConsole.warn(...args);
    }
  };

  console.error = function (...args) {
    if (!args.some(isChromeTransportError)) {
      originalConsole.error(...args);
    }
  };

  console.info = function (...args) {
    if (!args.some(isChromeTransportError)) {
      originalConsole.info(...args);
    }
  };

  console.debug = function (...args) {
    if (!args.some(isChromeTransportError)) {
      originalConsole.debug(...args);
    }
  };

  // Immediate error event blocking
  if (typeof window !== "undefined") {
    // Block window.onerror immediately with enhanced checking
    window.onerror = function (message, source, lineno, colno, error) {
      // Check all error components
      if (
        isChromeTransportError(message) ||
        isChromeTransportError(source) ||
        (error && isChromeTransportError(error.message)) ||
        (error && isChromeTransportError(error.stack)) ||
        (error && isChromeTransportError(error)) ||
        (source && source.includes("chrome-extension://")) ||
        (source && source.includes("nkbihfbeogaeaoehlefnkodbefgpgknn")) ||
        (source && source.includes("inpage.js"))
      ) {
        // Silent suppression - don't even log it
        return true; // Suppress the error completely
      }
      return false;
    };

    // Block unhandled promise rejections
    window.onunhandledrejection = function (event) {
      if (event.reason && isChromeTransportError(String(event.reason))) {
        event.preventDefault();
        return true;
      }
      return false;
    };

    // Add comprehensive error event listeners with enhanced blocking
    window.addEventListener(
      "error",
      function (event) {
        if (
          isChromeTransportError(event.message) ||
          (event.filename && isChromeTransportError(event.filename)) ||
          (event.error && isChromeTransportError(event.error.message)) ||
          (event.error && isChromeTransportError(event.error.stack)) ||
          (event.error && isChromeTransportError(event.error)) ||
          (event.target &&
            event.target.src &&
            isChromeTransportError(event.target.src)) ||
          (event.filename && event.filename.includes("chrome-extension://")) ||
          (event.filename &&
            event.filename.includes("nkbihfbeogaeaoehlefnkodbefgpgknn")) ||
          (event.filename && event.filename.includes("inpage.js"))
        ) {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          return false;
        }
      },
      true,
    );

    // Add additional error listener for capturing phase
    window.addEventListener(
      "error",
      function (event) {
        if (
          isChromeTransportError(event.message) ||
          (event.filename && isChromeTransportError(event.filename)) ||
          (event.error && isChromeTransportError(event.error))
        ) {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          return false;
        }
      },
      false,
    );

    // Block chrome API completely
    try {
      Object.defineProperty(window, "chrome", {
        get: () => undefined,
        set: () => {},
        configurable: false,
        enumerable: false,
      });
    } catch (e) {
      window.chrome = undefined;
    }

    // Mark as active
    window.CHROME_TRANSPORT_BLOCKED = true;
    window.METAMASK_CHROME_TRANSPORT_SUPPRESSED = true;

    // Silent success (won't show in console if our blocking works)
    originalConsole.log("🚫 ChromeTransport error blocker active");
  }

  // Also apply to document if available
  if (typeof document !== "undefined") {
    document.addEventListener(
      "error",
      function (event) {
        if (
          isChromeTransportError(event.message) ||
          (event.target &&
            event.target.src &&
            isChromeTransportError(event.target.src))
        ) {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          return false;
        }
      },
      true,
    );
  }
})();
