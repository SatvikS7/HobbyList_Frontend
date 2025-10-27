// Milestone Section
import React, { useEffect, useState } from "react";

type MilestoneDto = {
  id: number;
  task: string;
  dueDate: string;
  isCompleted: boolean;
  parentId: number | null;
  subMilestones: MilestoneDto[];
  taggedPhotoId: number | null;
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

  const fetchMilestones = async () => {
    const token = sessionStorage.getItem("jwt");
    const res = await fetch(`${API_BASE}/milestones`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    console.log("Fetched milestones:", data);
    setMilestones(data);
  };

  useEffect(() => {
    fetchMilestones();
  }, []);

  const handleCreateMilestone = async () => {
    if (!newTask.trim() || !newDueDate || !newDueTime) {
      alert("Please fill out all fields.");
      return;
    }

    // Construct OffsetDateTime (ISO 8601 with timezone offset)
    const combinedDateTime = `${newDueDate}T${newDueTime}:00${getLocalTimezoneOffset()}`;
    // create empty milestoneDto object
    const milestoneData: MilestoneDto = {
      id: 0,
      task: newTask,
      dueDate: combinedDateTime,
      isCompleted,
      parentId: parentId,
      subMilestones: [],
      taggedPhotoId: null,
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

  const resetModal = () => {
    setNewTask("");
    setNewDueDate("");
    setNewDueTime("");
    setIsCompleted(false);
    setShowAddModal(false);
    setParentId(null);
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
                className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#b99547]"
            />

            <label className="block mb-1 text-sm font-medium text-gray-700">Due Time</label>
            <input
                type="time"
                value={newDueTime}
                onChange={(e) => setNewDueTime(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#b99547]"
            />

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
