import { useState } from "react";

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function CreateEventModal({ isOpen, onClose }: CreateEventModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [tags, setTags] = useState("");
  const [capacity, setCapacity] = useState("");

  const handleCreateEvent = () => {
    console.log({
      title,
      description,
      location,
      date,
      startTime,
      endTime,
      tags,
      capacity,
    });
    onClose();
    setTitle("");
    setDescription("");
    setLocation("");
    setDate("");
    setStartTime("");
    setEndTime("");
    setTags("");
    setCapacity("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded w-96 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl mb-4">Create Event</h2>

        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border mb-3"
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border mb-3"
          rows={3}
        />

        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full p-2 border mb-3"
        />

        <input
          type="date"
          placeholder="Date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full p-2 border mb-3"
        />

        <input
          type="time"
          placeholder="Start Time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className="w-full p-2 border mb-3"
        />

        <input
          type="time"
          placeholder="End Time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          className="w-full p-2 border mb-3"
        />

        <input
          type="text"
          placeholder="Tags (comma separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-full p-2 border mb-3"
        />

        <input
          type="number"
          placeholder="Capacity"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          className="w-full p-2 border mb-3"
        />

        <div className="flex gap-2">
          <button
            onClick={handleCreateEvent}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Create
          </button>
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateEventModal;
