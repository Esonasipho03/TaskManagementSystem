import api from "./axios";

export const getProjects = async () => {
    const response = await api.get("projects/");
    return response.data;
};

export const createProject = async (data) => {
    const response = await api.post("projects/", data);
    return response.data;
};

export const updateProject = async (id, data) => {
    const response = await api.patch(`projects/${id}/`, data);
    return response.data;
};

export const updateProjectStatus = async (id, status) => {
    const response = await api.patch(`projects/${id}/`, { status });
    return response.data;
};