import React, { useState } from "react";
import { usePhotoMilestone } from "../contexts/PhotoMilestoneContext";
import PhotoCard from "./PhotoCard";

type MilestoneDto = {
  id: number;
  task: string;
  dueDate: string;
  isCompleted: boolean;
  parentId: number | null;
  subMilestones: MilestoneDto[];
  taggedPhotoIds: number[];
  hobbyTag: string | null;
};

interface MilestoneCardProps {
  milestone: MilestoneDto;
  onClose: () => void;
}

const MilestoneCard: React.FC<MilestoneCardProps> = ({ milestone, onClose }) => {
  const { milestoneMap, photoMap } = usePhotoMilestone();
  const [selectedPhotoId, setSelectedPhotoId] = useState<number | null>(null);

  const taggedPhotos = milestone.taggedPhotoIds
    .map((id) => photoMap.get(id))
    .filter(Boolean);

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
        className="fixed inset-0 w-full h-full backdrop-blur-lg bg-black/20 flex justify-center items-center"
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

          {/* Sub-milestones recursively */}
          {milestone.subMilestones.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold text-gray-700 mb-2">Sub-milestones</h3>
              {renderSubMilestones(milestone.subMilestones)}
            </div>
          )}
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
