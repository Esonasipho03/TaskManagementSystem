import { useRef } from "react";

import "./../../styles/date-field-sa.css";

// Native <input type="date"> renders its displayed text using the
// browser/OS locale, which is often US-style (mm/dd/yyyy) regardless
// of what the app itself is doing. This component keeps the native
// input (so the OS date picker, keyboard entry and form validation
// all still work) but hides its rendered text and overlays our own
// dd/mm/yyyy label instead, so the visible format is always
// consistent for South African users no matter the browser locale.
//
// value / onChange still use the plain yyyy-mm-dd string the native
// input and the rest of the app already expect - only the on-screen
// text changes.
export default function DateFieldSA({
    name,
    value,
    onChange,
    required = false,
    disabled = false,
    className = "form-control",
}) {

    const inputRef = useRef(null);

    function formatDisplay(v) {

        if (!v) return "";

        const [y, m, d] = v.split("-");

        if (!y || !m || !d) return "";

        return `${d}/${m}/${y}`;

    }

    function openPicker() {

        if (disabled) return;

        const el = inputRef.current;

        if (!el) return;

        if (typeof el.showPicker === "function") {

            try {
                el.showPicker();
            } catch {
                el.focus();
            }

        } else {

            el.focus();

        }

    }

    return (

        <div
            className={`date-field-sa${disabled ? " disabled" : ""}`}
            onClick={openPicker}
        >

            <input
                ref={inputRef}
                type="date"
                name={name}
                value={value || ""}
                onChange={onChange}
                required={required}
                disabled={disabled}
                className="date-field-sa-native"
                tabIndex={-1}
                aria-hidden="true"
            />

            <div className={`${className} date-field-sa-display`}>

                <span className={value ? "" : "date-field-sa-placeholder"}>
                    {value ? formatDisplay(value) : "dd/mm/yyyy"}
                </span>

                <i className="bi bi-calendar3 date-field-sa-icon" />

            </div>

        </div>

    );

}
