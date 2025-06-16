/**
 * MetaMask Complete Blocker
 * يحجب MetaMask تماماً ويمنع جميع أخطاءه
 */

(function () {
  "use strict";

  console.log("🚫 Starting complete MetaMask blocker...");

  // 1. Block ALL console methods from showing MetaMask errors
  const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    info: console.info,
    debug: console.debug,
  };

  function isMetaMaskRelated(args) {
    const text = args.join(" ").toLowerCase();
    return (
      text.includes("metamask") ||
      text.includes("chrometransport") ||
      text.includes("connectchrome") ||
      text.includes("chrome-extension") ||
      text.includes("nkbihfbeogaeaoehlefnkodbefgpgknn") ||
      text.includes("inpage.js") ||
      text.includes("extension not found") ||
      text.includes("wallet") ||
      text.includes("ethereum provider") ||
      text.includes("web3") ||
      text.includes("injected") ||
      text.includes("contentscript") ||
      text.includes("background") ||
      text.includes("popup") ||
      (text.includes("ethereum") && text.includes("not found")) ||
      (text.includes("error") && text.includes("ethereum")) ||
      (text.includes("error") && text.includes("wallet"))
    );
  }

  // Override all console methods
  ["log", "warn", "error", "info", "debug"].forEach((method) => {
    console[method] = function (...args) {
      if (isMetaMaskRelated(args)) {
        return; // Silently block MetaMask messages
      }
      return originalConsole[method].apply(console, args);
    };
  });

  // 2. Block window.onerror
  window.onerror = function (message, source, lineno, colno, error) {
    if (source && source.includes("chrome-extension")) {
      return true; // Suppress chrome extension errors
    }
    if (message && isMetaMaskRelated([message])) {
      return true; // Suppress MetaMask errors
    }
    return false;
  };

  // 3. Block unhandled promise rejections
  window.onunhandledrejection = function (event) {
    if (event.reason && isMetaMaskRelated([event.reason.toString()])) {
      event.preventDefault();
      return true;
    }
    return false;
  };

  // 4. Completely disable chrome runtime
  if (typeof chrome !== "undefined") {
    try {
      Object.defineProperty(window, "chrome", {
        get: () => ({
          runtime: {
            connect: () => null,
            sendMessage: () => null,
            onConnect: { addListener: () => {} },
            onMessage: { addListener: () => {} },
          },
        }),
        set: () => {},
        configurable: false,
      });
    } catch (e) {
      window.chrome = {
        runtime: {
          connect: () => null,
          sendMessage: () => null,
          onConnect: { addListener: () => {} },
          onMessage: { addListener: () => {} },
        },
      };
    }
  }

  // 5. Block ethereum provider completely
  try {
    Object.defineProperty(window, "ethereum", {
      get: () => undefined,
      set: () => {},
      configurable: false,
    });
  } catch (e) {
    window.ethereum = undefined;
  }

  // 6. Block web3 provider
  try {
    Object.defineProperty(window, "web3", {
      get: () => undefined,
      set: () => {},
      configurable: false,
    });
  } catch (e) {
    window.web3 = undefined;
  }

  // 7. MutationObserver to block injected scripts
  if (typeof MutationObserver !== "undefined") {
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          if (
            node.tagName === "SCRIPT" &&
            node.src &&
            node.src.includes("chrome-extension")
          ) {
            console.log("🚫 Blocked MetaMask script injection");
            node.remove();
          }
        });
      });
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  }

  // 8. Set bot mode flags
  window.METAMASK_COMPLETELY_BLOCKED = true;
  window.PUMP_FUN_BOT_PRIVATE_KEY_MODE = true;
  window.IGNORE_ALL_WALLET_PROVIDERS = true;

  console.log("✅ MetaMask completely blocked - pump.fun bot mode active");
  console.log("🎯 Bot will use private key only - no wallet extensions needed");
})();
