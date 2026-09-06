const loginBtn = document.getElementById("loginBtn");
const errorBox = document.getElementById("errorBox");
const loginBtnText = document.getElementById("loginBtnText");
const loginSpinner = document.getElementById("loginSpinner");
const toggleBtn = document.getElementById("togglePass");
const passInput = document.getElementById("password");
const eyeOpen = toggleBtn.querySelector(".eye-open");
const eyeClosed = toggleBtn.querySelector(".eye-closed");

const LOGIN_RATE_LIMIT_KEY = "egid_admin_login_rate_v1";
const LOGIN_FAILURE_THRESHOLD = 5;
const LOGIN_BASE_COOLDOWN_MS = 30_000;
const LOGIN_MAX_COOLDOWN_MS = 10 * 60_000;

redirectIfLoggedIn();

toggleBtn.addEventListener("click", () => {
    const show = passInput.type === "password";
    passInput.type = show ? "text" : "password";
    eyeOpen.style.display = show ? "none" : "block";
    eyeClosed.style.display = show ? "block" : "none";
    toggleBtn.setAttribute("aria-label", show ? "Sembunyikan password" : "Tampilkan password");
});

function setLoginBusy(isBusy) {
    loginBtn.disabled = isBusy;
    loginBtnText.textContent = isBusy ? "Signing in..." : "Login";
    loginSpinner.style.display = isBusy ? "inline-block" : "none";
}

function readLoginRateLimit() {
    try {
        const saved = JSON.parse(localStorage.getItem(LOGIN_RATE_LIMIT_KEY));
        if (!saved || typeof saved !== "object") {
            return { failures: 0, lockedUntil: 0 };
        }

        return {
            failures: Number.isFinite(saved.failures) ? Math.max(0, saved.failures) : 0,
            lockedUntil: Number.isFinite(saved.lockedUntil) ? Math.max(0, saved.lockedUntil) : 0
        };
    } catch {
        return { failures: 0, lockedUntil: 0 };
    }
}

function writeLoginRateLimit(state) {
    try {
        localStorage.setItem(LOGIN_RATE_LIMIT_KEY, JSON.stringify(state));
    } catch {
        // localStorage can be unavailable in private/restricted WebViews.
        // Firebase Auth remains the real server-side protection.
    }
}

function clearLoginRateLimit() {
    try {
        localStorage.removeItem(LOGIN_RATE_LIMIT_KEY);
    } catch {
        // Ignore storage failures; successful authentication can continue.
    }
}

function getRemainingCooldown() {
    const state = readLoginRateLimit();
    return Math.max(0, state.lockedUntil - Date.now());
}

function formatCooldown(milliseconds) {
    const seconds = Math.max(1, Math.ceil(milliseconds / 1000));
    if (seconds < 60) return `${seconds} detik`;

    const minutes = Math.ceil(seconds / 60);
    return `${minutes} menit`;
}

function recordLoginFailure() {
    const state = readLoginRateLimit();
    const failures = state.failures + 1;

    if (failures < LOGIN_FAILURE_THRESHOLD) {
        writeLoginRateLimit({ failures, lockedUntil: 0 });
        return;
    }

    const exponent = failures - LOGIN_FAILURE_THRESHOLD;
    const cooldown = Math.min(
        LOGIN_MAX_COOLDOWN_MS,
        LOGIN_BASE_COOLDOWN_MS * (2 ** exponent)
    );

    writeLoginRateLimit({
        failures,
        lockedUntil: Date.now() + cooldown
    });
}

function showCooldownError() {
    const remaining = getRemainingCooldown();
    if (remaining > 0) {
        errorBox.textContent = `Terlalu banyak percobaan login. Coba lagi dalam ${formatCooldown(remaining)}.`;
        return true;
    }

    return false;
}

loginBtn.addEventListener("click", async () => {
    const identifier = document.getElementById("email").value.trim();
    const password = passInput.value;
    const account = findAdminByLogin(identifier);

    errorBox.textContent = "";

    if (showCooldownError()) return;

    if (!account) {
        // Do not call Firebase for identifiers outside the ADMINS allowlist.
        errorBox.textContent = "Akun tidak terdaftar sebagai admin.";
        return;
    }

    if (!password) {
        errorBox.textContent = "Password wajib diisi.";
        return;
    }

    setLoginBusy(true);

    try {
        const remember = document.getElementById("rememberMe").checked;
        const persistence = remember
            ? firebase.auth.Auth.Persistence.LOCAL
            : firebase.auth.Auth.Persistence.SESSION;

        await auth.setPersistence(persistence);
        const credential = await auth.signInWithEmailAndPassword(account.email, password);

        if (!isAdminUser(credential.user)) {
            await auth.signOut();
            throw new Error("AUTH_ACCOUNT_NOT_ALLOWED");
        }

        clearLoginRateLimit();
        window.location.replace("index.html");
    } catch (err) {
        console.error(err);
        recordLoginFailure();

        errorBox.textContent = err.message === "AUTH_ACCOUNT_NOT_ALLOWED"
            ? "Akun berhasil login, tetapi tidak memiliki akses admin."
            : err.code === "auth/too-many-requests"
                ? "Firebase membatasi percobaan login sementara. Coba lagi nanti."
                : "Password salah atau akun Firebase tidak dapat digunakan.";

        setLoginBusy(false);
    }
});
