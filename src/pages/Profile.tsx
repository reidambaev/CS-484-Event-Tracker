import { Link } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import supabase from "../utils/supabase";
import EditEventModal from "../components/EditEventModal";

function Profile() {
  const [user, setUser] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [edit, setEdit] = useState<any>(null);

  const fetchEvents = useCallback(async (userID: string | null) => {
    if (!userID) return;
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("created_by", userID)
      .order("date", { ascending: false });
    if (error) {
      console.log(error);
    } else {
      setEvents(data);
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

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      fetchEvents(data.user ? data.user.id : null);
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
                remove
              </button>
            </p>
          </li>
        ))}
      </ul>
      <h1 className="text-2xl mb-4 mt-4">Events Tracked by Me</h1>
      <Link to="/" className="text-blue-500 underline mt-4 block">
        Back to Home
      </Link>
      <EditEventModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          fetchEvents(user.id);
        }}
        eventID={edit}
      />
    </div>
  );
}

export default Profile;
