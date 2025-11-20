import React, { useState, useEffect } from "react";
import {
  X,
  MapPin,
  Calendar,
  Clock,
  Users,
  Edit2,
  Trash2,
  Tag,
} from "lucide-react";
import type { Event } from "../types";
import supabase from "../utils/supabase";

interface EventManagementModalProps {
  event: Event;
  onClose: () => void;
  onEdit: () => void;
  onDelete: (eventId: string) => void;
}

const EventManagementModal: React.FC<EventManagementModalProps> = ({
  event,
  onClose,
  onEdit,
  onDelete,
}) => {
  const [attendees, setAttendees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentAttendeeCount, setCurrentAttendeeCount] = useState(
    event.attendees || 0
  );

  useEffect(() => {
    fetchAttendees();
    fetchCurrentCount();
  }, [event.id]);

  const fetchCurrentCount = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("attendee_count")
        .eq("id", event.id)
        .single();

      if (error) throw error;
      setCurrentAttendeeCount(data.attendee_count || 0);
    } catch (error) {
      console.error("Error fetching attendee count:", error);
    }
  };

  const fetchAttendees = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("user_events")
        .select(
          `
          id,
          user_id,
          status,
          created_at,
          profiles:user_id (
            full_name,
            email
          )
        `
        )
        .eq("event_id", event.id)
        .eq("status", "attending");

      if (error) throw error;

      setAttendees(data || []);
      setCurrentAttendeeCount(data?.length || 0);
    } catch (error) {
      console.error("Error fetching attendees:", error);
      setAttendees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleDeleteClick = () => {
    if (
      window.confirm(
        `Are you sure you want to delete "${event.title}"? This action cannot be undone.`
      )
    ) {
      onDelete(event.id);
      onClose();
    }
  };

  if (!event) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col"
        onClick={handleContentClick}
      >
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-xl relative shrink-0">
          <div className="flex justify-between items-start">
            <div className="pr-8">
              <div className="text-sm font-medium mb-1 opacity-90">
                Event Management
              </div>
              <h2 className="text-2xl font-bold mb-2 leading-tight">
                {event.title}
              </h2>
              <div className="flex flex-wrap gap-2">
                {event.tags &&
                  event.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-sm font-medium border border-white/30 flex items-center gap-1"
                    >
                      <Tag size={12} />
                      {tag}
                    </span>
                  ))}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-full transition-colors absolute top-4 right-4"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-6 flex-grow overflow-y-auto">
          {/* Event Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1 flex items-center">
                  <Calendar size={16} className="mr-2" />
                  Date & Time
                </h3>
                <p className="text-gray-900 font-medium">{event.date}</p>
                <p className="text-gray-600">
                  {event.start_time} - {event.end_time}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1 flex items-center">
                  <MapPin size={16} className="mr-2" />
                  Location
                </h3>
                <p className="text-gray-900 font-medium">{event.location}</p>
                {event.room && (
                  <p className="text-gray-600">Room: {event.room}</p>
                )}
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
                <Users size={16} className="mr-2" />
                Attendance Statistics
              </h3>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-3xl font-bold text-blue-600">
                  {currentAttendeeCount}
                </span>
                <span className="text-gray-500 mb-1">
                  / {event.max_capacity} spots filled
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      (currentAttendeeCount / event.max_capacity) * 100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>

              <div className="text-sm text-gray-600">
                <p>
                  Available spots: {event.max_capacity - currentAttendeeCount}
                </p>
                <p>
                  Fill rate:{" "}
                  {Math.round(
                    (currentAttendeeCount / event.max_capacity) * 100
                  )}
                  %
                </p>
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Description */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">
              Event Description
            </h3>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
              {event.description}
            </p>
          </div>

          <hr className="border-gray-100" />

          {/* Attendees List */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Users size={20} />
              Registered Attendees ({attendees.length})
            </h3>
            {loading ? (
              <p className="text-gray-500">Loading attendees...</p>
            ) : attendees.length > 0 ? (
              <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                <ul className="space-y-2">
                  {attendees.map((attendee: any, index: number) => (
                    <li
                      key={attendee.id}
                      className="flex items-center gap-3 p-2 bg-white rounded border border-gray-200"
                    >
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {attendee.profiles?.full_name ||
                            attendee.profiles?.email ||
                            "Unknown User"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {attendee.profiles?.email &&
                            attendee.profiles?.full_name &&
                            attendee.profiles.email}
                        </p>
                        <p className="text-xs text-gray-500">
                          Registered:{" "}
                          {new Date(attendee.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        Attending
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <Users size={48} className="mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500">No attendees yet</p>
                <p className="text-sm text-gray-400">Be the first to RSVP!</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer / Action Bar */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-xl shrink-0 flex justify-between gap-3">
          <button
            onClick={handleDeleteClick}
            className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors flex items-center gap-2"
          >
            <Trash2 size={18} />
            Delete Event
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition-colors"
            >
              Close
            </button>
            <button
              onClick={onEdit}
              className="px-8 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-sm transition-all flex items-center gap-2"
            >
              <Edit2 size={18} />
              Edit Event
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventManagementModal;
