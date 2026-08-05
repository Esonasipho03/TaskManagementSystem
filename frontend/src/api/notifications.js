import api from "./axios";

export const getNotifications = async () => {
    const response = await api.get("notifications/");
    return response.data;
};

export const getUnreadCount = async () => {
    const response = await api.get("notifications/unread_count/");
    return response.data.unread_count;
};

export const markNotificationRead = async (id) => {
    const response = await api.post(`notifications/${id}/mark_read/`);
    return response.data;
};

export const markAllNotificationsRead = async () => {
    const response = await api.post("notifications/mark_all_read/");
    return response.data;
};
