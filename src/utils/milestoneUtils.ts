import type { MilestoneDto } from "../types";

/**
 * Calculates the completion percentage of a milestone based on its sub-milestones.
 * - If no sub-milestones: returns 100 if completed, 0 otherwise.
 * - If sub-milestones exist: returns average completion of direct children.
 *   Each child contributes 0-1 points (0% to 100%).
 */
export const calculateCompletion = (milestone: MilestoneDto): number => {
    console.log(milestone.id, milestone.completed)
    if (!milestone.subMilestones || milestone.subMilestones.length === 0) {
        return milestone.completed ? 100 : 0;
    }

    const totalPoints = milestone.subMilestones.reduce((sum, child) => {
        return sum + calculateCompletion(child);
    }, 0);

    return totalPoints / milestone.subMilestones.length;
};
