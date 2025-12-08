import React, { useState } from "react";
import { type ProfileDto } from "../../../backend/src/types";

type EditProfileModalProps = {
  profile: ProfileDto | null;
  onClose: () => void;
  onSave: (updatedProfile: ProfileDto) => void;
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
  const [newUsername, setNewUsername] = useState(profile?.displayName || "");
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
        const presignRes = await fetch(`${API_BASE}/profile/upload-url`, {
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
        console.log(presignRes);
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

      if (newUsername && newUsername !== profile?.displayName) {
        updates.displayName = newUsername.trim();
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
        const res = await fetch(`${API_BASE}/profile`, {
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
        method: "GET",
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
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[2000]"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-xl shadow-lg w-[400px] max-w-[90%] p-6 text-black">
        <h2 className="text-2xl font-semibold mb-4 text-[#b99547] text-center">
          Edit Profile
        </h2>

        <div className="flex flex-col gap-4">
          {/* Profile Picture Preview */}
          <div className="flex flex-col items-center">
            {profile?.profileUrl ? (
              <img
                src={profile.profileUrl}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border border-gray-300 mb-2"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 mb-2">
                No Profile Picture
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="text-sm text-gray-700"
            />
          </div>

          {/* Description */}
          <textarea
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Update your description"
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-[#b99547] focus:outline-none"
          />

          {/* Username */}
          <textarea
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            placeholder="Update your username"
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-[#b99547] focus:outline-none"
          />

          {/* Privacy Toggle */}
          <div className="flex items-center justify-between text-black">
            <label className="font-medium">Private Profile</label>
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="w-5 h-5 accent-[#b99547] cursor-pointer"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-black transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-md bg-[#b99547] hover:bg-[#a07f36] text-black font-medium transition"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );

};

export default EditProfileModal;
