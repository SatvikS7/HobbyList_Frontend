import React, { useEffect, useState } from "react";
import { useProfile } from "../contexts/ProfileContext";
import { usePhotos } from "../contexts/PhotoContext";

const UploadPhoto: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [filename, setFilename] = useState("");
  const [description, setDescription] = useState("");
  const [topic, setTopic] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { profile, getProfile, refreshProfile, invalidateHobbies } = useProfile();
  const [hobbies, setHobbies] = useState<string[]>([]);
  const { invalidatePhotos } = usePhotos();

  useEffect(() => {
    const loadHobbies = async () => {
      console.log("Loading hobbies for upload photo");
      try {
        const p = profile ?? (await getProfile());
        if (p) setHobbies(p.hobbies);
      } catch (error) {
        console.error("Failed to load hobbies:", error);
      }
    };
    loadHobbies();
  }, [profile, getProfile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setFilename(selectedFile.name); // default filename to actual file name
    }
  };

  const handleTopicChange = (value: string) => {
    setTopic(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert("Please select a file before submitting.");
      return;
    }

    try {
      setIsUploading(true);

      const token = sessionStorage.getItem("jwt");
      if (!token) {
        alert("Not authenticated");
        return;
      }

      const getURLPayload = {
        filename,
        contentType: file.type,
      };
      // Request presigned URL
      const presignResponse = await fetch("http://localhost:8080/api/photos/get-upload-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(getURLPayload),
      });

      if (!presignResponse.ok) {
        throw new Error("Failed to get presigned URL");
      }

      const uploadUrl = await presignResponse.text(); // backend returns URL as plain string

      // Upload file directly to S3
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file to S3");
      }

      // 3️⃣ Notify backend with metadata
      console.log("Description before payload:", description);

      const saveUrlPayload = {
        topic,
        imageUrl: uploadUrl.split("?")[0], // clean S3 URL without query params
        filename,
        size: file.size,
        contentType: file.type,
        description,
        uploadDate: new Date().toISOString(),
      };

      const saveResponse = await fetch("http://localhost:8080/api/photos/save-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(saveUrlPayload),
      });

      if (!saveResponse.ok) {
        throw new Error("Failed to save photo metadata");
      }

      invalidatePhotos();
      alert("Upload successful!");
      if (!hobbies.includes(topic)) {
        await refreshProfile();
      }
      setFile(null);
      setFilename("");
      setDescription("");
      setTopic("");
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Check console for details.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-gradient-to-br from-[#fadd9e] to-[#daba76] rounded-[16px] shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-black">Upload a Photo</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Drop/Select box */}
        <label
          htmlFor="fileInput"
          className="block cursor-pointer border-2 border-dashed border-black rounded-lg p-6 text-center bg-white text-black"
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="fileInput"
          />
          {file ? file.name : "Click or drag a photo here"}
        </label>

        {/* Description */}
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="w-full p-2 border border-black rounded bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#b99547]"
        />

        {/* Topic */}
        <input
          list="hobby-list"
          value={topic}
          onChange={(e) => handleTopicChange(e.target.value)}
          placeholder="Topic (select or type)"
          className="w-full p-2 border border-black rounded bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#b99547]"
        />
        <datalist id="hobby-list">
          {hobbies.map((hobby) => (
            <option key={hobby} value={hobby} />
          ))}
        </datalist>

        <button
          type="submit"
          disabled={isUploading}
          className="w-full py-2 rounded-lg bg-[#b99547] text-white font-semibold hover:bg-[#a07f36] transition-colors duration-200"
        >
          {isUploading ? "Uploading..." : "Upload"}
        </button>
      </form>
    </div>
  );

};

export default UploadPhoto;
