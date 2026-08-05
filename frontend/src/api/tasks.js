import api from "./axios";

export const getTasks = async () => {
    const response = await api.get("tasks/");
    return response.data;
};

export const createTask = async (data) => {
    const response = await api.post("tasks/", data);
    return response.data;
};

export const updateTask = async (id, data) => {
    const response = await api.patch(`tasks/${id}/`, data);
    return response.data;
};

export const updateTaskStatus = async (id, status) => {
    const response = await api.patch(`tasks/${id}/`, { status });
    return response.data;
};

export const deleteTask = async (id) => {
    await api.delete(`tasks/${id}/`);
};
