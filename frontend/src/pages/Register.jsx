import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { registerUser } from "../api/accounts";

import "./../styles/login.css";
import logo from "../assets/logo.png";

export default function Register() {

    const navigate = useNavigate();

    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        username: "",
        email: "",
        password: "",
        role: "DEVELOPER",
    });

    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    function handleChange(e) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    async function handleSubmit(e) {

        e.preventDefault();

        setError("");
        setSubmitting(true);

        try {

            await registerUser(form);

            navigate("/", { state: { registered: true } });

        } catch (err) {

            const data = err?.response?.data;

            if (data && typeof data === "object") {

                const firstError = Object.values(data)[0];

                setError(
                    Array.isArray(firstError) ? firstError[0] : String(firstError)
                );

            } else {

                setError("Could not create your account. Please try again.");

            }

        } finally {

            setSubmitting(false);

        }

    }

    return (

        <div className="login-page">

            <div className="login-card row g-0">

                <div className="col-lg-6 left-side">

                    <svg
                        className="left-illustration"
                        viewBox="0 0 240 200"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        role="img"
                        aria-label="Illustration of a task checklist"
                    >
                        <rect x="30" y="18" width="150" height="164" rx="18" fill="#fff" />
                        <rect x="30" y="18" width="150" height="164" rx="18" stroke="#F3CDB3" strokeWidth="1.5" />
                        <rect x="54" y="46" width="80" height="8" rx="4" fill="#E2672E" />
                        <rect x="54" y="64" width="102" height="6" rx="3" fill="#F0DFCE" />
                        <circle cx="60" cy="96" r="9" fill="#E2672E" />
                        <path d="M56 96l3 3 6-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <rect x="80" y="92" width="76" height="7" rx="3.5" fill="#F0DFCE" />
                        <circle cx="60" cy="126" r="9" fill="#F5A623" />
                        <path d="M56 126l3 3 6-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <rect x="80" y="122" width="60" height="7" rx="3.5" fill="#F0DFCE" />
                        <circle cx="60" cy="156" r="9" fill="#FBE0CB" stroke="#F3CDB3" strokeWidth="1.5" />
                        <rect x="80" y="152" width="68" height="7" rx="3.5" fill="#F0DFCE" />
                        <circle cx="176" cy="150" r="30" fill="#E2672E" opacity="0.12" />
                        <circle cx="176" cy="150" r="18" fill="#fff" stroke="#E2672E" strokeWidth="2" />
                        <path d="M168 150l6 6 12-13" stroke="#E2672E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>

                    <h1 className="fw-bold left-title">

                        Task Management

                    </h1>

                    <div className="mt-2 left-desc">

                        <div className="check"><span className="check-dot" />Manage projects</div>
                        <div className="check"><span className="check-dot" />Track developer progress</div>
                        <div className="check"><span className="check-dot" />Assign tasks</div>
                        <div className="check"><span className="check-dot" />Monitor productivity</div>

                    </div>

                </div>

                <div className="col-lg-6 right-side">

                    <div className="brand-logo-wrap">
                        <img
                            src={logo}
                            className="brand-logo"
                            alt="Nokamabovu Credit Solutions"
                        />
                    </div>

                    <h2 className="fw-bold">

                        Create account

                    </h2>

                    <p className="text-muted">

                        Sign up as a manager or developer

                    </p>

                    <form
                        className="mt-4"
                        onSubmit={handleSubmit}
                    >

                        <div className="row">

                            <div className="col-6">
                                <input
                                    className="form-control mb-3"
                                    name="first_name"
                                    placeholder="First name"
                                    value={form.first_name}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="col-6">
                                <input
                                    className="form-control mb-3"
                                    name="last_name"
                                    placeholder="Last name"
                                    value={form.last_name}
                                    onChange={handleChange}
                                />
                            </div>

                        </div>

                        <input
                            className="form-control mb-3"
                            name="username"
                            placeholder="Username"
                            value={form.username}
                            onChange={handleChange}
                            required
                        />

                        <input
                            type="email"
                            className="form-control mb-3"
                            name="email"
                            placeholder="Email"
                            value={form.email}
                            onChange={handleChange}
                        />

                        <input
                            type="password"
                            className="form-control mb-3"
                            name="password"
                            placeholder="Password"
                            value={form.password}
                            onChange={handleChange}
                            required
                        />

                        <select
                            className="form-control mb-3"
                            name="role"
                            value={form.role}
                            onChange={handleChange}
                        >
                            <option value="DEVELOPER">Developer</option>
                            <option value="MANAGER">Manager</option>
                        </select>

                        {error && (

                            <div className="alert alert-danger">

                                {error}

                            </div>

                        )}

                        <button
                            type="submit"
                            className="btn btn-primary btn-login w-100"
                            disabled={submitting}
                        >

                            {submitting ? "Creating account..." : "Create account"}

                        </button>

                    </form>

                    <div className="text-center mt-4">

                        <small>

                            Already have an account? <Link to="/">Sign in</Link>

                        </small>

                    </div>

                    <div className="text-center mt-3">

                        <small>

                            © 2026 Task Management System

                        </small>

                    </div>

                </div>

            </div>

        </div>

    );

}
