import { useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    FaBell,
    FaSearch,
    FaUserCircle,
    FaProjectDiagram,
    FaTasks,
    FaSignOutAlt,
} from "react-icons/fa";
import { FiSun, FiMoon } from "react-icons/fi";

import { AuthContext } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { getTasks } from "../../api/tasks";
import { getProjects } from "../../api/projects";
import { getUnreadCount } from "../../api/notifications";
import Notifications from "../dashboard/Notifications";

import "../../styles/navbar.css";

const PAGE_TITLES = {
    "/dashboard": "Dashboard",
    "/projects": "Projects",
    "/tasks": "Tasks",
    "/calendar": "Calendar",
    "/team": "Team",
    "/settings": "Settings",
};

export default function TopNavbar() {

    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);
    const { theme, toggleTheme } = useTheme();

    const title = PAGE_TITLES[location.pathname] || "Dashboard";

    const [query, setQuery] = useState("");
    const [showResults, setShowResults] = useState(false);
    const [searching, setSearching] = useState(false);
    const [catalog, setCatalog] = useState(null); // { tasks, projects }, loaded lazily

    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const [showUserMenu, setShowUserMenu] = useState(false);

    const searchRef = useRef(null);
    const notifRef = useRef(null);
    const userRef = useRef(null);
    const debounceRef = useRef(null);

    // Close any open dropdown when clicking outside of it
    useEffect(() => {

        function handleClickOutside(e) {

            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowResults(false);
            }

            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setShowNotifications(false);
            }

            if (userRef.current && !userRef.current.contains(e.target)) {
                setShowUserMenu(false);
            }

        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);

    }, []);

    // Poll unread notification count
    useEffect(() => {

        let cancelled = false;

        async function loadUnread() {
            try {
                const count = await getUnreadCount();
                if (!cancelled) setUnreadCount(count);
            } catch (err) {
                console.error(err);
            }
        }

        loadUnread();
        const interval = setInterval(loadUnread, 20000);

        return () => {
            cancelled = true;
            clearInterval(interval);
        };

    }, []);

    async function ensureCatalog() {

        if (catalog) return catalog;

        setSearching(true);

        try {

            const [tasks, projects] = await Promise.all([
                getTasks(),
                getProjects(),
            ]);

            const loaded = { tasks, projects };
            setCatalog(loaded);
            return loaded;

        } catch (err) {

            console.error(err);
            return { tasks: [], projects: [] };

        } finally {
            setSearching(false);
        }

    }

    function handleSearchChange(e) {

        const value = e.target.value;
        setQuery(value);
        setShowResults(true);

        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(() => {
            ensureCatalog();
        }, 200);

    }

    function handleSearchFocus() {
        setShowResults(true);
        ensureCatalog();
    }

    function goToTask() {
        setShowResults(false);
        setQuery("");
        navigate("/tasks");
    }

    function goToProject() {
        setShowResults(false);
        setQuery("");
        navigate("/projects");
    }

    const q = query.trim().toLowerCase();

    const matchedTasks = q && catalog
        ? catalog.tasks.filter((t) => t.title?.toLowerCase().includes(q)).slice(0, 5)
        : [];

    const matchedProjects = q && catalog
        ? catalog.projects.filter((p) => p.name?.toLowerCase().includes(q)).slice(0, 5)
        : [];

    const hasResults = matchedTasks.length > 0 || matchedProjects.length > 0;

    function handleLogout() {
        logout();
        navigate("/");
    }

    return (
        <div className="top-navbar">

            <div>
                <h4>{title}</h4>
            </div>

            <div className="top-right">

                <div className="search-wrapper" ref={searchRef}>

                    <div className="search-box">
                        <FaSearch />
                        <input
                            placeholder="Search tasks & projects..."
                            value={query}
                            onChange={handleSearchChange}
                            onFocus={handleSearchFocus}
                        />
                    </div>

                    {showResults && q && (

                        <div className="search-results">

                            {searching && (
                                <div className="search-empty">Searching...</div>
                            )}

                            {!searching && !hasResults && (
                                <div className="search-empty">
                                    No matches for "{query}"
                                </div>
                            )}

                            {!searching && matchedTasks.length > 0 && (
                                <div className="search-group">
                                    <div className="search-group-label">Tasks</div>
                                    {matchedTasks.map((t) => (
                                        <div
                                            key={`task-${t.id}`}
                                            className="search-result-item"
                                            role="button"
                                            onClick={goToTask}
                                        >
                                            <FaTasks className="search-result-icon" />
                                            <div>
                                                <div className="search-result-title">{t.title}</div>
                                                <div className="search-result-sub">{t.project_name}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {!searching && matchedProjects.length > 0 && (
                                <div className="search-group">
                                    <div className="search-group-label">Projects</div>
                                    {matchedProjects.map((p) => (
                                        <div
                                            key={`project-${p.id}`}
                                            className="search-result-item"
                                            role="button"
                                            onClick={goToProject}
                                        >
                                            <FaProjectDiagram className="search-result-icon" />
                                            <div>
                                                <div className="search-result-title">{p.name}</div>
                                                <div className="search-result-sub">{p.status}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                        </div>

                    )}

                </div>

                <div className="notif-wrapper" ref={notifRef}>

                    <div
                        className="icon-wrapper"
                        role="button"
                        onClick={() => setShowNotifications((v) => !v)}
                    >
                        <FaBell className="icon" />
                        {unreadCount > 0 && (
                            <span className="notif-badge">
                                {unreadCount > 9 ? "9+" : unreadCount}
                            </span>
                        )}
                    </div>

                    {showNotifications && (
                        <Notifications
                            onClose={() => setShowNotifications(false)}
                            onUnreadChange={setUnreadCount}
                        />
                    )}

                </div>

                <button
                    type="button"
                    className="theme-toggle-btn"
                    onClick={toggleTheme}
                    aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                    title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                >
                    {theme === "dark" ? (
                        <FiSun className="theme-toggle-icon" key="sun" />
                    ) : (
                        <FiMoon className="theme-toggle-icon" key="moon" />
                    )}
                </button>

                <div className="user-wrapper" ref={userRef}>

                    <div
                        className="icon-wrapper"
                        role="button"
                        onClick={() => setShowUserMenu((v) => !v)}
                    >
                        <FaUserCircle size={34} />
                    </div>

                    {showUserMenu && (

                        <div className="user-panel">

                            <div className="user-panel-name">
                                {user?.first_name
                                    ? `${user.first_name} ${user.last_name || ""}`.trim()
                                    : user?.username}
                            </div>

                            <div className="user-panel-role">{user?.role}</div>

                            <button
                                type="button"
                                className="user-panel-logout"
                                onClick={handleLogout}
                            >
                                <FaSignOutAlt /> Logout
                            </button>

                        </div>

                    )}

                </div>

            </div>

        </div>
    );

}
