import React, { use, useEffect, useState } from "react";
import EditProfileModal from "../components/EditProfileModal.tsx";

type PhotoDto = {
  topic: string;
  imageUrl: string;
  description: string;
  uploadDate: string;
};

type UserProfile = {
  profileURL: string | null;
  description: string;
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

        setPhotos(photosData);
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
    <div className="profile-container">
      {/* Profile Section */}
      <div className="profile-header">
        <img
          src={profile?.profileURL || "../src/assets/default-avatar.png"}
          alt="Profile"
          className="profile-picture"
        />
        <div className="profile-info">
          <p className="profile-description">
            {profile?.description || "No description set yet."}
          </p>
          <button
            className="edit-profile-button"
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </button>
          {isEditing && profile && (
            <EditProfileModal
              profile={{ profileURL: profile.profileURL, description: profile.description }}
              onClose={() => setIsEditing(false)}
              onSave={(updatedProfile) => {
                setProfile({
                  profileURL: updatedProfile.profileURL,
                  description: updatedProfile.description,
                });
                setIsEditing(false);
              }}
            />
          )}
        </div>
      </div>

      <hr className="divider" />

      {/* Photos Section */}
      <h1 className="photos-title">My Photos</h1>
      <div className="filter-container">
        <label htmlFor="tagFilter" className="filter-label">Filter by tag:</label>
        <select
          id="tagFilter"
          className="filter-dropdown"
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
        >
          <option value="All">All</option>
          {tags.map((tag) => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
      </div>

      <div className="photo-grid">
        {filteredPhotos.map((photo, index) => (
          <div key={index} className="photo-card">
            <img src={photo.imageUrl} alt={photo.topic} className="photo-image" />
            <div className="photo-details">
              <p className="photo-topic">{photo.topic}</p>
              <p className="photo-date">
                {new Date(photo.uploadDate).toLocaleDateString()}
              </p>
              <p>{photo.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfilePage;
