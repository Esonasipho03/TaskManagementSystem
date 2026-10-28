import { useState } from "react";

import useInstallPrompt from "../hooks/useInstallPrompt";

// "Use the task manager like an app" card shown on the login page.
// Hidden when the app is already running from the home screen.
export default function InstallAppCard() {

    const { installed, canPrompt, ios, promptInstall } = useInstallPrompt();

    const [hint, setHint] = useState("");

    if (installed) return null;

    async function handleInstall() {

        if (canPrompt) {
            const outcome = await promptInstall();
            setHint(outcome === "accepted" ? "Installed. Look for Tasks on your home screen." : "");
            return;
        }

        if (ios) {
            setHint("In Safari, tap the Share button, then “Add to Home Screen”.");
            return;
        }

        setHint("Open your browser menu (⋮) and choose “Install app” or “Add to Home screen”.");
    }

    return (

        <div className="install-card">

            <p className="install-card-title">Use the task manager like an app</p>

            <p className="install-card-text">
                Add it to this phone's home screen for one-tap access.
            </p>

            <button
                type="button"
                className="btn install-card-btn w-100"
                onClick={handleInstall}
            >
                <i className="bi bi-phone me-2" />
                Install on this phone
            </button>

            {hint && <p className="install-card-hint" role="status">{hint}</p>}

        </div>

    );

}
