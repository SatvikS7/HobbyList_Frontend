import { api } from "./api";

export const followService = {
    followUser: async (userId: number) => {
        const response = await api.post(`/users/${userId}/follow`);
        return response.data;
    },

    unfollowUser: async (userId: number) => {
        const response = await api.post(`/users/${userId}/unfollow`);
        return response.data;
    },

    getRequests: async () => {
        const response = await api.get('/users/requests');
        return response.data;
    },

    acceptRequest: async (userId: number) => {
        const response = await api.post(`/users/requests/${userId}/accept`);
        return response.data;
    },

    rejectRequest: async (userId: number) => {
        const response = await api.post(`/users/requests/${userId}/reject`);
        return response.data;
    },

    getFollowers: async (userId: number) => {
        const response = await api.get(`/users/${userId}/followers`);
        return response.data;
    },

    getFollowing: async (userId: number) => {
        const response = await api.get(`/users/${userId}/following`);
        return response.data;
    },
}
