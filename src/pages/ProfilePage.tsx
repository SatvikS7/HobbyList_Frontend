import React, { useEffect, useState } from "react";

type PhotoDto = {
  topic: string;
  imageUrl: string;
  size: number;
  uploadDate: string;
};

const API_BASE = import.meta.env.VITE_BACKEND_BASE;

const ProfilePage: React.FC = () => {
  const [photos, setPhotos] = useState<PhotoDto[]>([]);
  const [filteredPhotos, setFilteredPhotos] = useState<PhotoDto[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>("All");

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const token = sessionStorage.getItem("jwt"); 
        const res = await fetch(`${API_BASE}/photos`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch photos");
        }

        const data: PhotoDto[] = await res.json();
        setPhotos(data);
        setFilteredPhotos(data);

        // Extract unique tags from the photos
        const uniqueTags = Array.from(new Set(data.map((photo) => photo.topic)));
        setTags(uniqueTags);
      } catch (err) {
        console.error(err);
      }
    };

    fetchPhotos();
  }, []);

  // Update filtered photos when selectedTag changes
  useEffect(() => {
    if (selectedTag === "All") {
      setFilteredPhotos(photos);
    } else {
      setFilteredPhotos(photos.filter((photo) => photo.topic === selectedTag));
    }
  }, [selectedTag, photos]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 color">My Photos</h1>

      {/* Tag Dropdown */}
      <div className="mb-6">
        <label htmlFor="tagFilter" className="mr-2 font-medium">
          Filter by tag:
        </label>
        <select
          id="tagFilter"
          className="border rounded px-2 py-1"
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
        >
          <option value="All">All</option>
          {tags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-3 gap-4">
        {filteredPhotos.map((photo, index) => (
          <div
            key={index}
            className="rounded-xl shadow-md overflow-hidden border border-gray-200"
          >
            <img
              src={photo.imageUrl}
              alt={photo.topic}
              className="w-full h-48 object-cover"
            />
            <div className="p-2 text-sm">
              <p className="font-medium">{photo.topic}</p>
              <p className="text-gray-500">
                {new Date(photo.uploadDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfilePage;
