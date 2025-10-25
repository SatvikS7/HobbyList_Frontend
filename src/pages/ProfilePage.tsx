import React, { use, useEffect, useState } from "react";
import EditProfileModal from "../components/EditProfileModal.tsx";
import HobbyCard from "../components/HobbyCard.tsx";

type PhotoDto = {
  topic: string;
  imageUrl: string;
  description: string;
  uploadDate: string;
};

type UserProfile = {
  profileURL: string | null;
  description: string;
  username: string;
  isPrivate: boolean;
  hobbies: string[];
};

const API_BASE = import.meta.env.VITE_BACKEND_BASE;

const ProfilePage: React.FC = () => {
  const [photos, setPhotos] = useState<PhotoDto[]>([]);
  const [filteredPhotos, setFilteredPhotos] = useState<PhotoDto[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>("All");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoDto | null>(null);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = sessionStorage.getItem("jwt");
        const [photosRes, profileRes] = await Promise.all([
          fetch(`${API_BASE}/photos`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!photosRes.ok) throw new Error("Failed to fetch photos");
        if (!profileRes.ok) throw new Error("Failed to fetch profile");

        const photosData: PhotoDto[] = await photosRes.json();
        const profileData: UserProfile = await profileRes.json();
        console.log("Fetched hobbies:", profileData.hobbies);
        setPhotos(photosData);
        // print all photo descriptions
        photosData.forEach(photo => console.log(photo.description));
        setFilteredPhotos(photosData);
        setTags(Array.from(new Set(photosData.map((photo) => photo.topic))));
        setProfile(profileData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  useEffect(() => {
    if (selectedTag === "All") {
      setFilteredPhotos(photos);
    } else {
      setFilteredPhotos(photos.filter((photo) => photo.topic === selectedTag));
    }
  }, [selectedTag, photos]);

  if (loading) {
    return <div className="loading-screen">Loading profile...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Profile Section */}
      <div className="flex items-center gap-6 mt-16 mb-4">
        <img
          src={profile?.profileURL || "../src/assets/default-avatar.png"}
          alt="Profile"
          className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
        />
        <div className="flex flex-col gap-2">
          <h1 className="text-lg text-gray-800 font-medium">
            {profile?.username || "Username"}
          </h1>
          <p className="text-gray-700">{profile?.description || "No description set yet."}</p>
          <button
            className="px-4 py-2 rounded-md bg-[#b99547] text-white hover:bg-[#a07f36]"
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </button>

          {isEditing && profile && (
            <EditProfileModal
              profile={{
                profileURL: profile.profileURL,
                description: profile.description,
                username: profile.username,
                isPrivate: profile.isPrivate,
                hobbies: profile.hobbies,
              }}
              onClose={() => setIsEditing(false)}
              onSave={(updatedProfile) => {
                setProfile({
                  profileURL: updatedProfile.profileURL,
                  description: updatedProfile.description,
                  username: updatedProfile.username,
                  isPrivate: updatedProfile.isPrivate,
                  hobbies: updatedProfile.hobbies,
                });
                setIsEditing(false);
              }}
            />
          )}
        </div>
      </div>

      <hr className="my-6 border-t border-gray-300" />

      {/* Photos Section */}
      <h1 className="text-2xl font-bold mb-4 text-gray-900">My Photos</h1>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredPhotos.map((photo, index) => (
          <div 
            key={index}
            className="rounded-xl shadow-md overflow-hidden border border-gray-200"
            onClick={() => setSelectedPhoto(photo)}>
            <img
              src={photo.imageUrl}
              alt={photo.topic}
              className="w-full h-48 object-cover"
            />
            {/*
            <div className="p-2 text-sm text-gray-800">
              <p className="font-medium">{photo.topic}</p>
              <p className="text-gray-500">{new Date(photo.uploadDate).toLocaleDateString()}</p>
              <p className="text-black">{photo.description}</p>
            </div>*/}

            {selectedPhoto && (
              <HobbyCard
                imageUrl={selectedPhoto.imageUrl}
                topic={selectedPhoto.topic}
                description={selectedPhoto.description}
                uploadDate={selectedPhoto.uploadDate}
                onClose={() => setSelectedPhoto(null)}
              />
            )}
          </div>
        ))}
      </div>
    </div>

  );
};

export default ProfilePage;
