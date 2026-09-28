/* ==========================================================
   MediDent Clinic — Login (local accounts + optional Google)
   Admin plus any number of doctor accounts added from the
   Admin tab (see admin.js "Manage doctors").

   NOTE ON "SIGN IN WITH GOOGLE":
   Real Google sign-in needs (a) a Google Cloud OAuth Client ID
   and (b) the app hosted at a real https:// address — it will
   not work when the page is opened locally by double-clicking
   index.html. Once both of those are set up, paste the Client
   ID into Admin → "Sign-in settings" and a Google button will
   appear on the login screen automatically. A doctor's Google
   account has to be linked to their profile first (also done
   from Admin → Manage doctors) before that account can be used
   to sign in — unknown Google accounts are rejected.
   ========================================================== */

const USERS_KEY = "medident_users_v1";
const SESSION_KEY = "medident_session_v1";
const GOOGLE_CLIENT_ID_KEY = "medident_google_client_id_v1";

const DEFAULT_USERS = [
  { username: "admin", password: "admin123", role: "admin", name: "Admin", doctorId: null, googleEmail: null },
  { username: "soham", password: "soham123", role: "doctor", name: "Dr. Soham K. Gholba", doctorId: "soham", googleEmail: null },
  { username: "saylee", password: "saylee123", role: "doctor", name: "Dr. Saylee Deshmukh", doctorId: "saylee", googleEmail: null }
];

function getUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) {
      localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS.slice();
    }
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_USERS.slice();
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function changePassword(username, newPassword) {
  const users = getUsers();
  const u = users.find(u => u.username === username);
  if (!u) return false;
  u.password = newPassword;
  saveUsers(users);
  return true;
}

function attemptLogin(username, password) {
  const users = getUsers();
  const u = users.find(
    u => u.username.toLowerCase() === (username || "").trim().toLowerCase() && u.password === password
  );
  if (!u) return null;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ username: u.username, role: u.role, name: u.name, doctorId: u.doctorId }));
  return u;
}

function getCurrentUser() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function logout() {
  sessionStorage.removeItem(SESSION_KEY);
  window.location.reload();
}

function isAdmin() {
  const u = getCurrentUser();
  return !!u && u.role === "admin";
}

/* ---------------- Admin: manage doctor accounts ---------------- */
/* (doctor *profiles* — name/credentials/reg no — live in doctors.js;
   this section links each profile to a username/password login,
   and optionally a Google account.) */

function addDoctorAccount(opts) {
  const name = (opts.name || "").trim();
  const username = (opts.username || "").trim();
  const password = opts.password || "";
  const credentials = (opts.credentials || "").trim();
  const reg = (opts.reg || "").trim();
  const contact = (opts.contact || "").trim();
  const googleEmail = (opts.googleEmail || "").trim().toLowerCase();
  const noVitals = !!opts.noVitals;

  if (!name) return { ok: false, error: "Doctor name is required." };
  if (!username) return { ok: false, error: "Login username is required." };
  if (!password || password.length < 4) return { ok: false, error: "Password should be at least 4 characters." };

  const users = getUsers();
  if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
    return { ok: false, error: "That username is already taken." };
  }
  if (googleEmail && users.some(u => (u.googleEmail || "").toLowerCase() === googleEmail)) {
    return { ok: false, error: "That Google account is already linked to another login." };
  }

  const id = slugifyDoctorId(name);
  addDoctor({ id, name, credentials, reg, contact, noVitals });

  users.push({
    username,
    password,
    role: "doctor",
    name,
    doctorId: id,
    googleEmail: googleEmail || null
  });
  saveUsers(users);

  return { ok: true, doctorId: id, username };
}

function deleteDoctorAccount(doctorId) {
  const users = getUsers().filter(u => u.doctorId !== doctorId);
  saveUsers(users);
  deleteDoctorProfile(doctorId);
}

function getUserByDoctorId(doctorId) {
  return getUsers().find(u => u.doctorId === doctorId);
}

function setDoctorGoogleEmail(doctorId, email) {
  const users = getUsers();
  const u = users.find(u => u.doctorId === doctorId);
  if (!u) return { ok: false, error: "Login account not found for this doctor." };
  const clean = (email || "").trim().toLowerCase();
  if (clean && users.some(other => other !== u && (other.googleEmail || "").toLowerCase() === clean)) {
    return { ok: false, error: "That Google account is already linked to another login." };
  }
  u.googleEmail = clean || null;
  saveUsers(users);
  return { ok: true };
}

/* ---------------- Google Sign-In (optional) ---------------- */

function getGoogleClientId() {
  return localStorage.getItem(GOOGLE_CLIENT_ID_KEY) || "";
}

function setGoogleClientId(id) {
  localStorage.setItem(GOOGLE_CLIENT_ID_KEY, (id || "").trim());
}

function loadGoogleScript(cb) {
  if (window.google && window.google.accounts && window.google.accounts.id) {
    cb();
    return;
  }
  const existing = document.getElementById("gsiScript");
  if (existing) {
    existing.addEventListener("load", cb);
    return;
  }
  const s = document.createElement("script");
  s.src = "https://accounts.google.com/gsi/client";
  s.id = "gsiScript";
  s.async = true;
  s.defer = true;
  s.onload = cb;
  s.onerror = () => {
    console.warn("Could not load Google Sign-In (offline, blocked, or no internet access).");
  };
  document.head.appendChild(s);
}

function decodeJwtPayload(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

function handleGoogleCredentialResponse(response) {
  const errorEl = document.getElementById("loginError");
  const payload = response && response.credential ? decodeJwtPayload(response.credential) : null;

  if (!payload || !payload.email) {
    if (errorEl) {
      errorEl.textContent = "Could not read your Google account. Please try again.";
      errorEl.style.display = "block";
    }
    return;
  }

  const email = payload.email.toLowerCase();
  const users = getUsers();
  const u = users.find(u => (u.googleEmail || "").toLowerCase() === email);

  if (!u) {
    if (errorEl) {
      errorEl.textContent = `No MediDent account is linked to ${payload.email}. Ask Admin to link it under Manage doctors.`;
      errorEl.style.display = "block";
    }
    return;
  }

  if (errorEl) errorEl.style.display = "none";
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ username: u.username, role: u.role, name: u.name, doctorId: u.doctorId }));
  onLoginSuccess(u);
}

function initGoogleSignIn() {
  const clientId = getGoogleClientId();
  const container = document.getElementById("googleSignInContainer");
  const divider = document.getElementById("googleSignInDivider");

  if (!clientId) {
    if (container) container.style.display = "none";
    if (divider) divider.style.display = "none";
    return;
  }

  loadGoogleScript(() => {
    try {
      google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCredentialResponse
      });
      if (container) {
        container.style.display = "flex";
        container.innerHTML = "";
        google.accounts.id.renderButton(container, { theme: "outline", size: "large", width: 268, text: "signin_with" });
      }
      if (divider) divider.style.display = "";
    } catch (e) {
      console.error("Google Sign-In init failed", e);
    }
  });
}

/* ---------------- login screen wiring ---------------- */

function showLoginScreen() {
  document.getElementById("loginOverlay").classList.add("show");
  document.getElementById("appRoot").classList.add("blurred");
}

function hideLoginScreen() {
  document.getElementById("loginOverlay").classList.remove("show");
  document.getElementById("appRoot").classList.remove("blurred");
}

function wireLoginForm() {
  const form = document.getElementById("loginForm");
  const errorEl = document.getElementById("loginError");
  const usernameEl = document.getElementById("loginUsername");
  const passwordEl = document.getElementById("loginPassword");
  const rememberEl = document.getElementById("loginRemember");
  const toggleBtn = document.getElementById("loginPwToggle");

  // Logo (shared data URI defined in app.js, loaded before this file).
  const logoEl = document.getElementById("loginLogo");
  if (logoEl && typeof LOGO_DATA_URI !== "undefined") {
    logoEl.src = LOGO_DATA_URI;
  }

  // Remembered username (never the password).
  const REMEMBER_KEY = "medident_remembered_username";
  const remembered = localStorage.getItem(REMEMBER_KEY);
  if (remembered) {
    usernameEl.value = remembered;
    rememberEl.checked = true;
    passwordEl.focus();
  } else {
    usernameEl.focus();
  }

  toggleBtn.addEventListener("click", () => {
    const show = passwordEl.type === "password";
    passwordEl.type = show ? "text" : "password";
    toggleBtn.textContent = show ? "Hide" : "Show";
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = usernameEl.value;
    const password = passwordEl.value;
    const user = attemptLogin(username, password);
    if (!user) {
      errorEl.textContent = "Incorrect username or password.";
      errorEl.style.display = "block";
      passwordEl.value = "";
      passwordEl.focus();
      return;
    }
    errorEl.style.display = "none";
    if (rememberEl.checked) {
      localStorage.setItem(REMEMBER_KEY, user.username);
    } else {
      localStorage.removeItem(REMEMBER_KEY);
    }
    onLoginSuccess(user);
  });

  initGoogleSignIn();
}

function onLoginSuccess(user) {
  hideLoginScreen();
  document.getElementById("currentUserLabel").textContent = `${user.name} (${user.role === "admin" ? "Admin" : "Doctor"})`;
  document.getElementById("adminTabBtn").style.display = user.role === "admin" ? "" : "none";
  if (user.role === "doctor" && user.doctorId && typeof selectedDoctorId !== "undefined") {
    selectedDoctorId = user.doctorId;
  }
  if (typeof renderDoctorSelect === "function") renderDoctorSelect();
  if (typeof resetForm === "function") resetForm();
}

function initAuth() {
  wireLoginForm();
  document.getElementById("logoutBtn").addEventListener("click", () => {
    if (confirm("Log out?")) logout();
  });
  const user = getCurrentUser();
  if (user) {
    onLoginSuccess(user);
  } else {
    showLoginScreen();
  }
}

document.addEventListener("DOMContentLoaded", initAuth);
