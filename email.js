/* ==========================================================
   MediDent Clinic — Emailing a prescription to the patient
   Now generates a real PDF (rendered from the same layout you
   see in Preview) and sends/attaches it. Two modes:

   1) Default (no setup needed): downloads the PDF to the doctor's
      computer, then opens Gmail's compose window pre-filled with
      the patient's email, subject, and prescription text. The
      doctor drags/attaches the just-downloaded PDF and hits Send.
      This step can't be skipped — browsers do not allow a webpage
      to attach a file to Gmail's compose window automatically,
      for the same security reasons a webpage can't read your
      other files. This is a hard browser limitation, not a
      missing feature here.

   2) If Admin configures EmailJS (Admin → Email settings), the
      PDF is attached and the email is sent automatically — no
      click needed from the doctor, and no Gmail involved. This
      needs the EmailJS template to have a file/attachment field
      named "attachment" (EmailJS → Email Templates → your
      template → Attachments → Add Attachment → set the variable
      name to "attachment").
   ========================================================== */

const EMAILJS_SETTINGS_KEY = "medident_emailjs_settings_v1";

function getEmailJsSettings() {
  try {
    const raw = localStorage.getItem(EMAILJS_SETTINGS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveEmailJsSettings(settings) {
  localStorage.setItem(EMAILJS_SETTINGS_KEY, JSON.stringify(settings));
}

function buildPrescriptionEmailText(rec) {
  const doctor = getDoctorById(rec.doctorId) || {};
  const lines = [];
  lines.push(`${CLINIC.name} — ${CLINIC.tagline}`);
  if (doctor.name) lines.push(`${doctor.name}${doctor.credentials ? " (" + doctor.credentials + ")" : ""}`);
  lines.push("");
  lines.push(`Patient: ${rec.patient.name || ""}`);
  const ageGender = [rec.patient.age ? rec.patient.age + " yrs" : "", rec.patient.gender || ""].filter(Boolean).join(", ");
  if (ageGender) lines.push(`Age / Gender: ${ageGender}`);
  if (rec.patient.date) lines.push(`Date: ${formatDateDisplay(rec.patient.date)}`);

  if (rec.diagnosis) {
    lines.push("");
    lines.push(`Diagnosis: ${rec.diagnosis}`);
  }

  if (rec.medicines && rec.medicines.length) {
    lines.push("");
    lines.push("Medicines:");
    rec.medicines.forEach((m, i) => {
      if (!m.name) return;
      const parts = [m.dosage, m.timing, m.duration].filter(Boolean).join(" · ");
      lines.push(`${i + 1}. ${m.name}${m.comp ? " (" + m.comp + ")" : ""}${parts ? " — " + parts : ""}`);
    });
  }

  if (rec.advice) {
    lines.push("");
    lines.push(`Advice: ${rec.advice}`);
  }
  if (rec.tests) {
    lines.push("");
    lines.push(`Tests prescribed: ${rec.tests}`);
  }
  if (rec.followup) {
    lines.push("");
    lines.push(`Follow-up date: ${formatDateDisplay(rec.followup)}`);
  }

  lines.push("");
  lines.push("(A PDF of the prescription is attached.)");
  lines.push("");
  lines.push(`— ${CLINIC.name}${CLINIC.location ? ", " + CLINIC.location : ""}`);
  return lines.join("\n");
}

/* ---------------- PDF generation (from the on-screen preview) ---------------- */

function pdfFileName(rec) {
  const name = ((rec.patient && rec.patient.name) || "prescription").trim().replace(/[^a-z0-9]+/gi, "-") || "prescription";
  const date = (rec.patient && rec.patient.date) || "";
  return `Prescription-${name}${date ? "-" + date : ""}.pdf`;
}

// Renders the #rxSheet element (the same sheet you see in Preview / Print)
// into a PDF, split across pages if it's taller than one A4 page.
//
// If `rec` is passed, this makes sure #rxSheet actually contains that
// record's layout first — needed when auto-sending right after "Save"
// without ever opening Preview. A display:none element can't be measured
// by html2canvas, so in that case the Preview view is made visible but
// shifted off-screen just long enough to capture it, then put back the
// way it was — the doctor never sees it flash on screen.
async function generatePrescriptionPdfBlob(rec) {
  if (typeof html2canvas === "undefined" || !window.jspdf) {
    throw new Error("PDF libraries not loaded (no internet access?).");
  }

  let restore = null;
  if (rec) {
    renderRxSheet(rec);
    const previewView = document.getElementById("view-preview");
    if (previewView && !previewView.classList.contains("active")) {
      previewView.classList.add("force-offscreen");
      restore = () => previewView.classList.remove("force-offscreen");
    }
  }

  const element = document.getElementById("rxSheet");
  if (!element) {
    if (restore) restore();
    throw new Error("Prescription sheet not found.");
  }

  let canvas;
  try {
    canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff"
    });
  } finally {
    if (restore) restore();
  }

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  const imgData = canvas.toDataURL("image/png");

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  // Ignore a trailing sliver of overflow (sub-millimetre rounding from the
  // canvas scale/border) so a prescription that just barely exceeds one
  // page's height doesn't get a second, essentially blank, page.
  const PAGE_OVERFLOW_TOLERANCE_MM = 3;
  while (heightLeft > PAGE_OVERFLOW_TOLERANCE_MM) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  return pdf.output("blob");
}

function triggerBlobDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

async function downloadPrescriptionPdf(rec) {
  showToast("Preparing PDF…");
  try {
    const blob = await generatePrescriptionPdfBlob(rec);
    triggerBlobDownload(blob, pdfFileName(rec));
    showToast("PDF downloaded.");
  } catch (e) {
    console.error("PDF generation failed", e);
    showToast("Couldn't generate the PDF. Please try Print instead.");
  }
}

/* ---------------- sending ---------------- */

// Kept as a fallback for browsers/devices where popups to gmail.com are
// blocked, or if a doctor prefers their system email app instead of Gmail.
function openMailtoFallback(email, subject, body) {
  const url = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = url;
}

// Wraps window.open so we can tell if the browser silently blocked the
// pop-up and fall back to mailto in that case.
function openGmailComposeSafe(email, subject, body) {
  const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  return window.open(url, "_blank");
}

// Sends via the EmailJS browser SDK using a hidden form + real file input,
// so the generated PDF travels as a genuine attachment (sendForm is the
// EmailJS-documented way to include a file attachment).
async function sendViaEmailJsWithAttachment({ settings, email, subject, body, pdfBlob, patientName, doctorName, filename }) {
  if (typeof emailjs === "undefined") throw new Error("EmailJS SDK not loaded (no internet access?).");
  emailjs.init({ publicKey: settings.publicKey });

  const form = document.createElement("form");
  form.style.display = "none";

  const fields = { to_email: email, subject, patient_name: patientName, doctor_name: doctorName, message: body };
  Object.keys(fields).forEach(key => {
    const input = document.createElement("input");
    input.name = key;
    input.value = fields[key];
    form.appendChild(input);
  });

  // Field name "attachment" must match the attachment variable name
  // set up in the EmailJS template (see note at top of this file).
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.name = "attachment";
  const dt = new DataTransfer();
  dt.items.add(new File([pdfBlob], filename, { type: "application/pdf" }));
  fileInput.files = dt.files;
  form.appendChild(fileInput);

  document.body.appendChild(form);
  try {
    await emailjs.sendForm(settings.serviceId, settings.templateId, form);
  } finally {
    form.remove();
  }
}

async function sendPrescriptionEmail(rec) {
  const email = ((rec.patient && rec.patient.email) || "").trim();
  if (!email) {
    showToast("Add the patient's email address on the form first.");
    return;
  }

  const dateLabel = rec.patient && rec.patient.date ? formatDateDisplay(rec.patient.date) : "";
  const subject = `Your prescription from ${CLINIC.name}${dateLabel ? " — " + dateLabel : ""}`;
  const body = buildPrescriptionEmailText(rec);
  const settings = getEmailJsSettings();
  const filename = pdfFileName(rec);

  const btn = document.getElementById("emailBtn");
  const originalLabel = btn ? btn.textContent : null;
  const setBtn = (label, disabled) => { if (btn) { btn.textContent = label; btn.disabled = disabled; } };

  setBtn("Preparing PDF…", true);
  let pdfBlob = null;
  try {
    pdfBlob = await generatePrescriptionPdfBlob(rec);
  } catch (e) {
    console.error("PDF generation failed", e);
  }

  const canAutoSend = settings.serviceId && settings.templateId && settings.publicKey && pdfBlob;

  if (canAutoSend) {
    setBtn("Sending…", true);
    try {
      await sendViaEmailJsWithAttachment({
        settings, email, subject, body, pdfBlob, filename,
        patientName: (rec.patient && rec.patient.name) || "",
        doctorName: (getDoctorById(rec.doctorId) || {}).name || ""
      });
      showToast(`Prescription PDF emailed to ${email}.`);
    } catch (e) {
      console.error("EmailJS send failed", e);
      showToast("Couldn't send automatically — downloading the PDF and opening Gmail instead.");
      triggerBlobDownload(pdfBlob, filename);
      const win = openGmailComposeSafe(email, subject, body);
      if (!win) openMailtoFallback(email, subject, body);
    }
  } else if (pdfBlob) {
    triggerBlobDownload(pdfBlob, filename);
    const win = openGmailComposeSafe(email, subject, body);
    if (!win) {
      showToast("Pop-up blocked — opening your email app instead. Attach the PDF that just downloaded.");
      openMailtoFallback(email, subject, body);
    } else {
      showToast("PDF downloaded — attach it in the Gmail tab that just opened, then click Send.");
    }
  } else {
    showToast("Couldn't generate the PDF — opening Gmail with text only.");
    const win = openGmailComposeSafe(email, subject, body);
    if (!win) openMailtoFallback(email, subject, body);
  }

  setBtn(originalLabel, false);
}

/* ---------------- auto-send on save (optional, set in Admin) ---------------- */

// Called right after a prescription is saved. Only actually sends if the
// Admin has both configured EmailJS AND turned on the auto-send checkbox,
// and only if the patient has an email on file — otherwise does nothing,
// silently, so normal saving is unaffected.
function maybeAutoEmail(rec) {
  const settings = getEmailJsSettings();
  if (!settings.autoSendOnSave) return;
  if (!(settings.serviceId && settings.templateId && settings.publicKey)) return;
  if (!(rec && rec.patient && rec.patient.email)) return;
  sendPrescriptionEmail(rec);
}
