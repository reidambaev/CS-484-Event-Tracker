import { Link } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import supabase from "../utils/supabase";
import EditEventModal from "../components/EditEventModal";
import EventManagementModal from "../components/EventManagementModal";
import EventDetailsModal from "../components/EventDetailsModal";
import type { Event } from "../types";

function Profile() {
  const [user, setUser] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showManagementModal, setShowManagementModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [edit, setEdit] = useState<any>(null);
  const [rvsp, setRvsp] = useState<any[]>([]);

  const fetchRvsp = useCallback(async (userID: string | null) => {
    if (!userID) return;
    const { data, error } = await supabase
      .from("user_events")
      .select(
        `id, event_id, user_id, status, events!inner(id, title, description, location, date, start_time, max_capacity, attendee_count, end_time, tags, room)`
      )
      .eq("user_id", userID)
      .order("status")
      .order("events(date)", { ascending: false })
      .order("events(start_time)")
      .order("events(end_time)");
    if (error) {
      console.log(error);
      return "error fetching";
    } else if (data) {
      console.log(data);
      setRvsp(data);
    } else {
      return "no rsvp events";
    }
  }, []);

  const fetchEvents = useCallback(async (userID: string | null) => {
    if (!userID) return;
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("created_by", userID)
      .order("date", { ascending: false })
      .order("start_time")
      .order("end_time");
    if (error) {
      console.log(error);
    } else {
      setEvents(data);
      fetchRvsp(userID);
    }
  }, []);

  const handleDeleteEvent = async (eventID: any) => {
    const { error } = await supabase.from("events").delete().eq("id", eventID);
    if (error) {
      console.log(error);
      alert(`failed to remove event: ${error}`);
    } else {
      fetchEvents(user?.id);
    }
  };

  const handleUserEventStatus = async (
    userEventID: any,
    attending: boolean
  ) => {
    const { error } = await supabase
      .from("user_events")
      .update({ status: attending ? "attending" : "not_attending" })
      .eq("id", userEventID);
    if (error) {
      console.log(error);
      alert(`failed to change event status ${error}`);
    } else {
      fetchRvsp(user?.id);
    }
  };

  const handleManageEvent = (event: any) => {
    setSelectedEvent(event);
    setShowManagementModal(true);
  };

  const handleViewTrackedEvent = (event: any) => {
    // Convert the nested event structure to Event type
    const eventData: Event = {
      id: event.events.id,
      title: event.events.title,
      description: event.events.description,
      location: event.events.location,
      room: event.events.room || "",
      latitude: event.events.latitude,
      longitude: event.events.longitude,
      date: event.events.date,
      start_time: event.events.start_time,
      end_time: event.events.end_time,
      tags: event.events.tags || [],
      max_capacity: event.events.max_capacity,
      attendees: event.events.attendee_count || 0,
      created_by: event.events.created_by,
    };
    setSelectedEvent(eventData);
    setShowDetailsModal(true);
  };

  const handleEditFromManagement = () => {
    setEdit(selectedEvent.id);
    setShowManagementModal(false);
    setShowEditModal(true);
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      fetchEvents(data.user ? data.user.id : null);
      fetchRvsp(data.user ? data.user.id : null);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          {user && (
            <div className="mt-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{user.email}</p>
                  <p className="text-sm text-gray-500">Member</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Created Events Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">My Events</h2>
              <p className="text-gray-600 mt-1">Events you've created</p>
            </div>
            <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
              {events.length} {events.length === 1 ? "Event" : "Events"}
            </span>
          </div>
          <ul className="space-y-3">
            {events.length === 0 ? (
              <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
                <p className="text-gray-500">
                  You haven't created any events yet.
                </p>
              </div>
            ) : (
              events.map((event: any) => (
                <li
                  key={event.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900">
                        {event.title}
                      </h3>
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <p>
                          <span className="font-medium">Date:</span>{" "}
                          {event.date}
                        </p>
                        <p>
                          <span className="font-medium">Time:</span>{" "}
                          {event.start_time} - {event.end_time}
                        </p>
                        <p>
                          <span className="font-medium">Location:</span>{" "}
                          {event.location}
                        </p>
                        <p>
                          <span className="font-medium">Attendance:</span>{" "}
                          {event.attendee_count} / {event.max_capacity}
                        </p>
                        {event.tags && event.tags.length > 0 && (
                          <p>
                            <span className="font-medium">Tags:</span>{" "}
                            {event.tags.join(", ")}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                      onClick={() => handleManageEvent(event)}
                    >
                      Manage
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Tracked Events Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">My RSVPs</h2>
              <p className="text-gray-600 mt-1">Events you're attending</p>
            </div>
            <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
              {rvsp.filter((e: any) => e.status === "attending").length}{" "}
              Attending
            </span>
          </div>
          <ul className="space-y-3">
            {rvsp.length === 0 ? (
              <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
                <p className="text-gray-500">
                  You haven't RSVP'd to any events yet.
                </p>
              </div>
            ) : (
              rvsp.map((event: any) => (
                <li
                  key={event.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleViewTrackedEvent(event)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900">
                        {event.events.title}
                      </h3>
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <p>
                          <span className="font-medium">Date:</span>{" "}
                          {event.events.date}
                        </p>
                        <p>
                          <span className="font-medium">Time:</span>{" "}
                          {event.events.start_time} - {event.events.end_time}
                        </p>
                        <p>
                          <span className="font-medium">Location:</span>{" "}
                          {event.events.location}
                        </p>
                        <p>
                          <span className="font-medium">Attendance:</span>{" "}
                          {event.events.attendee_count} /{" "}
                          {event.events.max_capacity}
                        </p>
                        {event.events.tags && event.events.tags.length > 0 && (
                          <p>
                            <span className="font-medium">Tags:</span>{" "}
                            {event.events.tags.join(", ")}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                        event.status === "attending"
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUserEventStatus(
                          event.id,
                          event.status === "attending" ? false : true
                        );
                      }}
                    >
                      {event.status === "attending" ? "✓ Going" : "Not Going"}
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Back to Home Link */}
        <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
          >
            <span>←</span>
            <span>Back to Home</span>
          </Link>
        </div>
      </div>

      {/* Event Management Modal for Owned Events */}
      {showManagementModal && selectedEvent && (
        <EventManagementModal
          event={selectedEvent}
          onClose={() => {
            setShowManagementModal(false);
            setSelectedEvent(null);
          }}
          onEdit={handleEditFromManagement}
          onDelete={(eventId) => {
            handleDeleteEvent(eventId);
            setShowManagementModal(false);
            setSelectedEvent(null);
          }}
        />
      )}

      {/* Edit Event Modal */}
      <EditEventModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          fetchEvents(user?.id);
          setEdit(null);
        }}
        eventID={edit}
      />

      {/* Event Details Modal for Tracked Events */}
      {showDetailsModal && selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedEvent(null);
          }}
          onRSVP={async (eventId: string) => {
            // Find the user_event record for this event
            const userEvent = rvsp.find((e: any) => e.events.id === eventId);
            if (userEvent) {
              await handleUserEventStatus(
                userEvent.id,
                userEvent.status !== "attending"
              );
            }
            // Refresh to get updated data
            fetchRvsp(user?.id);
          }}
          isRSVPd={rvsp.some(
            (e: any) =>
              e.events.id === selectedEvent.id && e.status === "attending"
          )}
        />
      )}
    </div>
  );
}

export default Profile;
