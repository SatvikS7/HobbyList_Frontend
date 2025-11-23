import React from "react";
import { type MilestoneDto } from "../types";

interface MilestoneItemProps {
  milestone: MilestoneDto;
  onDelete: () => void;
  onClick: () => void;
}

const MilestoneItem: React.FC<MilestoneItemProps> = ({ milestone, onDelete, onClick }) => {
  return (
    <div
      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex justify-between items-center"
      onClick={onClick}
    >
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
      </div>
      
      <div className="flex items-center gap-3">
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            milestone.isCompleted
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {milestone.isCompleted ? "Completed" : "Pending"}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
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
  );
};

export default MilestoneItem;
