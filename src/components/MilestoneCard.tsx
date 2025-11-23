import React, { useState } from "react";
import { usePhotoMilestone } from "../contexts/PhotoMilestoneContext";
import PhotoCard from "./PhotoCard";
import { milestoneService } from "../services/milestoneService";
import toast from "react-hot-toast";
import { type MilestoneDto } from "../types";

interface MilestoneCardProps {
  milestone: MilestoneDto;
  onClose: () => void;
  onDelete?: () => void;
}

const MilestoneCard: React.FC<MilestoneCardProps> = ({ milestone, onClose, onDelete }) => {
  const { milestoneMap, photoMap, refreshMilestones } = usePhotoMilestone();
  const [selectedPhotoId, setSelectedPhotoId] = useState<number | null>(null);

  // Subtask creation state
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [subtaskTask, setSubtaskTask] = useState("");
  const [subtaskDate, setSubtaskDate] = useState("");
  const [subtaskTime, setSubtaskTime] = useState("");
  const [isCreatingSub, setIsCreatingSub] = useState(false);

  const taggedPhotos = milestone.taggedPhotoIds
    .map((id) => photoMap.get(id))
    .filter(Boolean);

  const handleAddSubtask = async () => {
    if (!subtaskTask.trim() || !subtaskDate || !subtaskTime) {
      toast.error("Please fill out all fields for the subtask.");
      return;
    }

    try {
      setIsCreatingSub(true);
      const dateTimeString = `${subtaskDate}T${subtaskTime}:00`;
      const localDate = new Date(dateTimeString);
      const isoString = localDate.toISOString();

      await milestoneService.createMilestone({
        task: subtaskTask,
        dueDate: isoString,
        isCompleted: false,
        parentId: milestone.id,
      });

      toast.success("Subtask created!");
      setSubtaskTask("");
      setSubtaskDate("");
      setSubtaskTime("");
      setIsAddingSubtask(false);
      await refreshMilestones();
    } catch (error) {
      console.error("Error creating subtask:", error);
      toast.error("Failed to create subtask.");
    } finally {
      setIsCreatingSub(false);
    }
  };

  const renderSubMilestones = (subs: MilestoneDto[]) => {
    if (!subs || subs.length === 0) return null;

    return (
      <ul className="pl-4 border-l border-gray-300 space-y-2 mt-2">
        {subs.map((sub) => (
          <li key={sub.id}>
            <div className="flex justify-between items-center">
              <span className="text-gray-800 font-medium">{sub.task}</span>
              <span className="text-gray-500 text-sm">{sub.hobbyTag}</span>
            </div>
            <div className="text-gray-600 text-sm">
              Due: {new Date(sub.dueDate).toLocaleDateString()} |{" "}
              {sub.isCompleted ? "Completed" : "Pending"}
            </div>
            {renderSubMilestones(sub.subMilestones)}
          </li>
        ))}
      </ul>
    );
  };

  const selectedPhoto = selectedPhotoId ? photoMap.get(selectedPhotoId) : null;

  return (
    <>
      <div
        className="fixed inset-0 w-full h-full backdrop-blur-lg bg-black/20 flex justify-center items-center z-50"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div
          className="bg-white w-[90%] md:w-[70%] max-h-[90vh] rounded-lg overflow-auto p-6 shadow-xl relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close */}
          <button
            className="absolute top-3 right-3 text-gray-700 hover:text-black"
            onClick={onClose}
          >
            X
          </button>
          
          {/* Delete Button */}
          {onDelete && (
            <button
              className="absolute top-3 right-10 text-red-500 hover:text-red-700 mr-2"
              onClick={() => {
                if (window.confirm("Are you sure you want to delete this milestone?")) {
                  onDelete();
                  onClose();
                }
              }}
            >
              Delete
            </button>
          )}

          {/* Milestone Info */}
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">{milestone.task}</h2>
          <p className="text-gray-600 mb-1">Due: {new Date(milestone.dueDate).toLocaleDateString()}</p>
          <p className="text-gray-600 mb-2">Status: {milestone.isCompleted ? "Completed" : "Pending"}</p>
          {milestone.hobbyTag && <p className="text-gray-600 mb-2">Hobby: {milestone.hobbyTag}</p>}

          {/* Tagged Photos */}
          {taggedPhotos.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold text-gray-700 mb-2">Tagged Photos</h3>
              <div className="flex flex-wrap gap-2">
                {taggedPhotos.map((p) => (
                  <img
                    key={p!.id}
                    src={p!.imageUrl}
                    alt={p!.topic}
                    className="w-20 h-20 object-cover rounded cursor-pointer border border-gray-300"
                    onClick={() => setSelectedPhotoId(p!.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Sub-milestones Section */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-700">Sub-milestones</h3>
              <button
                onClick={() => setIsAddingSubtask(!isAddingSubtask)}
                className="text-sm text-[#b99547] hover:text-[#a07f36] font-medium"
              >
                {isAddingSubtask ? "Cancel" : "+ Add Subtask"}
              </button>
            </div>

            {isAddingSubtask && (
              <div className="bg-gray-50 p-4 rounded-md mb-4 border border-gray-200">
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Task Name</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md text-sm text-gray-900"
                      value={subtaskTask}
                      onChange={(e) => setSubtaskTask(e.target.value)}
                      placeholder="Subtask name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                      <input
                        type="date"
                        className="w-full p-2 border border-gray-300 rounded-md text-sm text-gray-900"
                        value={subtaskDate}
                        onChange={(e) => setSubtaskDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Time</label>
                      <input
                        type="time"
                        className="w-full p-2 border border-gray-300 rounded-md text-sm text-gray-900"
                        value={subtaskTime}
                        onChange={(e) => setSubtaskTime(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={handleAddSubtask}
                      disabled={isCreatingSub}
                      className="bg-[#b99547] text-white px-3 py-1.5 rounded text-sm hover:bg-[#a07f36] disabled:bg-gray-400"
                    >
                      {isCreatingSub ? "Adding..." : "Add Subtask"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {milestone.subMilestones.length > 0 ? (
              renderSubMilestones(milestone.subMilestones)
            ) : (
              !isAddingSubtask && <p className="text-gray-500 text-sm italic">No sub-milestones yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Open selected photo in PhotoCard */}
      {selectedPhoto && (
        <PhotoCard
          imageUrl={selectedPhoto.imageUrl}
          topic={selectedPhoto.topic}
          description={selectedPhoto.description}
          uploadDate={selectedPhoto.uploadDate}
          taggedMilestoneIds={selectedPhoto.taggedMilestoneIds}
          onClose={() => setSelectedPhotoId(null)}
        />
      )}
    </>
  );
};

export default MilestoneCard;
