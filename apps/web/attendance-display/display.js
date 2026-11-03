// UI bridge for the local fingerprint-terminal controller.
// The controller must call showMatch only AFTER the API confirms the attendance event was saved.
(() => {
  const byId = id => document.getElementById(id);
  let resetTimer = null;
  let photoObjectUrl = null;
  function show(view) {
    ["ready-view","success-view","failure-view"].forEach(id => { byId(id).hidden = id !== view; });
    if (resetTimer) { clearTimeout(resetTimer); resetTimer = null; }
  }
  function showReady() { show("ready-view"); }
  function showMatch(student) {
    if (!student || !student.displayName || !student.lrn) throw new Error("A verified student name and LRN are required.");
    byId("result-name").textContent = student.displayName;
    byId("result-lrn").textContent = student.lrn;
    byId("result-heading").textContent = student.attendanceSaved ? "Attendance recorded" : "Identity verified";
    byId("result-note").textContent = student.attendanceSaved ? "Your attendance has been recorded." : "Your identity was verified, but attendance was not confirmed.";
    byId("result-time").textContent = student.timeLabel || "";
    const img = byId("result-photo"), fallback = byId("photo-fallback");
    img.hidden = true; img.removeAttribute("src"); fallback.hidden = false;
    if (photoObjectUrl) { URL.revokeObjectURL(photoObjectUrl); photoObjectUrl = null; }
    if (student.photoUrl && typeof student.photoUrl === "string" && student.photoUrl.startsWith("/")) {
      const headers = window.QGHS_TERMINAL_ACCESS_TOKEN ? { Authorization: "Bearer " + window.QGHS_TERMINAL_ACCESS_TOKEN } : {};
      fetch(student.photoUrl, { headers, cache: "no-store" }).then(response => {
        if (!response.ok) throw new Error("Photo unavailable");
        return response.blob();
      }).then(blob => {
        photoObjectUrl = URL.createObjectURL(blob);
        img.onload = () => { fallback.hidden = true; img.hidden = false; };
        img.src = photoObjectUrl;
      }).catch(() => { fallback.hidden = false; });
    }
    show("success-view");
    // Return to the neutral screen quickly so the next student cannot view the previous student's LRN.
    resetTimer = setTimeout(showReady, 8000);
  }
  function showFailure(reason = "unrecognized") {
    const messages = {
      sweaty: ["Finger is wet or sweaty", "Dry your finger completely, then try again. A wet finger may prevent a clear scan."],
      unrecognized: ["Fingerprint not recognized", "The scanner could not match that fingerprint. Try your registered finger once more."],
      missing: ["Fingerprint enrollment not found", "Your fingerprint may no longer be enrolled. Please ask authorized school staff to verify your identity."],
      sensor: ["Scanner needs assistance", "The fingerprint scanner is not responding. Please approach authorized school staff."]
    };
    const [title, message] = messages[reason] || messages.unrecognized;
    byId("failure-title").textContent = title;
    byId("failure-message").textContent = message;
    show("failure-view");
  }
  byId("retry-button").addEventListener("click", () => {
    showReady();
    window.dispatchEvent(new CustomEvent("qghs:fingerprint-retry"));
  });
  window.QGHSAttendanceDisplay = Object.freeze({ showReady, showMatch, showFailure });
  showReady();
})();