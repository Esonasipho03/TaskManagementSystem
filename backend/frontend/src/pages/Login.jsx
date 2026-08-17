import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";

import { AuthContext } from "../context/AuthContext";

import "./../styles/login.css";
import logo from "../assets/logo.png";

export default function Login() {

    const navigate = useNavigate();

    const { login } = useContext(AuthContext);

    const [username, setUsername] = useState("");

    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);

    const [rememberMe, setRememberMe] = useState(true);

    const [error, setError] = useState("");

    async function handleSubmit(e) {

        e.preventDefault();

        setError("");

        try {

            const user = await login(username, password);

            if (user.role === "MANAGER") {

                navigate("/dashboard");

            } else {

                navigate("/dashboard");

            }

        } catch (err) {

            setError("Invalid username or password.");

        }

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
                            Remember me
                        </label>

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
                    >

                        Sign In

                    </button>

                </form>

                <div className="text-center mt-4">

                    <small>

                        © 2026 Task Management System

                    </small>

                </div>

            </div>

        </div>

    );

}
