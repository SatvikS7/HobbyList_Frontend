// Milestone Section
import React, { useEffect, useState } from "react";
import { useProfile } from "../contexts/ProfileContext";
import { usePhotos } from "../contexts/PhotoContext";

type MilestoneDto = {
  id: number;
  task: string;
  dueDate: string;
  isCompleted: boolean;
  parentId: number | null;
  subMilestones: MilestoneDto[];
  taggedPhotoIds: number[];
  hobbyTag: string | null;
};

const API_BASE = import.meta.env.VITE_BACKEND_BASE;

const MilestoneSection: React.FC = () => {
  const [milestones, setMilestones] = useState<MilestoneDto[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTask, setNewTask] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [newDueTime, setNewDueTime] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [parentId, setParentId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [hobbyTag, setHobbyTag] = useState<string | null>(null);
  const {profile, getProfile, refreshProfile, invalidateHobbies} = useProfile();
  const {photos, getPhotos} = usePhotos();
  const [tags, setTags] = useState<string[]>([]);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<number[]>([]);
  //const [selectedTag, setSelectedTag] = useState<string>("All");
  //const [filteredMilestones, setFilteredMilestones] = useState<MilestoneDto[]>([]);
  //const [flatMilestones, setFlatMilestones] = useState<MilestoneDto[]>([]);

  const fetchParentMilestones = async () => {
    const token = sessionStorage.getItem("jwt");
    const res = await fetch(`${API_BASE}/milestones`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    console.log("Fetched milestones:", data);
    setMilestones(data);
  };

  /* FILTERING WIP - GET ALL MILESTONES
  const fetchAllMilestones = async () => {
    const token = sessionStorage.getItem("jwt");
    const res = await fetch(`${API_BASE}/milestones/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    console.log("Fetched all milestones:", data);
    setFilteredMilestones(data);
    setFlatMilestones(data);
  };
  */

  const fetchMilestones = async () => {
    await Promise.all([/*fetchAllMilestones(), */fetchParentMilestones()]);
  }

  useEffect(() => {
    fetchMilestones();
  }, []);

  useEffect(() => {
      const loadHobbies = async () => {
        console.log("Loading hobbies for upload photo");
        try {
          const p = profile ?? (await getProfile());
          if (p) setTags(p.hobbies);
        } catch (error) {
          console.error("Failed to load hobbies:", error);
        }
      };
      loadHobbies();
  }, [profile, getProfile]);

  /* FILTERING WIP

  useEffect(() => {
    if (selectedTag === "All") {
      setFilteredMilestones(milestones);
    } else {
      setFilteredMilestones(
        flatMilestones.filter((m) => m.hobbyTag === selectedTag)
      );
    }
  }, [selectedTag, flatMilestones, milestones]);
  */
  /*
  const handleHobbyTagChange = (value: string) => {
    setHobbyTag(value);
  };
  */

  const handleCreateMilestone = async () => {
    if (!newTask.trim() || !newDueDate || !newDueTime) {
      alert("Please fill out all fields.");
      return;
    }

    // Construct OffsetDateTime (ISO 8601 with timezone offset)
    const combinedDateTime = `${newDueDate}T${newDueTime}:00${getLocalTimezoneOffset()}`;

    const milestoneData: MilestoneDto = {
      id: 0,
      task: newTask,
      dueDate: combinedDateTime,
      isCompleted,
      parentId: parentId,
      subMilestones: [],
      taggedPhotoIds: selectedPhotoIds,
      hobbyTag: hobbyTag,
    };
    try {
      setLoading(true);
      const token = sessionStorage.getItem("jwt");
      const res = await fetch(`${API_BASE}/milestones/create-milestone`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(milestoneData),
      });

      if (!res.ok) throw new Error("Failed to create milestone");
      const createdMilestone: MilestoneDto = await res.json();

      // Refresh local milestone list
      await fetchMilestones();

      if (hobbyTag != null && !tags.includes(hobbyTag)) {
        await refreshProfile();
      }
      resetModal();
    } catch (err) {
      console.error(err);
      alert("Error creating milestone");
    } finally {
      setLoading(false);
    }
  };

  const deleteMilestone = async (id: number) => {
    const token = sessionStorage.getItem("jwt");
    const res = await fetch(`${API_BASE}/milestones/delete-milestone/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      console.error("Failed to delete milestone");
      alert("Error deleting milestone");
      return;
    }

    // Refresh local milestone list
    await fetchMilestones();
    resetModal();
  };

  const getLocalTimezoneOffset = () => {
    const offsetMinutes = new Date().getTimezoneOffset();
    const sign = offsetMinutes > 0 ? "-" : "+";
    const hours = String(Math.floor(Math.abs(offsetMinutes) / 60)).padStart(
      2,
      "0"
    );
    const minutes = String(Math.abs(offsetMinutes) % 60).padStart(2, "0");
    return `${sign}${hours}:${minutes}`;
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // yyyy-mm-dd
  };

  const getParentDueDate = () => {
    if (parentId == null) return null;

    const parent = milestones.find((m) => m.id === parentId);
    if (!parent) return null;

    // parent.dueDate is ISO string—extract yyyy-mm-dd
    return parent.dueDate.split("T")[0];
  };

  const resetModal = () => {
    setNewTask("");
    setNewDueDate("");
    setNewDueTime("");
    setIsCompleted(false);
    setShowAddModal(false);
    setParentId(null);
    setHobbyTag(null);
    setSelectedPhotoIds([])
  };

  // Recursive component (child milestones expand below parent)
  const MilestoneItem: React.FC<{
    milestone: MilestoneDto;
    refresh: () => void;
  }> = ({ milestone, refresh }) => {
    const [expanded, setExpanded] = useState(false);

    const handleCreateSubtaskClick = () => {
      setParentId(milestone.id); // set this milestone as parent
      setShowAddModal(true); // open modal
    };

    return (
      <li className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="flex justify-between items-center">
          <span
            className="cursor-pointer font-medium text-gray-800 hover:text-[#b99547] transition"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "▼" : "▶"} {milestone.task}
          </span>

          <div className="flex gap-3 text-lg font-semibold">
            <button
              className="text-[#b99547] hover:text-[#a07f36] transition"
              onClick={handleCreateSubtaskClick}
            >
              +
            </button>

            <button
              className="text-red-500 hover:text-red-700 transition"
              onClick={() => deleteMilestone(milestone.id)}
            >
              −
            </button>
          </div>
        </div>

        {expanded && milestone.subMilestones?.length > 0 && (
          <ul className="pl-6 mt-3 border-l-2 border-[#b99547]/50 space-y-3">
            {milestone.subMilestones.map((sub) => (
              <MilestoneItem key={sub.id} milestone={sub} refresh={refresh} />
            ))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <div className="text-gray-900 p-6 max-w-6xl mx-auto bg-white rounded-xl shadow-md space-y-6">
      <div className="flex justify-between items-center mt-4">
        <h2 className="text-2xl font-bold text-gray-900">My Milestones</h2>
        {/*     FILTERING WIP - ELEMENT
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
          */}

        <button
          className="px-4 py-2 bg-[#b99547] text-white rounded-md hover:bg-[#a07f36] shadow-sm transition"
          onClick={() => setShowAddModal(true)}
        >
          + Add Milestone
        </button>
      </div>

      {/* Root level list */}
      <ul className="space-y-3">
        {milestones.map((m) => (
          <MilestoneItem key={m.id} milestone={m} refresh={fetchMilestones} />
        ))}
      </ul>

      {/* Modal for creating milestone */}
      {showAddModal && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) resetModal();
          }}
        >
          <div className="bg-white p-6 rounded-xl shadow-lg w-96 border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Create Milestone
            </h3>

            <label className="block mb-1 text-sm font-medium text-gray-700">Task</label>
            <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#b99547]"
                placeholder="Enter task name"
            />

            <label className="block mb-1 text-sm font-medium text-gray-700">Due Date</label>
            <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                min={getTodayDate()}
                max={getParentDueDate() || undefined}
                className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#b99547]"
            />

            <label className="block mb-1 text-sm font-medium text-gray-700">Due Time</label>
            <input
                type="time"
                value={newDueTime}
                onChange={(e) => setNewDueTime(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#b99547]"
            />

            <input
              list="hobby-list"
              value={hobbyTag || ""}
              onChange={(e) => setHobbyTag(e.target.value)}
              placeholder="Topic (select or type)"
              className="w-full p-2 border border-black rounded bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#b99547]"
            />
            <datalist id="hobby-list">
              {tags.map((tag) => (
                <option key={tag} value={tag} />
              ))}
            </datalist>

            {selectedPhotoIds.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700">Selected Photos:</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedPhotoIds.map((id) => (
                    <span
                      key={id}
                      className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-sm"
                    >
                      #{id}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <label className="block mb-1 text-sm font-medium text-gray-700">Tag Photos</label>
            <select
              multiple
              className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 text-gray-900"
              size={5} 
              value={selectedPhotoIds.map(String)}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions).map((opt) =>
                  Number(opt.value)
                );
                setSelectedPhotoIds(selected);
              }}
            >
              {(photos ?? []).map((p) => (
                <option key={p.id} value={p.id}>
                  Photo #{p.id}
                </option>
              ))}
            </select>

            <label className="flex items-center gap-2 mb-4 text-gray-800">
                <input type="checkbox"
                    checked={isCompleted}
                    onChange={(e) => setIsCompleted(e.target.checked)}
                />
                Mark as completed
            </label>

            <div className="flex justify-end gap-3">
                <button
                    className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 transition"
                    onClick={resetModal}
                    disabled={loading}
                >
                    Cancel
                </button>
                <button
                    className="px-4 py-2 rounded-md bg-[#b99547] text-white hover:bg-[#a07f36] transition"
                    onClick={handleCreateMilestone}
                    disabled={loading}
                >
                    {loading ? "Saving..." : "Create"}
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default MilestoneSection;
