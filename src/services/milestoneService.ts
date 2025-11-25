import { api } from './api';
import { type MilestoneDto, type CreateMilestoneRequest } from '../types';

export const milestoneService = {
    getMilestones: async (): Promise<MilestoneDto[]> => {
        const response = await api.get<MilestoneDto[]>('/milestones');
        return response.data;
    },

    createMilestone: async (milestone: CreateMilestoneRequest): Promise<MilestoneDto> => {
        const response = await api.post<MilestoneDto>('/milestones', milestone);
        return response.data;
    },

    deleteMilestone: async (id: number): Promise<void> => {
        await api.delete(`/milestones/${id}`);
    },

    editMilestone: async (milestone: MilestoneDto): Promise<void> => {
        await api.patch(`/milestones/${milestone.id}`, milestone);
    },

    completeMilestoneTree: async (id: number): Promise<void> => {
        await api.post(`/milestones/${id}/complete-tree`);
    },
};
