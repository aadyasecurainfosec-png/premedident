/* ==========================================================
   MediDent Clinic — Admin panel
   Lets the Admin account:
   - add/remove doctors (each gets their own login)
   - add/remove medicines (name + composition)
   - add/remove tests (for the Tests-prescribed autocomplete)
   - change any account's password
   - configure Google Sign-In and email-sending (EmailJS)
   ========================================================== */

/* ---------------- medicines ---------------- */

function renderCustomMedList() {
  const wrap = document.getElementById("customMedList");
  if (!wrap) return;
  const meds = getCustomMeds();
  if (!meds.length) {
    wrap.innerHTML = `<p class="sub" style="margin:8px 0 0;">No medicines added yet. Use the form above to add one.</p>`;
    return;
  }
  wrap.innerHTML = `
    <table class="med-table" style="margin-top:10px;">
      <thead>
        <tr><th>Medicine</th><th>Composition</th><th>Category</th><th class="col-remove"></th></tr>
      </thead>
      <tbody>
        ${meds.map(m => `
          <tr data-med-name="${escapeHtml(m.name)}">
            <td>${escapeHtml(m.name)}</td>
            <td>${escapeHtml(m.comp)}</td>
            <td>${escapeHtml(m.category || "Custom")}</td>
            <td class="col-remove"><button type="button" class="remove-row-btn admin-del-med" title="Remove">&times;</button></td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
  wrap.querySelectorAll(".admin-del-med").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const name = e.target.closest("tr").dataset.medName;
      if (confirm(`Remove "${name}" from the medicine list?`)) {
        deleteCustomMedicine(name);
        renderCustomMedList();
        showToast("Medicine removed.");
      }
    });
  });
}

/* ---------------- tests ---------------- */

function renderCustomTestList() {
  const wrap = document.getElementById("customTestList");
  if (!wrap) return;
  const tests = getCustomTests();
  if (!tests.length) {
    wrap.innerHTML = `<p class="sub" style="margin:8px 0 0;">No custom tests added yet.</p>`;
    return;
  }
  wrap.innerHTML = `
    <table class="med-table" style="margin-top:10px;">
      <thead><tr><th>Test</th><th class="col-remove"></th></tr></thead>
      <tbody>
        ${tests.map(t => `
          <tr data-test-name="${escapeHtml(t)}">
            <td>${escapeHtml(t)}</td>
            <td class="col-remove"><button type="button" class="remove-row-btn admin-del-test" title="Remove">&times;</button></td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
  wrap.querySelectorAll(".admin-del-test").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const name = e.target.closest("tr").dataset.testName;
      if (confirm(`Remove "${name}" from the test list?`)) {
        deleteCustomTest(name);
        renderCustomTestList();
        showToast("Test removed.");
      }
    });
  });
}

/* ---------------- doctors ---------------- */

function renderDoctorList() {
  const wrap = document.getElementById("doctorList");
  if (!wrap) return;
  const doctors = getDoctors();
  if (!doctors.length) {
    wrap.innerHTML = `<p class="sub" style="margin:8px 0 0;">No doctors yet. Use the form above to add one.</p>`;
    return;
  }
  wrap.innerHTML = `
    <table class="med-table" style="margin-top:10px;">
      <thead>
        <tr><th>Doctor</th><th>Credentials</th><th>Login username</th><th>Google account</th><th class="col-remove"></th></tr>
      </thead>
      <tbody>
        ${doctors.map(d => {
          const acct = getUserByDoctorId(d.id);
          return `
            <tr data-doc-id="${escapeHtml(d.id)}">
              <td>${escapeHtml(d.name)}${d.noVitals ? ' <span class="sub">(no vitals panel)</span>' : ""}</td>
              <td>${escapeHtml(d.credentials || "")}</td>
              <td>${escapeHtml(acct ? acct.username : "—")}</td>
              <td>${escapeHtml((acct && acct.googleEmail) || "Not linked")}</td>
              <td class="col-remove"><button type="button" class="remove-row-btn admin-del-doc" title="Remove">&times;</button></td>
            </tr>
          `;
        }).join("")}
      </tbody>
    </table>
  `;
  wrap.querySelectorAll(".admin-del-doc").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const id = e.target.closest("tr").dataset.docId;
      const doc = getDoctorById(id);
      if (confirm(`Remove ${doc ? doc.name : "this doctor"} and their login? Their past prescriptions stay in history.`)) {
        deleteDoctorAccount(id);
        renderDoctorList();
        renderPasswordForms();
        if (typeof renderDoctorSelect === "function") renderDoctorSelect();
        showToast("Doctor removed.");
      }
    });
  });
}

/* ---------------- account passwords (dynamic, one per user) ---------------- */

function renderPasswordForms() {
  const wrap = document.getElementById("pwFormsContainer");
  if (!wrap) return;
  const users = getUsers();
  wrap.innerHTML = users.map(u => `
    <form class="admin-pw-form" data-username="${escapeHtml(u.username)}">
      <div class="field">
        <label>${escapeHtml(u.name)}'s password</label>
        <input type="password" placeholder="New password">
      </div>
      <button class="btn secondary" type="submit" style="margin-top:8px;">Update</button>
    </form>
  `).join("");

  wrap.querySelectorAll(".admin-pw-form").forEach(pwForm => {
    pwForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const username = pwForm.dataset.username;
      const input = pwForm.querySelector("input[type=password]");
      const newPw = input.value;
      if (!newPw || newPw.length < 4) {
        showToast("Password should be at least 4 characters.");
        return;
      }
      changePassword(username, newPw);
      input.value = "";
      showToast(`Password updated for ${username}.`);
    });
  });
}

/* ---------------- Google Sign-In & Email settings ---------------- */

function renderSignInAndEmailSettings() {
  const clientIdInput = document.getElementById("googleClientIdInput");
  if (clientIdInput) clientIdInput.value = getGoogleClientId();

  const emailjsSettings = getEmailJsSettings();
  const svc = document.getElementById("emailjsServiceId");
  const tpl = document.getElementById("emailjsTemplateId");
  const key = document.getElementById("emailjsPublicKey");
  const autoSend = document.getElementById("autoSendOnSaveCheckbox");
  if (svc) svc.value = emailjsSettings.serviceId || "";
  if (tpl) tpl.value = emailjsSettings.templateId || "";
  if (key) key.value = emailjsSettings.publicKey || "";
  if (autoSend) autoSend.checked = !!emailjsSettings.autoSendOnSave;
}

/* ---------------- wiring ---------------- */

function wireAdminPanel() {
  const medForm = document.getElementById("addMedicineForm");
  if (!medForm) return; // admin view not present (shouldn't happen, but be safe)

  medForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("newMedName").value.trim();
    const comp = document.getElementById("newMedComp").value.trim();
    const category = document.getElementById("newMedCategory").value.trim();
    if (!name) {
      showToast("Please enter a medicine name.");
      return;
    }
    addCustomMedicine(name, comp, category);
    medForm.reset();
    renderCustomMedList();
    showToast(`"${name}" added to the medicine list.`);
  });

  const testForm = document.getElementById("addTestForm");
  testForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("newTestName").value.trim();
    if (!name) {
      showToast("Please enter a test name.");
      return;
    }
    addCustomTest(name);
    testForm.reset();
    renderCustomTestList();
    showToast(`"${name}" added to the test list.`);
  });

  const docForm = document.getElementById("addDoctorForm");
  docForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const result = addDoctorAccount({
      name: document.getElementById("newDocName").value,
      credentials: document.getElementById("newDocCredentials").value,
      reg: document.getElementById("newDocReg").value,
      contact: document.getElementById("newDocContact").value,
      username: document.getElementById("newDocUsername").value,
      password: document.getElementById("newDocPassword").value,
      googleEmail: document.getElementById("newDocGoogleEmail").value,
      noVitals: document.getElementById("newDocNoVitals").checked
    });
    if (!result.ok) {
      showToast(result.error);
      return;
    }
    docForm.reset();
    renderDoctorList();
    renderPasswordForms();
    if (typeof renderDoctorSelect === "function") renderDoctorSelect();
    showToast(`Dr. ${document.getElementById("newDocName").value || result.username} added — they can now sign in.`);
  });

  const saveGoogleBtn = document.getElementById("saveGoogleClientIdBtn");
  if (saveGoogleBtn) {
    saveGoogleBtn.addEventListener("click", () => {
      setGoogleClientId(document.getElementById("googleClientIdInput").value);
      showToast("Google Sign-In settings saved.");
    });
  }

  const saveEmailJsBtn = document.getElementById("saveEmailJsBtn");
  if (saveEmailJsBtn) {
    saveEmailJsBtn.addEventListener("click", () => {
      saveEmailJsSettings({
        serviceId: document.getElementById("emailjsServiceId").value.trim(),
        templateId: document.getElementById("emailjsTemplateId").value.trim(),
        publicKey: document.getElementById("emailjsPublicKey").value.trim(),
        autoSendOnSave: document.getElementById("autoSendOnSaveCheckbox").checked
      });
      showToast("Email settings saved.");
    });
  }

  renderDoctorList();
  renderCustomMedList();
  renderCustomTestList();
  renderPasswordForms();
  renderSignInAndEmailSettings();
}

document.addEventListener("DOMContentLoaded", wireAdminPanel);
