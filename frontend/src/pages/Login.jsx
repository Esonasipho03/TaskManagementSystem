import { useState, useContext } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import { AuthContext } from "../context/AuthContext";
import InstallAppCard from "../components/InstallAppCard";

import "./../styles/login.css";
import logo from "../assets/logo.png";

export default function Login() {

    const navigate = useNavigate();

    const { login, user, loading } = useContext(AuthContext);

    const [username, setUsername] = useState("");

    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);

    const [rememberMe, setRememberMe] = useState(false);

    const [error, setError] = useState("");

    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(e) {

        e.preventDefault();

        setError("");

        setSubmitting(true);

        try {

            await login(username, password, rememberMe);

            navigate("/dashboard");

        } catch {

            setError("Invalid username or password.");

        } finally {

            setSubmitting(false);

        }

    }

    // Already signed in on this device (e.g. "Keep me logged in", or opened
    // from the home screen): skip the form.
    if (!loading && user) {

        return <Navigate to="/dashboard" replace />;

    }

    return (

        <div className="login-page auth-page">

            <div className="auth-card">

                <img src={logo} alt="Nokamabovu Credit Solutions" className="auth-logo" />

                <h2 className="auth-title">Welcome Back</h2>

                <p className="auth-subtitle">
                    Sign in to your account to continue
                </p>

                <form onSubmit={handleSubmit} className="mt-4">

                    <label className="auth-label" htmlFor="username">
                        Username
                    </label>

                    <div className="auth-input-group">

                        <i className="bi bi-person auth-input-icon" />

                        <input
                            id="username"
                            autoComplete="username"
                            className="form-control auth-input"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />

                    </div>

                    <label className="auth-label" htmlFor="password">
                        Password
                    </label>

                    <div className="auth-input-group">

                        <i className="bi bi-lock auth-input-icon" />

                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            className="form-control auth-input auth-input-has-toggle"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <button
                            type="button"
                            className="auth-input-toggle"
                            onClick={() => setShowPassword((v) => !v)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            <i className={showPassword ? "bi bi-eye-slash" : "bi bi-eye"} />
                        </button>

                    </div>

                    {error && (

                        <div className="alert alert-danger">

                            {error}

                        </div>

                    )}

                    <div className="auth-row">

                        <label className="auth-remember">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            Keep me logged in on this device for 30 days
                        </label>

                    </div>

                    <div className="auth-row auth-row-end">

                        <a
                            href="#"
                            className="auth-forgot-link"
                            onClick={(e) => e.preventDefault()}
                        >
                            Forgot Password?
                        </a>

                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-login w-100"
                        disabled={submitting}
                    >

                        {submitting ? "Signing in..." : "Sign In"}

                    </button>

                </form>

                <InstallAppCard />

                <div className="text-center mt-4">

                    <small>

                        © 2026 Task Management System

                    </small>

                </div>

            </div>

        </div>

    );

}
