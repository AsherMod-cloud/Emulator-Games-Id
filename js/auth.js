// Shared authentication and authorization helpers.
// Never store passwords in this file. The UID below is an identifier only.

const ADMINS = Object.freeze({
    AsherMod: Object.freeze({
        email: "ashermod.modder@gmail.com",
        // Replace this with the Firebase Auth UID of the owner account.
        uid: "vFdWCRrJXLM9Ywf0BimjBsI8yXm1",
        role: "owner"
    })
});

function findAdminByLogin(identifier) {
    const normalized = String(identifier || "").trim().toLowerCase();
    if (!normalized) return null;

    const entry = Object.entries(ADMINS).find(([username, account]) =>
        username.toLowerCase() === normalized ||
        account.email.toLowerCase() === normalized
    );

    return entry ? { username: entry[0], ...entry[1] } : null;
}

function getAdminProfile(user) {
    if (!user || !user.uid) return null;

    const owner = ADMINS.AsherMod;
    if (!owner || !owner.uid) return null;

    const loginUid = String(user.uid).trim();
    const ownerUid = String(owner.uid).trim();

    if (loginUid !== ownerUid) return null;

    return {
        username: "AsherMod",
        email: owner.email,
        uid: ownerUid,
        role: owner.role
    };
}


function isAdminUser(user) {
    return Boolean(getAdminProfile(user));
}

function redirectToLogin() {
    window.location.replace("Login.html");
}

function requireLogin() {
    auth.onAuthStateChanged(user => {
        if (!user) redirectToLogin();
    });
}

function requireAdmin() {
    auth.onAuthStateChanged(user => {
        if (!user) {
            redirectToLogin();
            return;
        }

        if (!isAdminUser(user)) {
            auth.signOut().finally(redirectToLogin);
        }
    });
}

function redirectIfLoggedIn() {
    auth.onAuthStateChanged(user => {
        if (!user) return;

        if (isAdminUser(user)) {
            window.location.replace("index.html");
        } else {
            auth.signOut();
        }
    });
}

function onAdminStateChanged(callback) {
    auth.onAuthStateChanged(user => {
        callback(isAdminUser(user), user, getAdminProfile(user));
    });
}

function logout() {
    return auth.signOut().then(() => {
        window.location.href = "Login.html";
    });
}
