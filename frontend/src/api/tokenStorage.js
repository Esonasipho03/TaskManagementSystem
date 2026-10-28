// Where login tokens live.
// "Keep me logged in" -> localStorage (survives closing the browser).
// Otherwise -> sessionStorage (cleared when the browser/app is closed).

const KEYS = ["access", "refresh"];

function stores() {
    return [window.localStorage, window.sessionStorage];
}

export function getToken(name) {
    for (const store of stores()) {
        const value = store.getItem(name);
        if (value) return value;
    }
    return null;
}

export function isRemembered() {
    return Boolean(window.localStorage.getItem("refresh"));
}

export function saveTokens({ access, refresh }, remember) {
    clearTokens();
    const store = remember ? window.localStorage : window.sessionStorage;
    store.setItem("access", access);
    if (refresh) store.setItem("refresh", refresh);
}

export function setAccessToken(access) {
    const store = isRemembered() ? window.localStorage : window.sessionStorage;
    store.setItem("access", access);
}

export function clearTokens() {
    for (const store of stores()) {
        KEYS.forEach((key) => store.removeItem(key));
    }
}
