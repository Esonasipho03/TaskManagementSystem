import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCircle, FaCheckDouble, FaBellSlash } from "react-icons/fa";

import {
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
} from "../../api/notifications";

function timeAgo(dateString) {
    const seconds = Math.floor((Date.now() - new Date(dateString)) / 1000);

    if (seconds < 60) return "just now";

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

export default function Notifications({ onClose, onUnreadChange }) {

    const navigate = useNavigate();

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        load();
    }, []);

    async function load() {

        try {
            const data = await getNotifications();
            setNotifications(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }

    }

    async function handleClick(notification) {

        if (!notification.is_read) {

            setNotifications((prev) =>
                prev.map((n) =>
                    n.id === notification.id ? { ...n, is_read: true } : n
                )
            );

            onUnreadChange?.((count) => Math.max(0, count - 1));

            try {
                await markNotificationRead(notification.id);
            } catch (err) {
                console.error(err);
            }

        }

        onClose?.();

        if (notification.link) {
            navigate(notification.link);
        }

    }

    async function handleMarkAllRead() {

        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        onUnreadChange?.(() => 0);

        try {
            await markAllNotificationsRead();
        } catch (err) {
            console.error(err);
        }

    }

    const hasUnread = notifications.some((n) => !n.is_read);

    return (
        <div className="notif-panel">

            <div className="notif-panel-header">
                <span>Notifications</span>

                {hasUnread && (
                    <button
                        type="button"
                        className="notif-mark-all"
                        onClick={handleMarkAllRead}
                    >
                        <FaCheckDouble /> Mark all read
                    </button>
                )}
            </div>

            <div className="notif-panel-body">

                {loading && (
                    <div className="notif-empty">Loading...</div>
                )}

                {!loading && notifications.length === 0 && (
                    <div className="notif-empty">
                        <FaBellSlash size={22} className="mb-2" />
                        <div>You're all caught up.</div>
                    </div>
                )}

                {!loading && notifications.map((n) => (

                    <div
                        key={n.id}
                        className={`notif-item ${n.is_read ? "" : "unread"}`}
                        role="button"
                        onClick={() => handleClick(n)}
                    >

                        {!n.is_read && (
                            <FaCircle className="notif-dot" />
                        )}

                        <div className="notif-content">
                            <div className="notif-message">{n.message}</div>
                            <div className="notif-time">{timeAgo(n.created_at)}</div>
                        </div>

                    </div>

                ))}

            </div>

        </div>
    );

}
