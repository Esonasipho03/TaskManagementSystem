import { useContext, useState } from "react";

import DashboardLayout from "../components/layout/DashboardLayout";
import { AuthContext } from "../context/AuthContext";
import { updateProfile } from "../api/accounts";

function initials(user) {

    if (!user) return "";

    if (user.first_name || user.last_name) {
        return `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase();
    }

    return user.username?.slice(0, 2).toUpperCase();

}

export default function Settings() {

    const { user, setUser } = useContext(AuthContext);

    const [form, setForm] = useState({
        first_name: user?.first_name || "",
        last_name: user?.last_name || "",
        email: user?.email || "",
    });

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    function handleChange(e) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setSuccess(false);
    }

    async function handleSubmit(e) {

        e.preventDefault();

        setError("");
        setSuccess(false);
        setSaving(true);

        try {

            const updated = await updateProfile(form);
            setUser?.(updated);
            setSuccess(true);

        } catch (err) {

            const data = err?.response?.data;

            setError(
                data
                    ? Object.values(data).flat().join(" ")
                    : "Could not update your profile."
            );

        } finally {
            setSaving(false);
        }

    }

    return (

        <DashboardLayout>

            <div className="page-header">
                <div>
                    <h2>Settings</h2>
                    <p className="text-muted mb-0">
                        Manage your profile information.
                    </p>
                </div>
            </div>

            <div className="section-card settings-card">

                <div className="d-flex align-items-center gap-3 mb-4">

                    <div className="avatar-lg">{initials(user)}</div>

                    <div>
                        <div className="fw-bold fs-5">{user?.username}</div>
                        <span className="badge bg-primary text-uppercase">{user?.role}</span>
                    </div>

                </div>

                <form onSubmit={handleSubmit}>

                    <div className="row">

                        <div className="col-6">
                            <label className="form-label small text-muted">First name</label>
                            <input
                                className="form-control mb-3"
                                name="first_name"
                                value={form.first_name}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="col-6">
                            <label className="form-label small text-muted">Last name</label>
                            <input
                                className="form-control mb-3"
                                name="last_name"
                                value={form.last_name}
                                onChange={handleChange}
                            />
                        </div>

                    </div>

                    <label className="form-label small text-muted">Email</label>
                    <input
                        type="email"
                        className="form-control mb-3"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                    />

                    <label className="form-label small text-muted">Username</label>
                    <input
                        className="form-control mb-3"
                        value={user?.username || ""}
                        disabled
                    />
                    <p className="text-muted small mb-3">
                        Your username and role can't be changed here.
                    </p>

                    {error && (
                        <div className="alert alert-danger">{error}</div>
                    )}

                    {success && (
                        <div className="alert alert-success">
                            Your profile has been updated.
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={saving}
                    >
                        {saving ? "Saving..." : "Save changes"}
                    </button>

                </form>

            </div>

        </DashboardLayout>

    );

}
