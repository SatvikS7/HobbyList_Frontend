import React, { useState } from "react";
import { type MilestoneDto } from "../../../backend/src/types";
import { motion, AnimatePresence } from "framer-motion";
import { usePhotoMilestone } from "../contexts/PhotoMilestoneContext";
import toast from "react-hot-toast";

interface MilestoneItemProps {
  milestone: MilestoneDto;
  onDelete: (id: number) => void;
  onClick: (milestone: MilestoneDto) => void;
  depth?: number;
}

const MilestoneItem: React.FC<MilestoneItemProps> = ({ 
  milestone, 
  onDelete, 
  onClick, 
  depth = 0 
}) => {
  const { milestoneMap, completeMilestone, incompleteMilestone, refreshMilestones } = usePhotoMilestone();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const hasChildren = milestone.subMilestones && milestone.subMilestones.length > 0;

  const percentage = (milestoneMap.get(milestone.id)?.completionRate ?? 0) * 100;

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleToggleCompletion = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isToggling) return;

    try {
      setIsToggling(true);
      if (milestone.completed) {
        // Uncomplete
        await incompleteMilestone(milestone.id);
        toast.success("Milestone marked as incomplete");
      } else {
        // Complete
        await completeMilestone(milestone.id);
        toast.success("Milestone completed!");
      }
    } catch (error) {
      console.error("Error toggling completion:", error);
      toast.error("Failed to update milestone status");
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="flex flex-col">
      <div
        className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex justify-between items-center"
        style={{ marginLeft: `${depth * 20}px` }}
        onClick={() => onClick(milestone)}
      >
        <div className="flex items-center gap-3">
          {/* Dropdown Arrow */}
          {hasChildren ? (
            <button
              onClick={handleToggleExpand}
              className="p-1 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          ) : (
            <div className="w-7" /> /* Spacer for alignment */
          )}

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-gray-900">{milestone.task}</h3>
              {milestone.hobbyTag && (
                <span className="px-2 py-0.5 rounded-full bg-[#f5e6c8] text-[#b99547] text-xs font-medium">
                  {milestone.hobbyTag}
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Due: {new Date(milestone.dueDate).toLocaleDateString()}
            </div>
            {/* Progress Bar */}
            <div className="w-full max-w-[200px] mt-2">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span>{Math.round(percentage)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-[#b99547] h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              milestone.completed
                ? "bg-green-100 text-green-800"
                : "bg-[#f5e6c8] text-[#785c16]"
            }`}
          >
            {milestone.completed ? "Completed" : "Pending"}
          </span>
          <button
            onClick={handleToggleCompletion}
            disabled={isToggling}
            className={`p-1 rounded transition-colors ${
              milestone.completed
                ? "text-green-600 hover:bg-green-100"
                : "text-gray-400 hover:text-[#b99547] hover:bg-[#f5e6c8]"
            }`}
            title={milestone.completed ? "Mark as Incomplete" : "Mark as Complete"}
          >
            {milestone.completed ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(milestone.id);
            }}
            className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
            title="Delete Milestone"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Recursive Children */}
      <AnimatePresence>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-2 mt-2">
              {milestone.subMilestones.map((child) => (
                <MilestoneItem
                  key={child.id}
                  milestone={child}
                  onDelete={onDelete}
                  onClick={onClick}
                  depth={depth + 1}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MilestoneItem;
