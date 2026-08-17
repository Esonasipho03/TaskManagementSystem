import { useEffect, useState } from "react";
import { FaEnvelope } from "react-icons/fa";

import DashboardLayout from "../components/layout/DashboardLayout";
import { getUsers } from "../api/accounts";

function initials(user) {

    if (user.first_name || user.last_name) {
        return `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase();
    }

    return user.username?.slice(0, 2).toUpperCase();

}

export default function Team() {

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");

    useEffect(() => {
        load();
    }, []);

    async function load() {

        try {

            const data = await getUsers();
            setUsers(data);

        } catch (err) {

            console.error(err);
            setError("Could not load the team directory.");

        } finally {
            setLoading(false);
        }

    }

    const filtered = roleFilter === "ALL"
        ? users
        : users.filter((u) => u.role === roleFilter);

    const managerCount = users.filter((u) => u.role === "MANAGER").length;
    const devCount = users.filter((u) => u.role === "DEVELOPER").length;

    return (

        <DashboardLayout>

            <div className="page-header">

                <div>
                    <h2>Team</h2>
                    <p className="text-muted mb-0">
                        {users.length} member{users.length === 1 ? "" : "s"} · {managerCount} manager{managerCount === 1 ? "" : "s"} · {devCount} developer{devCount === 1 ? "" : "s"}
                    </p>
                </div>

                <div className="btn-group">

                    {["ALL", "MANAGER", "DEVELOPER"].map((role) => (
                        <button
                            key={role}
                            type="button"
                            className={`btn btn-sm ${roleFilter === role ? "btn-primary" : "btn-outline-secondary"}`}
                            onClick={() => setRoleFilter(role)}
                        >
                            {role === "ALL" ? "All" : role.charAt(0) + role.slice(1).toLowerCase() + "s"}
                        </button>
                    ))}

                </div>

            </div>

            {error && (
                <div className="alert alert-danger">{error}</div>
            )}

            {loading && (
                <p className="text-muted">Loading team...</p>
            )}

            {!loading && !error && (

                <div className="team-grid">

                    {filtered.map((u) => (

                        <div className="team-card" key={u.id}>

                            <div className="team-avatar">{initials(u)}</div>

                            <div className="team-name">
                                {u.first_name || u.last_name
                                    ? `${u.first_name} ${u.last_name}`.trim()
                                    : u.username}
                            </div>

                            <div className="team-email">
                                <FaEnvelope className="me-1" />
                                {u.email || "No email on file"}
                            </div>

                            <span className={`badge ${u.role === "MANAGER" ? "bg-primary" : "bg-success"}`}>
                                {u.role}
                            </span>

                        </div>

                    ))}

                    {filtered.length === 0 && (
                        <p className="text-muted">No team members match this filter.</p>
                    )}

                </div>

            )}

        </DashboardLayout>

    );

}
