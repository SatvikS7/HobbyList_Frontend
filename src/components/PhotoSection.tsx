import React, { useEffect, useState } from "react";
import { usePhotoMilestone } from "../contexts/PhotoMilestoneContext.tsx";
import PhotoCard from "../components/PhotoCard.tsx";
import { type PhotoDto } from "../types";

type PhotoSectionProps = {
  initialTag?: string;
  photos?: PhotoDto[];
};

const PhotoSection: React.FC<PhotoSectionProps> = ({ initialTag = "All", photos: propPhotos }) => {
  const { photos: contextPhotos, getPhotos } = usePhotoMilestone();
  
  // Use props if available, otherwise fallback to context
  const photos = propPhotos || contextPhotos;

  const [filteredPhotos, setFilteredPhotos] = useState<PhotoDto[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>(initialTag);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoDto | null>(null);

  // Fetch photos from cache or backend (only if using context)
  const fetchPhotos = async () => {
    if (propPhotos) {
        setFilteredPhotos(propPhotos);
        const uniqueTags = Array.from(new Set(propPhotos.map((p) => p.topic)));
        setTags(uniqueTags);
        return;
    }

    try {
      const data = await getPhotos();
      if (data) {
        setFilteredPhotos(data);
        // extract unique tags for filter
        const uniqueTags = Array.from(new Set(data.map((p) => p.topic)));
        setTags(uniqueTags);
      }
    } catch (err) {
      console.error("Failed to fetch photos", err);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, [propPhotos]); // Re-run if propPhotos changes

  // Filter photos by tag
  useEffect(() => {
    if (selectedTag === "All") {
      setFilteredPhotos(photos ?? []);
    } else {
      setFilteredPhotos((photos ?? []).filter((p) => p.topic === selectedTag));
    }
  }, [selectedTag, photos]);

  return (
    <div>
      {/* Filter */}
      <div className="mb-6 flex items-center gap-2">
        <label htmlFor="tagFilter" className="font-medium text-gray-800">
          Filter by tag:
        </label>
        <select
          id="tagFilter"
          className="border border-gray-300 rounded px-2 py-1 text-black"
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
        >
          <option value="All">All</option>
          {tags.map((tag) => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
      </div>

      {/* Photo grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredPhotos.map((photo, idx) => (
          <div
            key={idx}
            className="rounded-xl shadow-md overflow-hidden border border-gray-200 cursor-pointer"
            onClick={() => setSelectedPhoto(photo)}
          >
            <img
              src={photo.imageUrl}
              alt={photo.topic}
              className="w-full h-48 object-cover"
            />
          </div>
        ))}
      </div>

      {/* Photo modal */}
      {selectedPhoto && (
        <PhotoCard
          imageUrl={selectedPhoto.imageUrl}
          topic={selectedPhoto.topic}
          description={selectedPhoto.description}
          uploadDate={selectedPhoto.uploadDate}
          taggedMilestoneIds={selectedPhoto.taggedMilestoneIds}
          onClose={() => setSelectedPhoto(null)}
        />
      )}
    </div>
  );
};

export default PhotoSection;
