import React, { useState } from "react";

const UploadPhoto: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [filename, setFilename] = useState("");
  const [description, setDescription] = useState("");
  const [topic, setTopic] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setFilename(selectedFile.name); // default filename to actual file name
    }
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
      // 1️⃣ Request presigned URL
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

      // 2️⃣ Upload file directly to S3
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

      alert("Upload successful!");
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
    <div className="p-6 max-w-lg mx-auto bg-white rounded-2xl shadow-lg">
      <h2 className="text-xl font-bold mb-4">Upload a Photo</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Drop/Select box */}
        <div className="border-2 border-dashed border-gray-400 rounded-lg p-6 text-center cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="fileInput"
          />
          <label htmlFor="fileInput" className="cursor-pointer text-gray-600">
            {file ? file.name : "Click or drag a photo here"}
          </label>
        </div>

        {/* Filename */}
        <input
          type="text"
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
          placeholder="Filename"
          className="w-full p-2 border rounded-lg"
        />

        {/* Description */}
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="w-full p-2 border rounded-lg"
        />

        {/* Topic */}
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Topic"
          className="w-full p-2 border rounded-lg"
        />

        <button
          type="submit"
          disabled={isUploading}
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
        >
          {isUploading ? "Uploading..." : "Upload"}
        </button>
      </form>
    </div>
  );
};

export default UploadPhoto;
