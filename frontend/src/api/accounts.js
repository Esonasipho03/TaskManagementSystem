import api from "./axios";

export const getUsers = async () => {
    const response = await api.get("accounts/users/");
    return response.data;
};

export const updateProfile = async (data) => {
    const response = await api.patch("accounts/me/", data);
    return response.data;
};
