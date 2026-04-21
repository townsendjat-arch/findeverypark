/* ── iOS Install Banner ── */
(function () {
  const STORAGE_KEY = "fep-install-dismissed";

  function isIos() {
    return /iphone|ipad|ipod/i.test(navigator.userAgent);
  }

  function isInStandaloneMode() {
    return window.navigator.standalone === true;
  }

  function wasDismissed() {
    try {
      return localStorage.getItem(STORAGE_KEY) === "1";
    } catch (e) {
      return false;
    }
  }

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch (e) {}
    const banner = document.getElementById("fep-install-banner");
    if (banner) banner.remove();
  }

  function showBanner() {
    const banner = document.createElement("div");
    banner.id = "fep-install-banner";
    banner.innerHTML = `
      <style>
        #fep-install-banner {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 9999;
          background: #0f6e56;
          color: #fff;
          padding: 14px 18px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-family: 'Outfit', system-ui, sans-serif;
          font-size: 14px;
          box-shadow: 0 -4px 16px rgba(0,0,0,0.15);
        }
        #fep-install-banner .fep-banner-icon {
          font-size: 22px;
          flex-shrink: 0;
        }
        #fep-install-banner .fep-banner-text {
          flex: 1;
          line-height: 1.4;
        }
        #fep-install-banner .fep-banner-text strong {
          display: block;
          font-weight: 600;
          margin-bottom: 2px;
        }
        #fep-install-banner .fep-banner-text span {
          opacity: 0.85;
          font-size: 12px;
        }
        #fep-install-banner .fep-banner-close {
          background: rgba(255,255,255,0.2);
          border: none;
          color: #fff;
          border-radius: 999px;
          width: 28px;
          height: 28px;
          font-size: 16px;
          cursor: pointer;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: system-ui, sans-serif;
        }
      </style>
      <div class="fep-banner-icon">🌳</div>
      <div class="fep-banner-text">
        <strong>Add to your home screen</strong>
        <span>Tap <strong>Share</strong> then <strong>Add to Home Screen</strong> for quick park lookups</span>
      </div>
      <button class="fep-banner-close" aria-label="Dismiss">&times;</button>
    `;

    banner.querySelector(".fep-banner-close").addEventListener("click", dismiss);
    document.body.appendChild(banner);
  }

  if (isIos() && !isInStandaloneMode() && !wasDismissed()) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", showBanner);
    } else {
      showBanner();
    }
  }
})();
