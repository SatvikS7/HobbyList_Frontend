import React from "react";

interface HobbyCardProps {
  imageUrl: string;
  topic: string;
  description: string;
  uploadDate: string;
  onClose: () => void;
}

const HobbyCard: React.FC<HobbyCardProps> = ({
  imageUrl,
  topic,
  description,
  uploadDate,
  onClose,
}) => {
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
        </div>
      </div>
    </div>
  );
};

export default HobbyCard;
