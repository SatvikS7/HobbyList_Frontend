import React, { useState } from "react";

type ProfileDto = {
    profileURL: string | null;
    description: string;
    username: string;
    isPrivate: boolean;
    hobbies: string[];
}

type EditProfileModalProps = {
  profile: { profileURL: string | null; description: string; username: string; isPrivate: boolean; hobbies: string[] } | ProfileDto | null;
  onClose: () => void;
  onSave: (updatedProfile: { profileURL: string | null; description: string; username: string; isPrivate: boolean; hobbies: string[] }) => void;
};

const API_BASE = import.meta.env.VITE_BACKEND_BASE;

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  profile,
  onClose,
  onSave,
}) => {
  const [newDescription, setNewDescription] = useState(
    profile?.description || ""
  );
  const [newFile, setNewFile] = useState<File | null>(null);
  const [newUsername, setNewUsername] = useState(profile?.username || "");
  const [isPrivate, setIsPrivate] = useState(profile?.isPrivate ?? false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewFile(e.target.files[0]);
    }
  };

  const handleSave = async () => {
    const token = sessionStorage.getItem("jwt");

    try {
      // Update profile picture if a new one is selected
      if (newFile) {
        const ext = newFile.name.split(".").pop();
        const presignRes = await fetch(`${API_BASE}/profile/get-upload-url`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            filename: `profile.${ext}`,
            contentType: newFile.type,
          }),
        });
        const uploadUrl = await presignRes.text();

        // Upload directly to S3
        await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": newFile.type },
          body: newFile,
        });

        // Save photo metadata
        await fetch(`${API_BASE}/profile/save-url`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            imageUrl: uploadUrl.split("?")[0],
            uploadDate: new Date().toISOString(),
            filename: `profile.${ext}`,
            size: newFile.size,
            contentType: newFile.type,
          }),
        });
      }

      const updates: Record<string, any> = {};

      if (newUsername && newUsername !== profile?.username) {
        updates.username = newUsername.trim();
      }

      if (newDescription && newDescription !== profile?.description) {
        // Clean up invisible or multiline chars
        const cleanedDescription = newDescription
          .replace(/\s+/g, " ")
          .trim();
        updates.description = cleanedDescription;
      }
      if (isPrivate !== profile?.isPrivate) {
        updates.isPrivate = isPrivate;
      }
      console.log(updates);

      if (Object.keys(updates).length > 0) {
        const res = await fetch(`${API_BASE}/profile/update-profile`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updates),
        });

        if (!res.ok) throw new Error("Failed to update profile");
      }

      // Fetch the updated profile data
      const updatedProfile = await fetch(`${API_BASE}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!updatedProfile.ok) throw new Error("Failed to fetch updated profile");
      const updatedProfileData: ProfileDto = await updatedProfile.json();

      onSave(updatedProfileData);
      onClose();
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Edit Profile</h2>
        <div className="modal-content">
          <div className="profile-preview">
            {profile?.profileURL ? (
              <img
                src={profile.profileURL}
                alt="Profile"
                className="profile-picture-preview"
              />
            ) : (
              <div className="profile-placeholder">No Profile Picture</div>
            )}
            <input type="file" accept="image/*" onChange={handleFileChange} />
          </div>

          <textarea
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Update your description"
          />
          <textarea
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            placeholder="Update your username"
          />
          <div className="privacy-toggle">
            <label>
              Private Profile
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
              />
            </label>
          </div>

          <div className="modal-actions">
            <button onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button onClick={handleSave} className="save-button">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
