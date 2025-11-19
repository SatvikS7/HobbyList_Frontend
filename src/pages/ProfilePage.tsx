import React, { use, useEffect, useState } from "react";
import EditProfileModal from "../components/EditProfileModal.tsx";
import MilestoneSection from "../components/MilestoneSection.tsx";
import PhotoSection from "../components/PhotoSection.tsx";
import { useProfile } from "../contexts/ProfileContext.tsx";

const API_BASE = import.meta.env.VITE_BACKEND_BASE;

const ProfilePage: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<"photos" | "milestones">("photos");
  const { profile, loading, error, getProfile, refreshProfile , addHobby, invalidateHobbies } = useProfile();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // fetch profile from cache
        const profileData = await getProfile();
        if (!profileData) throw new Error("Failed to fetch profile");
        console.log("Fetched hobbies:", profileData.hobbies);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

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
              onSave={() => {
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
        <PhotoSection />
      ):(
        <MilestoneSection />
      )}
    </div>

  );
};

export default ProfilePage;
