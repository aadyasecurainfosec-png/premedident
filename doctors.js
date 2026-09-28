/* ==========================================================
   MediDent Clinic — Doctors directory
   Doctors are stored in localStorage so the Admin can add /
   remove doctors from the Admin tab without touching code.
   Seeded once with the clinic's two original doctors so nothing
   breaks for people already using the app.
   ========================================================== */

const DOCTORS_KEY = "medident_doctors_v1";

const DEFAULT_DOCTORS = [
  {
    id: "soham",
    name: "Dr. Soham K. Gholba",
    credentials: "MBBS, MD (Human Physiology)",
    reg: "MMC No. 2022/03/0567",
    contact: "9307256747",
    noVitals: false
  },
  {
    id: "saylee",
    name: "Dr. Saylee Deshmukh",
    credentials: "BDS, MDS (Pediatric Dentistry)",
    reg: "Regd. No. A-41873",
    contact: "9307256747",
    noVitals: true
  }
];

function getDoctors() {
  try {
    const raw = localStorage.getItem(DOCTORS_KEY);
    if (!raw) {
      localStorage.setItem(DOCTORS_KEY, JSON.stringify(DEFAULT_DOCTORS));
      return DEFAULT_DOCTORS.slice();
    }
    const list = JSON.parse(raw);
    return (Array.isArray(list) && list.length) ? list : DEFAULT_DOCTORS.slice();
  } catch (e) {
    return DEFAULT_DOCTORS.slice();
  }
}

function saveDoctors(list) {
  try {
    localStorage.setItem(DOCTORS_KEY, JSON.stringify(list));
    return true;
  } catch (e) {
    console.error("Failed to save doctors", e);
    return false;
  }
}

function getDoctorById(id) {
  return getDoctors().find(d => d.id === id);
}

function doctorIdExists(id) {
  return getDoctors().some(d => d.id === id);
}

// Turns a doctor's name into a short, unique id used to link their
// profile to their login account (e.g. "Dr. Rahul Patil" -> "rahulpatil").
function slugifyDoctorId(name) {
  let base = (name || "doctor")
    .toLowerCase()
    .replace(/^dr\.?\s*/i, "")
    .replace(/[^a-z0-9]+/g, "");
  if (!base) base = "doctor";
  let id = base;
  let n = 1;
  while (doctorIdExists(id)) {
    n += 1;
    id = base + n;
  }
  return id;
}

function addDoctor(doc) {
  const list = getDoctors();
  list.push(doc);
  saveDoctors(list);
  return doc;
}

function updateDoctor(id, patch) {
  const list = getDoctors();
  const idx = list.findIndex(d => d.id === id);
  if (idx < 0) return false;
  list[idx] = Object.assign({}, list[idx], patch);
  saveDoctors(list);
  return true;
}

function deleteDoctorProfile(id) {
  const list = getDoctors().filter(d => d.id !== id);
  saveDoctors(list);
}
