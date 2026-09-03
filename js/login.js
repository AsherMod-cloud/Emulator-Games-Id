const loginBtn = document.getElementById("loginBtn");
const errorBox = document.getElementById("errorBox");
const loginBtnText = document.getElementById("loginBtnText");
const loginSpinner = document.getElementById("loginSpinner");
const toggleBtn = document.getElementById("togglePass");
const passInput = document.getElementById("password");
const eyeOpen = toggleBtn.querySelector(".eye-open");
const eyeClosed = toggleBtn.querySelector(".eye-closed");

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

loginBtn.addEventListener("click", async () => {
    const identifier = document.getElementById("email").value.trim();
    const password = passInput.value;
    const account = findAdminByLogin(identifier);

    errorBox.textContent = "";

    if (!account) {
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

        const adminProfile = getAdminProfile(credential.user);

        if (!adminProfile) {
             await auth.signOut();
             throw new Error("AUTH_ACCOUNT_NOT_ALLOWED");
        }

        window.location.replace("index.html");

    } catch (err) {
        console.error(err);
        errorBox.textContent = err.message === "AUTH_ACCOUNT_NOT_ALLOWED"
            ? "Akun berhasil login, tetapi tidak memiliki akses admin."
            : "Password salah atau akun Firebase tidak dapat digunakan.";
        setLoginBusy(false);
    }
});
