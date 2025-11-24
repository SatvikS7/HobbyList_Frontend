import { api } from './api';
import { type PhotoDto } from '../types';
import axios from 'axios';

export const photoService = {
    getUploadUrl: async (filename: string, contentType: string): Promise<string> => {
        const response = await api.post<string>('/photos/get-upload-url', {
            filename,
            contentType,
        });
        return response.data;
    },

    uploadFileToS3: async (
        uploadUrl: string,
        file: File,
        onProgress?: (progress: number) => void
    ): Promise<void> => {
        await axios.put(uploadUrl, file, {
            headers: {
                'Content-Type': file.type,
            },
            onUploadProgress: (progressEvent: any) => {
                if (progressEvent.total && onProgress) {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    onProgress(percentCompleted);
                }
            },
        });
    },

    savePhotoMetadata: async (data: {
        topic: string;
        imageUrl: string;
        filename: string;
        size: number;
        contentType: string;
        description: string;
        taggedMilestoneIds?: number[];
        uploadDate: string;
    }): Promise<void> => {
        await api.post('/photos/save-url', data);
    },

    getPhotos: async (): Promise<PhotoDto[]> => {
        const response = await api.get<PhotoDto[]>('/photos');
        return response.data;
    },
};
