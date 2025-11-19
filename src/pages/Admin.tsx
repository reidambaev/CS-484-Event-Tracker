import { Link } from "react-router-dom";
import supabase from "../utils/supabase";
import { useEffect, useState } from "react";
import EditEventModal from "../components/EditEventModal";

function Admin() {
  const [events, setEvents] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [edit, setEdit] = useState<any>(null);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("date", { ascending: true });
    if (error) {
      console.log(error);
    } else {
      setEvents(data);
    }
  };

  const handleDeleteEvent = async (eventID: any) => {
    const { error } = await supabase.from("events").delete().eq("id", eventID);
    if (error) {
      console.log(error);
      alert(`failed to remove event: ${error}`);
    } else {
      fetchEvents();
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);
  return (
    <div className="p-8">
      <h1 className="text-3xl mb-4">Admin Panel</h1>
      <p>Admin stuff goes here</p>
      <h1 className="text-2xl mb-4 mt-4">Event List</h1>
      <ul>
        {events.map((event: any) => (
          <li key={event.id}>
            <p className="px-1 py-1">
              {event.title} - {event.date} - {event.location} -{" "}
              {event.start_time} - {event.end_time} - {event.max_capacity} -{" "}
              {event.attendee_count} - {event.tags.join(", ")}{" "}
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
      <Link to="/" className="text-blue-500 underline mt-4 block">
        Back to Home
      </Link>

      <EditEventModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          fetchEvents();
        }}
        eventID={edit}
      />
    </div>
  );
}

export default Admin;
