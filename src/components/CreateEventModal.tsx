import { useState } from "react";
import { X, MapPin, Tag, Users, Calendar } from "lucide-react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import supabase from "../utils/supabase";

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

function CreateEventModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateEventModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    room: "",
    date: "",
    start_time: "",
    end_time: "",
    tags: "",
    max_capacity: "50",
    lat: 41.8707,
    lng: -87.648,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    if (!formData.room.trim()) {
      newErrors.room = "Room is required";
    }

    if (!formData.date) {
      newErrors.date = "Date is required";
    }

    if (!formData.start_time) {
      newErrors.start_time = "Start time is required";
    }

    if (!formData.end_time) {
      newErrors.end_time = "End time is required";
    }

    if (
      formData.start_time &&
      formData.end_time &&
      formData.start_time >= formData.end_time
    ) {
      newErrors.end_time = "End time must be after start time";
    }

    if (!formData.max_capacity || parseInt(formData.max_capacity) <= 0) {
      newErrors.max_capacity = "Capacity must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
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
            title: formData.title,
            description: formData.description,
            location: formData.location,
            room: formData.room,
            date: formData.date,
            start_time: formData.start_time,
            end_time: formData.end_time,
            max_capacity: parseInt(formData.max_capacity),
            attendee_count: 0,
            created_by: user.id,
            latitude: formData.lat,
            longitude: formData.lng,
          },
        ])
        .select()
        .single();

      if (eventError) throw eventError;

      // Handle tags if provided
      if (formData.tags.trim()) {
        const tagNames = formData.tags
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

      if (onSuccess) onSuccess();
      onClose();
      setFormData({
        title: "",
        description: "",
        location: "",
        room: "",
        date: "",
        start_time: "",
        end_time: "",
        tags: "",
        max_capacity: "50",
        lat: 41.8707,
        lng: -87.648,
      });
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
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 pt-20 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl my-4">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-8 rounded-t-2xl">
          <h2 className="text-3xl font-bold mb-2">Create New Event</h2>
          <p className="text-purple-100 text-sm">
            Share your event with the campus community
          </p>
        </div>

        <div className="p-8 space-y-5">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Event Title
            </label>
            <input
              type="text"
              placeholder="e.g., CS101 Midterm Study Session"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.title ? "border-red-500" : "border-gray-200"
              }`}
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              placeholder=""
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.description ? "border-red-500" : "border-gray-200"
              }`}
              rows={4}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  placeholder="mm/dd/yyyy"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.date ? "border-red-500" : "border-gray-200"
                  }`}
                />
              </div>
              {errors.date && (
                <p className="text-red-500 text-sm mt-1">{errors.date}</p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Start Time
              </label>
              <input
                type="time"
                placeholder="--:--"
                value={formData.start_time}
                onChange={(e) =>
                  setFormData({ ...formData, start_time: e.target.value })
                }
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.start_time ? "border-red-500" : "border-gray-200"
                }`}
              />
              {errors.start_time && (
                <p className="text-red-500 text-sm mt-1">{errors.start_time}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                End Time
              </label>
              <input
                type="time"
                placeholder="--:--"
                value={formData.end_time}
                onChange={(e) =>
                  setFormData({ ...formData, end_time: e.target.value })
                }
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.end_time ? "border-red-500" : "border-gray-200"
                }`}
              />
              {errors.end_time && (
                <p className="text-red-500 text-sm mt-1">{errors.end_time}</p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Max Capacity
              </label>
              <div className="relative">
                <Users
                  className="absolute left-3 top-3 text-gray-400"
                  size={20}
                />
                <input
                  type="number"
                  placeholder="50"
                  value={formData.max_capacity}
                  onChange={(e) =>
                    setFormData({ ...formData, max_capacity: e.target.value })
                  }
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.max_capacity ? "border-red-500" : "border-gray-200"
                  }`}
                />
              </div>
              {errors.max_capacity && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.max_capacity}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Building
              </label>
              <input
                type="text"
                placeholder="e.g., Library, Student Center"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.location ? "border-red-500" : "border-gray-200"
                }`}
              />
              {errors.location && (
                <p className="text-red-500 text-sm mt-1">{errors.location}</p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Room
              </label>
              <input
                type="text"
                placeholder="e.g., 301, 3rd Floor"
                value={formData.room}
                onChange={(e) =>
                  setFormData({ ...formData, room: e.target.value })
                }
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.room ? "border-red-500" : "border-gray-200"
                }`}
              />
              {errors.room && (
                <p className="text-red-500 text-sm mt-1">{errors.room}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              <MapPin className="inline mr-2" size={16} />
              Pick Location on Map
            </label>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <LoadScript
                googleMapsApiKey={
                  import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""
                }
              >
                <GoogleMap
                  mapContainerStyle={{ width: "100%", height: "300px" }}
                  center={{ lat: formData.lat, lng: formData.lng }}
                  zoom={15}
                  onClick={(e) => {
                    if (e.latLng) {
                      setFormData({
                        ...formData,
                        lat: e.latLng.lat(),
                        lng: e.latLng.lng(),
                      });
                    }
                  }}
                >
                  <Marker position={{ lat: formData.lat, lng: formData.lng }} />
                </GoogleMap>
              </LoadScript>
            </div>
            <p className="text-gray-500 text-xs mt-1">
              Click on the map to set the event location (Lat:{" "}
              {formData.lat.toFixed(4)}, Lng: {formData.lng.toFixed(4)})
            </p>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Tags
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="CS101, Study Session"
                value={formData.tags}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-300 font-medium transition"
            >
              {loading ? "Creating..." : "Create Event"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateEventModal;
