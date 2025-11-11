import React, { use, useEffect, useState } from "react";
import EditProfileModal from "../components/EditProfileModal.tsx";
import HobbyCard from "../components/HobbyCard.tsx";
import MilestoneSection from "../components/MilestoneSection.tsx";
import { useProfile } from "../contexts/ProfileContext.tsx";
import { usePhotos } from "../contexts/PhotoContext";


type PhotoDto = {
  topic: string;
  imageUrl: string;
  description: string;
  uploadDate: string;
};

const API_BASE = import.meta.env.VITE_BACKEND_BASE;

const ProfilePage: React.FC = () => {
  //const [photos, setPhotos] = useState<PhotoDto[]>([]);
  const [filteredPhotos, setFilteredPhotos] = useState<PhotoDto[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>("All");
  //const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  //const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoDto | null>(null);
  const [activeTab, setActiveTab] = useState<"photos" | "milestones">("photos");
  const { profile, loading, error, getProfile, refreshProfile , addHobby, invalidateHobbies } = useProfile();
  const { photos, getPhotos, loading: photosLoading, error: photosError } = usePhotos();


  useEffect(() => {
    const fetchData = async () => {
      try {
        // fetch photos from cache
        const photosData = await getPhotos();
        if (!photosData) throw new Error("Failed to fetch photos");
        if (photosData) setFilteredPhotos(photosData);

        // fetch profile from cache
        const profileData = await getProfile();
        if (!profileData) throw new Error("Failed to fetch profile");
        if (profileData) {
          setTags(profileData.hobbies);
        }
        console.log("Fetched hobbies:", profileData.hobbies);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);


  useEffect(() => {
    if (selectedTag === "All") {
      setFilteredPhotos(photos ?? []);
    } else {
      setFilteredPhotos((photos ?? []).filter((photo) => photo.topic === selectedTag));
    }
  }, [selectedTag, photos]);

  if (loading && !profile) {
    return <div className="loading-screen">Loading profile...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!profile) {
    return <div className="text-gray-700">No profile data available.</div>;
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
            {profile?.displayName || "Username"}
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
                displayName: profile.displayName,
                isPrivate: profile.isPrivate,
                hobbies: profile.hobbies,
              }}
              onClose={() => setIsEditing(false)}
              onSave={(updatedProfile) => {
                refreshProfile().catch(console.error);
                setIsEditing(false);
              }}
            />
          )}
        </div>
      </div>

      <hr className="my-6 border-t border-gray-300" />

      {/* Tabs */}
      <div className="flex gap-6 mt-10 mb-6">
        <button
          className={`px-4 py-2 rounded-md transition-all ${
            activeTab === "photos" 
            ? "bg-[#b99547] text-white" 
            : "text-gray-800 hover:bg-gray-200"
          }`}
          onClick={() => setActiveTab("photos")}
        >
          Photos
        </button>

        <button
          className={`px-4 py-2 rounded-md transition-all ${
            activeTab === "milestones" 
            ? "bg-[#b99547] text-white" 
            : "text-gray-800 hover:bg-gray-200"
          }`}
          onClick={() => setActiveTab("milestones")}
        >
          Milestones
        </button>
      </div>
      {/* Tab Content */}
      {activeTab === "photos" ? (
        <>
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
              </div>
            ))}
          </div>

          {selectedPhoto && (
            <HobbyCard
              imageUrl={selectedPhoto.imageUrl}
              topic={selectedPhoto.topic}
              description={selectedPhoto.description}
              uploadDate={selectedPhoto.uploadDate}
              onClose={() => setSelectedPhoto(null)}
            />
          )}
        </>
        
      ):(
        <MilestoneSection />
      )}
    </div>

  );
};

export default ProfilePage;
