import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useProfile } from "../contexts/ProfileContext";
import EditProfileModal from "../components/EditProfileModal";
import MilestoneSection from "../components/MilestoneSection";
import PhotoSection from "../components/PhotoSection";

function ProfilePage() {
  const { profile, getProfile, updateProfileState } = useProfile();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    getProfile();
  }, [getProfile]);

  // Tab state managed by URL params
  const activeTab = searchParams.get("tab") || "photos";

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#b99547]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="relative h-32 w-full bg-gradient-to-r from-[#fadd9e] to-[#b99547]"></div>
          <div className="px-6 pb-6">
            <div className="relative flex items-end -mt-12 mb-4">
              <div className="relative">
                <img
                  src={profile.profileURL || "src/assets/default-avatar.png"}
                  alt="Profile"
                  className="h-24 w-24 rounded-full border-4 border-white object-cover bg-white"
                />
              </div>
              <div className="ml-4 mb-1 flex-1">
                <h1 className="text-2xl font-bold text-gray-900">
                  {profile.displayName}
                </h1>
              </div>
              <div>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#b99547]"
                >
                  Edit Profile
                </button>
              </div>
            </div>

            {/* Hobbies */}
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                Hobbies & Interests
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.hobbies && profile.hobbies.length > 0 ? (
                  profile.hobbies.map((hobby, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-[#f5e6c8] text-[#785c16]"
                    >
                      {hobby}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400 text-sm">No hobbies added yet.</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden min-h-[500px]">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => handleTabChange("photos")}
                className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                  activeTab === "photos"
                    ? "border-[#b99547] text-[#b99547]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                My Photos
              </button>
              <button
                onClick={() => handleTabChange("milestones")}
                className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                  activeTab === "milestones"
                    ? "border-[#b99547] text-[#b99547]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Milestones
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "photos" && <PhotoSection />}

            {activeTab === "milestones" && <MilestoneSection />}
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <EditProfileModal
          profile={profile}
          onClose={() => setIsEditModalOpen(false)}
          onSave={(updatedProfile) => {
            updateProfileState(updatedProfile);
          }}
        />
      )}
    </div>
  );
}

export default ProfilePage;
