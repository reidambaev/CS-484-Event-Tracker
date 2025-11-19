import { useState } from "react";
import supabase from "../utils/supabase";

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function CreateEventModal({ isOpen, onClose }: CreateEventModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [room, setRoom] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [tags, setTags] = useState("");
  const [capacity, setCapacity] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

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

    if (!room.trim()) {
      newErrors.room = "Room is required";
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

  const handleCreateEvent = async () => {
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

      // Insert the event
      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .insert([
          {
            title,
            description,
            location,
            room,
            date,
            start_time: startTime,
            end_time: endTime,
            max_capacity: parseInt(capacity),
            attendee_count: 0,
            created_by: user.id,
          },
        ])
        .select()
        .single();

      if (eventError) throw eventError;

      // Handle tags if provided
      if (tags.trim()) {
        const tagNames = tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean);

        for (const tagName of tagNames) {
          // Check if tag exists
          let { data: existingTag, error: tagFetchError } = await supabase
            .from("tags")
            .select("id")
            .eq("name", tagName)
            .single();

          let tagId;

          if (tagFetchError || !existingTag) {
            // Create new tag
            const { data: newTag, error: tagCreateError } = await supabase
              .from("tags")
              .insert([{ name: tagName }])
              .select()
              .single();

            if (tagCreateError) throw tagCreateError;
            tagId = newTag.id;
          } else {
            tagId = existingTag.id;
          }

          // Create event_tag relationship
          const { error: eventTagError } = await supabase
            .from("event_tags")
            .insert([
              {
                event_id: eventData.id,
                tag_id: tagId,
              },
            ]);

          if (eventTagError) throw eventTagError;
        }
      }

      console.log("Event created:", eventData);
      alert("Event created successfully!");
      onClose();
      setTitle("");
      setDescription("");
      setLocation("");
      setRoom("");
      setDate("");
      setStartTime("");
      setEndTime("");
      setTags("");
      setCapacity("");
      setErrors({});
    } catch (error) {
      console.error("Error creating event:", error);
      alert(error instanceof Error ? error.message : "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded w-96 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl mb-4">Create Event</h2>

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
            type="text"
            placeholder="Room"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={`w-full p-2 border ${
              errors.location ? "border-red-500" : ""
            }`}
          />
          {errors.room && (
            <p className="text-red-500 text-sm mt-1">{errors.room}</p>
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
            onClick={handleCreateEvent}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create"}
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

export default CreateEventModal;
