import { Link } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import supabase from "../utils/supabase";
import EditEventModal from "../components/EditEventModal";

function Profile() {
  const [user, setUser] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
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

    const { error: err } = await supabase
      .from("user_events")
      .delete()
      .eq("event_id", eventID);

    if (error || err) {
      console.log(error || err);
      alert(`failed to remove event: ${error || err}`);
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

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      fetchEvents(data.user ? data.user.id : null);
      fetchRvsp(data.user ? data.user.id : null);
    });
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl mb-4">Profile</h1>
      {user ? (
        <div>
          <p>Email: {user.email}</p>
          <p className="mt-2">ID: {user.id}</p>
        </div>
      ) : (
        <p>Not logged in</p>
      )}
      <h1 className="text-2xl mb-4 mt-4">Created by Me</h1>
      <ul>
        {events.map((event: any) => (
          <li key={event.id}>
            <p className="px-1 py-1">
              {event.title} - {event.date} - {event.location} -{" "}
              {event.start_time} - {event.end_time} - {event.max_capacity} -{" "}
              {event.attendee_count} -{event.tags ? event.tags.join(", ") : ""}{" "}
              -{" "}
              <button
                className="px-1 py-1 mr-1 bg-blue-500 text-white rounded"
                onClick={() => {
                  setShowModal(true);
                  setEdit(event.id);
                }}
              >
                Edit
              </button>
              <button
                className="px-1 py-1 bg-red-600 text-white rounded"
                onClick={() => handleDeleteEvent(event.id)}
              >
                Remove
              </button>
            </p>
          </li>
        ))}
      </ul>
      <h1 className="text-2xl mb-4 mt-4">Events Tracked by Me</h1>
      <ul>
        {rvsp.map((event: any) => (
          <li key={event.id}>
            <p className="px-1 py-1">
              {event.events.title} - {event.events.date} -{" "}
              {event.events.location} - {event.events.start_time} -{" "}
              {event.events.end_time} - {event.events.max_capacity} -{" "}
              {event.events.attendee_count} -
              {event.events.tags ? event.events.tags.join(", ") : ""}
              {(() => {
                const text =
                  event.status == "attending" ? "Going" : "Not Going";
                const buttonStyle =
                  event.status == "attending"
                    ? "px-1 py-1 mr-1 bg-green-500 text-white rounded"
                    : "px-1 py-1 mr-1 bg-red-500 text-white rounded";
                return (
                  <button
                    className={buttonStyle}
                    onClick={() => {
                      handleUserEventStatus(
                        event.id,
                        event.status == "attending" ? false : true
                      );
                      console.log("handling");
                    }}
                  >
                    {text}
                  </button>
                );
              })()}
            </p>
          </li>
        ))}
      </ul>
      <Link to="/" className="text-blue-500 underline mt-4 block">
        Back to Home
      </Link>
      <EditEventModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          fetchEvents(user.id);
          setEdit(null);
        }}
        eventID={edit}
      />
    </div>
  );
}

export default Profile;
