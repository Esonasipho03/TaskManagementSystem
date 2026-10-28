import { useEffect, useState } from "react";

// Chrome/Edge/Android fire "beforeinstallprompt" early, often before the
// login page mounts, so capture it as soon as this module loads.
let deferredPrompt = null;
const listeners = new Set();

if (typeof window !== "undefined") {
    window.addEventListener("beforeinstallprompt", (event) => {
        event.preventDefault();
        deferredPrompt = event;
        listeners.forEach((fn) => fn());
    });

    window.addEventListener("appinstalled", () => {
        deferredPrompt = null;
        listeners.forEach((fn) => fn());
    });
}

function isStandalone() {
    return (
        window.matchMedia?.("(display-mode: standalone)").matches ||
        window.navigator.standalone === true
    );
}

function isIos() {
    const ua = window.navigator.userAgent;
    const iPadOs = ua.includes("Macintosh") && navigator.maxTouchPoints > 1;
    return /iPhone|iPad|iPod/.test(ua) || iPadOs;
}

export default function useInstallPrompt() {
    const [, rerender] = useState(0);

    useEffect(() => {
        const update = () => rerender((n) => n + 1);
        listeners.add(update);
        return () => listeners.delete(update);
    }, []);

    async function promptInstall() {
        if (!deferredPrompt) return "unavailable";

        const event = deferredPrompt;
        deferredPrompt = null;
        event.prompt();
        const { outcome } = await event.userChoice;
        listeners.forEach((fn) => fn());
        return outcome; // "accepted" or "dismissed"
    }

    return {
        installed: isStandalone(),
        canPrompt: Boolean(deferredPrompt),
        ios: isIos(),
        promptInstall,
    };
}
