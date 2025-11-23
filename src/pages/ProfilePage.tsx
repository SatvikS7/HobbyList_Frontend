import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useProfile } from "../contexts/ProfileContext";
import EditProfileModal from "../components/EditProfileModal";
import MilestoneSection from "../components/MilestoneSection";
import { usePhotoMilestone } from "../contexts/PhotoMilestoneContext";

function ProfilePage() {
  const { profile, getProfile, updateProfileState } = useProfile();
  const { photos, getPhotos, loadingPhotos, errorPhotos } = usePhotoMilestone();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    getPhotos();
    getProfile();
  }, [getPhotos, getProfile]);

  // Tab state managed by URL params
  const activeTab = searchParams.get("tab") || "photos";

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  // Filter photos by user's hobbies/topics if needed, or just show all user's photos
  // Assuming 'photos' from context are all photos. If we want only user's photos, backend should filter or we filter here.
  // For now, let's assume 'photos' contains all photos and we might want to show only those related to user's hobbies or uploaded by user.
  // But the requirement says "Profile Page", usually showing user's own content.
  // The current implementation of getPhotos fetches ALL photos.
  // We might need to filter by user ID if we had it, or maybe the backend 'getPhotos' returns all public photos.
  // Let's stick to the previous behavior but cleaner.

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
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
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
                      className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
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
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                My Photos
              </button>
              <button
                onClick={() => handleTabChange("milestones")}
                className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                  activeTab === "milestones"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Milestones
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "photos" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {loadingPhotos ? (
                  <div className="col-span-full flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  </div>
                ) : errorPhotos ? (
                  <div className="col-span-full text-center py-12 text-red-500">
                    Error loading photos: {errorPhotos}
                  </div>
                ) : photos && photos.length > 0 ? (
                  photos.map((photo) => (
                    <div key={photo.id} className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={photo.imageUrl}
                        alt={photo.description || "User photo"}
                        className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300 flex items-end p-4">
                        <p className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm truncate w-full">
                          {photo.description}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    No photos uploaded yet.
                  </div>
                )}
              </div>
            )}

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
