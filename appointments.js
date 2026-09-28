/* ==========================================================
   MediDent Clinic — Appointments (Reception → Doctor queue)

   Flow:  Booked → Arrived (reception checks patient in)
          → In consultation (doctor presses Start) → Completed
          (auto, when the doctor saves the prescription).

   Data lives in localStorage like the rest of the app, so
   Reception and Doctor must use the SAME browser/computer
   (two tabs or two logins on one PC). Sharing across different
   computers needs a shared backend/database.
   ========================================================== */

const APPTS_KEY = "medident_appointments_v1";
const RECEPTION_USER = { username: "reception", password: "reception123", role: "receptionist", name: "Reception", doctorId: null, googleEmail: null };
const SLOT_START = 9 * 60, SLOT_END = 21 * 60, SLOT_STEP = 15; // 09:00–21:00, 15-min slots
let activeApptId = null;

/* ---------- storage ---------- */
function getAppts() {
  try { return JSON.parse(localStorage.getItem(APPTS_KEY)) || []; } catch (e) { return []; }
}
function saveAppts(list) { localStorage.setItem(APPTS_KEY, JSON.stringify(list)); }
function updateAppt(id, patch) {
  const list = getAppts();
  const a = list.find(x => x.id === id);
  if (!a) return;
  Object.assign(a, patch);
  saveAppts(list);
}
function localISO(d) {
  d = d || new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function slotLabel(mins) {
  const h = Math.floor(mins / 60), m = mins % 60;
  const ap = h >= 12 ? "PM" : "AM";
  return `${String(((h + 11) % 12) + 1).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ap}`;
}
function slotList() {
  const out = [];
  for (let t = SLOT_START; t < SLOT_END; t += SLOT_STEP) out.push({ v: String(t).padStart(4, "0"), label: slotLabel(t), mins: t });
  return out;
}
const STATUS_LABEL = { booked: "Booked", arrived: "Arrived · waiting", inconsult: "In consultation", completed: "Completed", cancelled: "Cancelled", noshow: "No-show" };

/* ---------- role helpers ---------- */
function apptRole() { const u = getCurrentUser(); return u ? u.role : null; }
function esc(s) { return typeof escapeHtml === "function" ? escapeHtml(s == null ? "" : String(s)) : String(s || ""); }
function doctorName(id) { const d = getDoctors().find(x => x.id === id); return d ? d.name : id; }

function ensureReceptionUser() {
  const users = getUsers();
  if (!users.some(u => u.username === RECEPTION_USER.username)) {
    users.push(RECEPTION_USER);
    saveUsers(users);
  }
}

/* ---------- UI shell (injected so index.html only needs a tab + view) ---------- */
function buildApptView() {
  const st = document.createElement("style");
  st.textContent = `
    .ap-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px;}
    .ap-stat{background:#fff;border:1px solid var(--line);border-radius:12px;padding:12px 14px;}
    .ap-stat b{display:block;font-size:26px;line-height:1.1;}
    .ap-stat span{font-size:13px;color:var(--ink-soft);}
    .ap-table{width:100%;border-collapse:collapse;font-size:14px;}
    .ap-table th{text-align:left;font-size:12px;text-transform:uppercase;letter-spacing:.04em;color:var(--ink-soft);padding:8px;border-bottom:1px solid var(--line);}
    .ap-table td{padding:10px 8px;border-bottom:1px solid var(--line-soft);vertical-align:middle;}
    .ap-pill{display:inline-block;padding:3px 10px;border-radius:999px;font-size:12px;font-weight:700;background:#eef0ec;}
    .ap-pill.arrived{background:#fff1cc;color:#8a5a00;}
    .ap-pill.inconsult{background:#d9ecff;color:#0b4f8a;}
    .ap-pill.completed{background:#dcf3e2;color:#17692e;}
    .ap-pill.cancelled,.ap-pill.noshow{background:#f6dcdc;color:#8a1f1f;}
    .ap-actions{display:flex;gap:6px;flex-wrap:wrap;}
    .ap-actions .btn{padding:6px 12px;font-size:13px;}
    .ap-filters{display:flex;gap:12px;align-items:end;flex-wrap:wrap;margin-bottom:12px;}
    .tab-badge{background:#d33;color:#fff;border-radius:999px;font-size:11px;padding:1px 7px;margin-left:6px;}
    @media(max-width:700px){.ap-stats{grid-template-columns:1fr 1fr;}}
  `;
  document.head.appendChild(st);

  const v = document.createElement("div");
  v.className = "view";
  v.id = "view-appts";
  v.innerHTML = `
    <div class="panel" id="apBookPanel">
      <h2>Book an appointment</h2>
      <p class="sub">Fill the patient's details, choose the doctor and a free time slot. It appears instantly in that doctor's queue.</p>
      <div class="grid grid-3">
        <div class="field"><label for="apName">Patient name *</label><input type="text" id="apName"></div>
        <div class="field"><label for="apAge">Age</label><input type="number" id="apAge" min="0"></div>
        <div class="field"><label for="apGender">Gender</label>
          <select id="apGender"><option value="">Select</option><option>Male</option><option>Female</option><option>Other</option></select></div>
        <div class="field"><label for="apPhone">Phone</label><input type="tel" id="apPhone"></div>
        <div class="field"><label for="apEmail">Email</label><input type="text" inputmode="email" id="apEmail" placeholder="patient@example.com"></div>
        <div class="field"><label for="apReason">Reason / complaint</label><input type="text" id="apReason" placeholder="e.g. fever, toothache"></div>
        <div class="field"><label for="apDoctor">Doctor *</label><select id="apDoctor"></select></div>
        <div class="field"><label for="apDate">Date *</label><input type="date" id="apDate"></div>
        <div class="field"><label for="apSlot">Time slot *</label><select id="apSlot"></select></div>
      </div>
      <div class="action-row" style="margin-top:14px;">
        <button class="btn" id="apBookBtn" type="button">Book &amp; send to doctor</button>
      </div>
    </div>
    <div class="panel">
      <h2 id="apListTitle">Appointments</h2>
      <div class="ap-stats" id="apStats"></div>
      <div class="ap-filters">
        <div class="field"><label for="apFilterDate">Date</label><input type="date" id="apFilterDate"></div>
        <div class="field" id="apFilterDocWrap"><label for="apFilterDoc">Doctor</label><select id="apFilterDoc"></select></div>
      </div>
      <div style="overflow-x:auto;"><table class="ap-table"><thead><tr>
        <th>Time</th><th>Patient</th><th>Doctor</th><th>Reason</th><th>Status</th><th>Action</th>
      </tr></thead><tbody id="apBody"></tbody></table></div>
    </div>`;
  const preview = document.getElementById("view-preview");
  preview.parentNode.insertBefore(v, preview);

  const tabs = document.querySelector(".tabs");
  const b = document.createElement("button");
  b.className = "tab-btn";
  b.dataset.view = "appts";
  b.id = "apptsTabBtn";
  b.style.display = "none";
  b.innerHTML = `Appointments<span class="tab-badge" id="apBadge" style="display:none;"></span>`;
  tabs.insertBefore(b, tabs.firstChild);
  b.addEventListener("click", () => switchView("appts"));

  ["apDoctor", "apDate"].forEach(id => document.getElementById(id).addEventListener("change", renderSlots));
  document.getElementById("apBookBtn").addEventListener("click", bookAppointment);
  document.getElementById("apFilterDate").addEventListener("change", renderApptList);
  document.getElementById("apFilterDoc").addEventListener("change", renderApptList);
  document.getElementById("apBody").addEventListener("click", onApptAction);
}

/* ---------- booking ---------- */
function renderSlots() {
  const docId = document.getElementById("apDoctor").value;
  const date = document.getElementById("apDate").value;
  const sel = document.getElementById("apSlot");
  const taken = new Set(getAppts()
    .filter(a => a.doctorId === docId && a.date === date && !["cancelled", "noshow"].includes(a.status))
    .map(a => a.slot));
  const isToday = date === localISO();
  const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
  const keep = sel.value;
  sel.innerHTML = slotList().map(s => {
    const past = isToday && s.mins + SLOT_STEP <= nowMin;
    const dis = taken.has(s.v) || past;
    return `<option value="${s.v}" ${dis ? "disabled" : ""}>${s.label}${taken.has(s.v) ? " — booked" : ""}</option>`;
  }).join("");
  if (keep && !sel.querySelector(`option[value="${keep}"]`)?.disabled) sel.value = keep;
  else { const first = [...sel.options].find(o => !o.disabled); if (first) sel.value = first.value; }
}

function bookAppointment() {
  const g = id => document.getElementById(id).value.trim();
  const name = g("apName"), doctorId = g("apDoctor"), date = g("apDate"), slot = g("apSlot");
  if (!name) return showToast("Enter the patient's name.");
  if (!doctorId || !date || !slot) return showToast("Choose doctor, date and time slot.");
  const clash = getAppts().some(a => a.doctorId === doctorId && a.date === date && a.slot === slot && !["cancelled", "noshow"].includes(a.status));
  if (clash) { renderSlots(); return showToast("That slot was just taken — pick another."); }
  const list = getAppts();
  list.push({
    id: "ap_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
    name, age: g("apAge"), gender: g("apGender"), phone: g("apPhone"), email: g("apEmail"), reason: g("apReason"),
    doctorId, date, slot, status: "booked", createdAt: Date.now(), bookedBy: (getCurrentUser() || {}).name || ""
  });
  saveAppts(list);
  ["apName", "apAge", "apGender", "apPhone", "apEmail", "apReason"].forEach(id => document.getElementById(id).value = "");
  renderSlots();
  renderApptList();
  showToast(`Booked for ${name} — sent to ${doctorName(doctorId)}.`);
}

/* ---------- list / queue ---------- */
function apptActionsFor(a, role) {
  const btn = (act, label, cls) => `<button class="btn ${cls || "secondary"}" data-act="${act}" data-id="${a.id}" type="button">${label}</button>`;
  const out = [];
  if (role === "receptionist" || role === "admin") {
    if (a.status === "booked") out.push(btn("arrive", "Patient arrived", ""));
    if (["booked", "arrived"].includes(a.status)) { out.push(btn("noshow", "No-show")); out.push(btn("cancel", "Cancel")); }
  }
  if (role === "doctor") {
    if (a.status === "arrived") out.push(btn("start", "Start consultation", ""));
    if (a.status === "inconsult") { out.push(btn("resume", "Open prescription", "")); out.push(btn("done", "Mark done")); }
    if (a.status === "booked") out.push(`<span style="color:var(--ink-soft);font-size:13px;">Not arrived yet</span>`);
  }
  return out.join("") || "—";
}

function renderApptList() {
  const role = apptRole();
  const user = getCurrentUser() || {};
  const date = document.getElementById("apFilterDate").value || localISO();
  let docFilter = document.getElementById("apFilterDoc").value;
  if (role === "doctor") docFilter = user.doctorId;
  let rows = getAppts().filter(a => a.date === date && (!docFilter || docFilter === "all" || a.doctorId === docFilter));
  rows.sort((x, y) => x.slot.localeCompare(y.slot));

  const count = s => rows.filter(a => a.status === s).length;
  document.getElementById("apStats").innerHTML = `
    <div class="ap-stat"><b>${rows.filter(a => !["cancelled", "noshow"].includes(a.status)).length}</b><span>Total appointments</span></div>
    <div class="ap-stat"><b>${count("arrived")}</b><span>Waiting in clinic</span></div>
    <div class="ap-stat"><b>${count("inconsult")}</b><span>In consultation</span></div>
    <div class="ap-stat"><b>${count("completed")}</b><span>Completed</span></div>`;

  document.getElementById("apBody").innerHTML = rows.length ? rows.map(a => `
    <tr>
      <td><b>${slotLabel(parseInt(a.slot, 10))}</b></td>
      <td>${esc(a.name)}<div style="color:var(--ink-soft);font-size:12px;">${esc([a.age && a.age + "y", a.gender, a.phone].filter(Boolean).join(" · "))}</div></td>
      <td>${esc(doctorName(a.doctorId))}</td>
      <td>${esc(a.reason)}</td>
      <td><span class="ap-pill ${a.status}">${STATUS_LABEL[a.status]}</span></td>
      <td><div class="ap-actions">${apptActionsFor(a, role)}</div></td>
    </tr>`).join("") : `<tr><td colspan="6" style="color:var(--ink-soft);padding:18px 8px;">No appointments for this date.</td></tr>`;

  updateApptBadge();
}

function updateApptBadge() {
  const u = getCurrentUser();
  const badge = document.getElementById("apBadge");
  if (!badge || !u) return;
  const waiting = getAppts().filter(a => a.date === localISO() && a.status === "arrived" && (u.role !== "doctor" || a.doctorId === u.doctorId)).length;
  badge.textContent = waiting;
  badge.style.display = waiting ? "" : "none";
}

function onApptAction(e) {
  const btn = e.target.closest("button[data-act]");
  if (!btn) return;
  const id = btn.dataset.id, act = btn.dataset.act;
  const a = getAppts().find(x => x.id === id);
  if (!a) return;
  if (act === "arrive") updateAppt(id, { status: "arrived", arrivedAt: Date.now() });
  else if (act === "cancel") { if (!confirm(`Cancel ${a.name}'s appointment?`)) return; updateAppt(id, { status: "cancelled" }); }
  else if (act === "noshow") updateAppt(id, { status: "noshow" });
  else if (act === "done") updateAppt(id, { status: "completed", doneAt: Date.now() });
  else if (act === "start" || act === "resume") {
    if (act === "start") updateAppt(id, { status: "inconsult", startedAt: Date.now() });
    openPrescriptionFor(a);
    return;
  }
  renderApptList();
  if (act === "arrive") renderSlots();
}

/* Doctor pressed Start: open a fresh prescription with patient details prefilled */
function openPrescriptionFor(a) {
  switchView("new");
  if (activeApptId !== a.id) {
    resetForm();
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v || ""; };
    set("pName", a.name); set("pAge", a.age); set("pGender", a.gender); set("pPhone", a.phone); set("pEmail", a.email);
    const dx = document.getElementById("diagnosis");
    if (dx && a.reason && !dx.value) dx.value = a.reason;
  }
  activeApptId = a.id;
  showToast(`Consulting ${a.name}. Saving the prescription marks this visit completed.`);
}

/* ---------- wiring into the existing app ---------- */
function setupApptHooks() {
  // Show the Appointments view via the existing switchView
  const origSwitch = switchView;
  switchView = function (name) {
    if (name === "appts") {
      document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      document.getElementById("view-appts").classList.add("active");
      document.getElementById("apptsTabBtn").classList.add("active");
      initApptFilters();
      renderSlots();
      renderApptList();
      return;
    }
    origSwitch(name);
  };

  // Saving a prescription for an appointment completes it
  const origPersist = persistRecord;
  persistRecord = function (rec) {
    const r = origPersist(rec);
    if (activeApptId) {
      updateAppt(activeApptId, { status: "completed", doneAt: Date.now() });
      activeApptId = null;
    }
    return r;
  };

  // Role-based tabs after login
  const origLogin = onLoginSuccess;
  onLoginSuccess = function (user) {
    origLogin(user);
    const roleName = { admin: "Admin", doctor: "Doctor", receptionist: "Reception" }[user.role] || user.role;
    document.getElementById("currentUserLabel").textContent = `${user.name} (${roleName})`;
    const isRec = user.role === "receptionist";
    document.getElementById("apptsTabBtn").style.display = "";
    document.querySelector('.tab-btn[data-view="new"]').style.display = isRec ? "none" : "";
    document.querySelector('.tab-btn[data-view="history"]').style.display = isRec ? "none" : "";
    document.getElementById("apBookPanel").style.display = (isRec || user.role === "admin") ? "" : "none";
    document.getElementById("apFilterDocWrap").style.display = user.role === "doctor" ? "none" : "";
    document.getElementById("apListTitle").textContent = user.role === "doctor" ? "Today's patients" : "Appointments";
    initApptFilters(true);
    if (isRec || user.role === "doctor") switchView("appts");
    updateApptBadge();
  };
}

function initApptFilters(force) {
  const docs = getDoctors();
  const opts = docs.map(d => `<option value="${d.id}">${esc(d.name)}</option>`).join("");
  const docSel = document.getElementById("apDoctor");
  const prev = docSel.value;
  docSel.innerHTML = opts;
  if (prev) docSel.value = prev;
  const f = document.getElementById("apFilterDoc");
  const prevF = f.value;
  f.innerHTML = `<option value="all">All doctors</option>` + opts;
  if (prevF) f.value = prevF;
  const d = document.getElementById("apDate"), fd = document.getElementById("apFilterDate");
  if (force || !d.value) { d.value = localISO(); d.min = localISO(); }
  if (force || !fd.value) fd.value = localISO();
}

(function initAppointments() {
  // Runs immediately (scripts are at the end of <body>) so the hooks exist
  // before auth.js fires onLoginSuccess on DOMContentLoaded.
  ensureReceptionUser();
  buildApptView();
  setupApptHooks();
  // Live refresh: other tab/login on this computer changes data, and a light poll as backup
  window.addEventListener("storage", e => {
    if (e.key === APPTS_KEY && document.getElementById("view-appts").classList.contains("active")) { renderSlots(); renderApptList(); }
    else if (e.key === APPTS_KEY) updateApptBadge();
  });
  setInterval(() => {
    if (document.getElementById("view-appts").classList.contains("active")) renderApptList(); else updateApptBadge();
  }, 15000);
})();
