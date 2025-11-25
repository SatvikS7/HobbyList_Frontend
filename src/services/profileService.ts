import { api } from './api';
import { type ProfileDto } from '../types';
import axios from 'axios';

export const profileService = {
    getProfile: async (): Promise<ProfileDto> => {
        const response = await api.get<ProfileDto>('/profile');
        return response.data;
    },

    updateProfile: async (updates: Partial<ProfileDto>): Promise<void> => {
        await api.patch('/profile', updates);
    },

    addHobby: async (hobby: string): Promise<void> => {
        await api.post('/profile/hobbies', { hobby });
    },

    getUploadUrl: async (filename: string, contentType: string): Promise<string> => {
        const response = await api.post<string>('/profile/upload-url', {
            filename,
            contentType,
        });
        return response.data;
    },

    saveProfilePhotoMetadata: async (data: {
        imageUrl: string;
        uploadDate: string;
        filename: string;
        size: number;
        contentType: string;
    }): Promise<void> => {
        await api.post('/profile/photo', data);
    },

    uploadFileToS3: async (uploadUrl: string, file: File): Promise<void> => {
        await axios.put(uploadUrl, file, {
            headers: { 'Content-Type': file.type }
        });
    }
};
