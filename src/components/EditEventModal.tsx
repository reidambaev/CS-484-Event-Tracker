import { useEffect, useState } from "react";
import supabase from "../utils/supabase";

interface EditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventID: any;
}

function EditEventModal({ isOpen, onClose, eventID }: EditEventModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [tags, setTags] = useState("");
  const [capacity, setCapacity] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventID)
        .single();
      if (error) {
        console.log(error);
        alert(error);
      } else if (data) {
        setTitle(data.title || "");
        setDescription(data.description || "");
        setLocation(data.location || "");
        setDate(data.date || "");
        setStartTime(data.start_time || "");
        setEndTime(data.end_time || "");
        setTags(data.tags ? data.tags.join(", ") : "");
        setCapacity(data.max_capacity || "");
      }
    };
    if (eventID) {
      fetchData();
    }
  }, [eventID]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!location.trim()) {
      newErrors.location = "Location is required";
    }

    if (!date) {
      newErrors.date = "Date is required";
    }

    if (!startTime) {
      newErrors.startTime = "Start time is required";
    }

    if (!endTime) {
      newErrors.endTime = "End time is required";
    }

    if (startTime && endTime && startTime >= endTime) {
      newErrors.endTime = "End time must be after start time";
    }

    if (!capacity || parseInt(capacity) <= 0) {
      newErrors.capacity = "Capacity must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEditEvent = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("You must be logged in to create an event");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("events")
        .update([
          {
            title,
            description,
            location,
            date,
            start_time: startTime,
            end_time: endTime,
            tags: tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean),
            max_capacity: parseInt(capacity),
            attendee_count: 0,
            created_by: user.id,
          },
        ])
        .eq("id", eventID)
        .select();

      if (error) {
        console.error("Error updating event:", error);
        throw new Error(
          `Failed to update event: ${error.message}. You may not have admin permissions.`
        );
      }

      console.log("Event edited:", data);
      alert("Event edited successfully!");
      onClose();
      setTitle("");
      setDescription("");
      setLocation("");
      setDate("");
      setStartTime("");
      setEndTime("");
      setTags("");
      setCapacity("");
      setErrors({});
    } catch (error) {
      console.error("Error creating event:", error);
      alert(error instanceof Error ? error.message : "Failed to edit event");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded w-96 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl">Edit Event</h2>
        </div>

        <div className="mb-3">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`w-full p-2 border ${
              errors.title ? "border-red-500" : ""
            }`}
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title}</p>
          )}
        </div>

        <div className="mb-3">
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`w-full p-2 border ${
              errors.description ? "border-red-500" : ""
            }`}
            rows={3}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
          )}
        </div>

        <div className="mb-3">
          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={`w-full p-2 border ${
              errors.location ? "border-red-500" : ""
            }`}
          />
          {errors.location && (
            <p className="text-red-500 text-sm mt-1">{errors.location}</p>
          )}
        </div>

        <div className="mb-3">
          <input
            type="date"
            placeholder="Date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={`w-full p-2 border ${
              errors.date ? "border-red-500" : ""
            }`}
          />
          {errors.date && (
            <p className="text-red-500 text-sm mt-1">{errors.date}</p>
          )}
        </div>

        <div className="mb-3">
          <input
            type="time"
            placeholder="Start Time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className={`w-full p-2 border ${
              errors.startTime ? "border-red-500" : ""
            }`}
          />
          {errors.startTime && (
            <p className="text-red-500 text-sm mt-1">{errors.startTime}</p>
          )}
        </div>

        <div className="mb-3">
          <input
            type="time"
            placeholder="End Time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className={`w-full p-2 border ${
              errors.endTime ? "border-red-500" : ""
            }`}
          />
          {errors.endTime && (
            <p className="text-red-500 text-sm mt-1">{errors.endTime}</p>
          )}
        </div>

        <div className="mb-3">
          <input
            type="text"
            placeholder="Tags (comma separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full p-2 border"
          />
        </div>

        <div className="mb-3">
          <input
            type="number"
            placeholder="Capacity"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            className={`w-full p-2 border ${
              errors.capacity ? "border-red-500" : ""
            }`}
          />
          {errors.capacity && (
            <p className="text-red-500 text-sm mt-1">{errors.capacity}</p>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleEditEvent}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            {loading ? "Editing..." : "Edit"}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditEventModal;
