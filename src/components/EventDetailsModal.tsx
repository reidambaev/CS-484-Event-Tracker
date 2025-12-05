import React, { useState, useEffect } from "react";
import { X, MapPin, Calendar, Users, Bell, Mail } from "lucide-react";
import type { Event } from "../types";
import supabase from "../utils/supabase";

interface EventDetailsModalProps {
  event: Event;
  onClose: () => void;
  onRSVP: (eventId: string) => void;
  isRSVPd: boolean;
}

const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  event,
  onClose,
  onRSVP,
  isRSVPd,
}) => {
  const [localAttendees, setLocalAttendees] = useState(event.attendees || 0);
  const [localIsRSVPd, setLocalIsRSVPd] = useState(isRSVPd);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Notification preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [reminderTime, setReminderTime] = useState("24");

  useEffect(() => {
    setLocalAttendees(event.attendees || 0);
    setLocalIsRSVPd(isRSVPd);
  }, [event.attendees, isRSVPd]);

  // Fetch user and notification preferences
  useEffect(() => {
    const fetchUserAndPreferences = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);

        if (isRSVPd) {
          // Fetch event-specific notification preferences
          const { data: eventPref } = await supabase
            .from("event_notifications")
            .select("*")
            .eq("user_id", user.id)
            .eq("event_id", event.id)
            .maybeSingle();

          if (eventPref) {
            setEmailNotifications(eventPref.email_notifications ?? true);
            setReminderTime(eventPref.notification_timing?.toString() || "24");
          }
          // Use defaults if no event-specific preferences exist
        }
      }
    };

    fetchUserAndPreferences();
  }, [event.id, isRSVPd]);

  const handleRSVP = async () => {
    const wasRSVPd = localIsRSVPd;
    // Optimistically update UI
    setLocalIsRSVPd(!wasRSVPd);
    setLocalAttendees((prev) => (wasRSVPd ? prev - 1 : prev + 1));
    // Call the parent handler
    await onRSVP(event.id);

    // Create default notification preferences when RSVPing
    if (!wasRSVPd && userId) {
      await supabase.from("event_notifications").upsert(
        {
          user_id: userId,
          event_id: event.id,
          email_notifications: true,
          notification_timing: 24,
        },
        {
          onConflict: "user_id,event_id",
        }
      );
    }
  };

  const handleEmailToggle = async () => {
    if (!userId || loading) return;

    setLoading(true);
    const newValue = !emailNotifications;
    setEmailNotifications(newValue);

    try {
      // Save event-specific notification preference
      const { error } = await supabase.from("event_notifications").upsert(
        {
          user_id: userId,
          event_id: event.id,
          email_notifications: newValue,
          notification_timing: parseInt(reminderTime),
        },
        {
          onConflict: "user_id,event_id",
        }
      );

      if (error) throw error;

      alert(
        `Email notifications ${newValue ? "enabled" : "disabled"} for ${
          event.title
        }`
      );
    } catch (error) {
      console.error("Error saving notification preference:", error);
      setEmailNotifications(!newValue); // Revert on error
      alert("Failed to update notification preferences");
    } finally {
      setLoading(false);
    }
  };

  const handleReminderChange = async (value: string) => {
    if (!userId || loading) return;

    setLoading(true);
    setReminderTime(value);

    try {
      // Save event-specific notification preference
      const { error } = await supabase.from("event_notifications").upsert(
        {
          user_id: userId,
          event_id: event.id,
          email_notifications: emailNotifications,
          notification_timing: parseInt(value),
        },
        {
          onConflict: "user_id,event_id",
        }
      );

      if (error) throw error;

      const timeLabels: { [key: string]: string } = {
        "0.25": "15 minutes",
        "0.5": "30 minutes",
        "1": "1 hour",
        "24": "1 day",
        "168": "1 week",
      };
      alert(`Reminder set for ${timeLabels[value]} before event`);
    } catch (error) {
      console.error("Error saving reminder time:", error);
      alert("Failed to update reminder time");
    } finally {
      setLoading(false);
    }
  };

  if (!event) return null;

  // Stop click propagation on the modal content so clicking inside doesn't close it
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col"
        onClick={handleContentClick}
      >
        {/* Header Section */}
        <div className="bg-purple-600 text-white p-6 rounded-t-xl relative shrink-0">
          <div className="flex justify-between items-start">
            <div className="pr-8">
              <h2 className="text-2xl font-bold mb-2 leading-tight">
                {event.title}
              </h2>
              <div className="flex flex-wrap gap-2">
                {event.tags &&
                  event.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-sm font-medium border border-white/30"
                    >
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
          {/* Info Grid */}
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
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
                <Users size={16} className="mr-2" />
                Attendance
              </h3>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-3xl font-bold text-purple-600">
                  {localAttendees}
                </span>
                <span className="text-gray-500 mb-1">
                  / {event.max_capacity} spots filled
                </span>
              </div>

              {/* Simple Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-purple-600 h-2.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      (localAttendees / event.max_capacity) * 100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Notification Settings */}
          {localIsRSVPd && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-5">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Bell size={20} className="mr-2 text-purple-600" />
                Notification Preferences
              </h3>

              <div className="space-y-4">
                {/* Email Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Mail size={18} className="mr-3 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">
                        Email Notifications
                      </p>
                      <p className="text-sm text-gray-500">
                        Receive updates via email
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleEmailToggle}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      emailNotifications ? "bg-purple-600" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        emailNotifications ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Reminder Time Selector */}
                <div className="pt-2">
                  <label className="block font-medium text-gray-900 mb-2">
                    Reminder Time
                  </label>
                  <select
                    value={reminderTime}
                    onChange={(e) => handleReminderChange(e.target.value)}
                    disabled={loading}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="0.25">15 minutes before</option>
                    <option value="0.5">30 minutes before</option>
                    <option value="1">1 hour before</option>
                    <option value="24">1 day before</option>
                    <option value="168">1 week before</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {!localIsRSVPd && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
              <Bell size={24} className="mx-auto mb-2 text-gray-400" />
              <p className="text-gray-600 text-sm">
                RSVP to this event to enable notification preferences
              </p>
            </div>
          )}

          <hr className="border-gray-100" />

          {/* Description */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">
              About Event
            </h3>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
              {event.description}
            </p>
          </div>
        </div>

        {/* Footer / Action Bar */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-xl shrink-0 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleRSVP}
            className={`px-8 py-2.5 rounded-lg font-semibold shadow-sm transition-all transform active:scale-95 ${
              localIsRSVPd
                ? "bg-green-100 text-green-700 border border-green-200 hover:bg-green-200"
                : "bg-purple-600 text-white hover:bg-purple-700 hover:shadow-md"
            }`}
          >
            {localIsRSVPd ? "✓ You are Going" : "RSVP Now"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsModal;
