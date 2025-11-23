import { useState } from "react";
import { usePhotoMilestone } from "../contexts/PhotoMilestoneContext";
import { milestoneService } from "../services/milestoneService";
import MilestoneCard from "./MilestoneCard";
import MilestoneItem from "./MilestoneItem";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { type MilestoneDto } from "../types";

function MilestoneSection() {
  const { milestones, refreshMilestones } = usePhotoMilestone();
  
  const [newTask, setNewTask] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [newDueTime, setNewDueTime] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Filter states
  const [filterStatus, setFilterStatus] = useState<"ALL" | "COMPLETED" | "PENDING">("ALL");
  const [selectedMilestone, setSelectedMilestone] = useState<MilestoneDto | null>(null);

  const handleCreateMilestone = async () => {
    if (!newTask.trim() || !newDueDate || !newDueTime) {
      toast.error("Please fill out all fields.");
      return;
    }

    try {
      setIsCreating(true);

      // Construct ISO string properly
      const dateTimeString = `${newDueDate}T${newDueTime}:00`;
      const localDate = new Date(dateTimeString);
      const isoString = localDate.toISOString();

      await milestoneService.createMilestone({
        task: newTask,
        dueDate: isoString,
        isCompleted: false,
      });

      toast.success("Milestone created!");
      setNewTask("");
      setNewDueDate("");
      setNewDueTime("");
      await refreshMilestones();
    } catch (error) {
      console.error("Error creating milestone:", error);
      toast.error("Failed to create milestone.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteMilestone = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this milestone?")) return;

    try {
      await milestoneService.deleteMilestone(id);
      toast.success("Milestone deleted");
      await refreshMilestones();
    } catch (error) {
      console.error("Error deleting milestone:", error);
      toast.error("Failed to delete milestone");
    }
  };

  const filteredMilestones = (milestones ? milestones : []).filter((m) => {
    if (filterStatus === "ALL") return true;
    if (filterStatus === "COMPLETED") return m.isCompleted;
    if (filterStatus === "PENDING") return !m.isCompleted;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Milestone</h2>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">Task Name</label>
            <input
              type="text"
              placeholder="e.g. Complete 5 hikes"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-800"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
            />
          </div>
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input
              type="date"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-800"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
            <input
              type="time"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-800"
              value={newDueTime}
              onChange={(e) => setNewDueTime(e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <button
              onClick={handleCreateMilestone}
              disabled={isCreating}
              className="w-full bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
            >
              {isCreating ? "Adding..." : "Add"}
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Your Milestones</h2>
        <div className="flex space-x-2">
          {(["ALL", "PENDING", "COMPLETED"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filterStatus === status
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {status.charAt(0) + status.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {filteredMilestones.length > 0 ? (
            filteredMilestones.map((milestone) => (
              <motion.div
                key={milestone.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                layout
              >
                <MilestoneItem
                  milestone={milestone}
                  onDelete={() => handleDeleteMilestone(milestone.id)}
                  onClick={() => setSelectedMilestone(milestone)}
                />
              </motion.div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-8">No milestones found.</p>
          )}
        </AnimatePresence>
      </div>

      {/* Milestone Details Modal */}
      {selectedMilestone && (
        <MilestoneCard
          milestone={selectedMilestone}
          onClose={() => setSelectedMilestone(null)}
          onDelete={() => handleDeleteMilestone(selectedMilestone.id)}
        />
      )}
    </div>
  );
}

export default MilestoneSection;
