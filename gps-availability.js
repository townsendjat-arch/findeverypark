/* Temporary public GPS pause. Restore only after owner-approved physical-iPhone validation.
 * No URL, storage, analytics or user-controlled override. Fail closed if this file fails to load.
 */
(function () {
  window.FEP_GPS_AVAILABLE = false;
  document.querySelectorAll('[data-gps-only]').forEach(function (node) {
    node.hidden = !window.FEP_GPS_AVAILABLE;
    if ('disabled' in node) node.disabled = !window.FEP_GPS_AVAILABLE;
  });
  document.querySelectorAll('[data-gps-paused]').forEach(function (node) {
    node.hidden = window.FEP_GPS_AVAILABLE;
  });
})();
