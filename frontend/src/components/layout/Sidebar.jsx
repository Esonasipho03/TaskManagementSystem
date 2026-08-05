import { useContext } from "react";

import {
    FaHome,
    FaProjectDiagram,
    FaTasks,
    FaUsers,
    FaCalendarAlt,
    FaChartBar,
    FaSignOutAlt,
} from "react-icons/fa";

import { NavLink, useNavigate } from "react-router-dom";

import { AuthContext } from "../../context/AuthContext";

import logoWhite from "../../assets/logo-white.png";

import "../../styles/sidebar.css";

export default function Sidebar() {

    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const isManager = user?.role === "MANAGER";

    function handleLogout() {
        logout();
        navigate("/");
    }

    const menu = [
        { name: "Dashboard", icon: <FaHome />, path: "/dashboard" },
        { name: "Projects", icon: <FaProjectDiagram />, path: "/projects" },
        { name: "Tasks", icon: <FaTasks />, path: "/tasks" },
        { name: "Calendar", icon: <FaCalendarAlt />, path: "/calendar" },
        { name: "Team", icon: <FaUsers />, path: "/team" },
        ...(isManager ? [{ name: "Reports", icon: <FaChartBar />, path: "/reports" }] : []),
    ];

    return (

        <div className="sidebar">

            <div className="logo">
                <img src={logoWhite} alt="Nokamabovu Credit Solutions" className="logo-img" />
                <span>Task Manager</span>
            </div>

            <div className="menu">
                {menu.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) =>
                            "menu-item" + (isActive ? " active" : "")
                        }
                    >
                        {item.icon}
                        <span>{item.name}</span>
                    </NavLink>
                ))}
            </div>

            <div className="logout" onClick={handleLogout} role="button">
                <FaSignOutAlt />
                <span>Logout</span>
            </div>

        </div>

    );

}
