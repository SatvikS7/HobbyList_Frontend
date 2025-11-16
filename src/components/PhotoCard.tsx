import React from "react";
import { usePhotoMilestone } from "../contexts/PhotoMilestoneContext";

interface PhotoCardProps {
  imageUrl: string;
  topic: string;
  description: string;
  uploadDate: string;
  taggedMilestoneIds: number[];
  onClose: () => void;
}

const PhotoCard: React.FC<PhotoCardProps> = ({
  imageUrl,
  topic,
  description,
  uploadDate,
  taggedMilestoneIds,
  onClose,
}) => {
  const { milestoneMap } = usePhotoMilestone();
  const taggedMilestones = taggedMilestoneIds
    .map(id => milestoneMap.get(id))
    .filter(Boolean);
  console.log("Tagged Milestones:", taggedMilestoneIds);

  return (
    <div
      className="fixed inset-0 w-full h-full backdrop-blur-lg bg-black/20 flex justify-center items-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white w-[90%] md:w-[70%] max-h-[90vh] rounded-lg overflow-hidden flex flex-col md:flex-row shadow-xl relative"
        onClick={(e) => e.stopPropagation()} // Prevent modal click from closing
      >
        {/* Close X Button */}
        <button
          className="absolute top-3 right-3 text-gray-700 hover:text-black"
          onClick={onClose}
        >
          X
        </button>

        {/* Image Section */}
        <img
          src={imageUrl}
          alt={topic}
          className="w-full md:w-1/2 h-80 md:h-auto object-cover"
        />

        {/* Details Section */}
        <div className="flex flex-col p-4 gap-4 w-full md:w-1/2 text-black">
          <div>
            <h2 className="text-xl font-semibold">{topic}</h2>
            <p className="text-sm text-gray-500">
              {new Date(uploadDate).toLocaleDateString()}
            </p>
          </div>

          <p className="text-gray-800 text-sm">
            {description}
          </p>

          {/* Tagged Milestones */}
          {taggedMilestones.length > 0 && (
            <div className="mt-2">
              <h3 className="font-semibold text-gray-700 mb-1">Tagged Milestones</h3>
              <ul className="list-disc list-inside text-sm text-gray-800">
                {taggedMilestones.map(m => (
                  <li key={m!.id}>{m!.task}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotoCard;
