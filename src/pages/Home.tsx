import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import CreateEventModal from "../components/CreateEventModal";
import { useLoadScript, GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";
import supabase from "../utils/supabase";

type Event = {
  id: string;            
  title: string;
  description: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  date: string;
  start_time: string;
  end_time: string;
  max_capacity: number;
  attendee_count: number
};

export default function Home() {
  const {isLoaded} = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_PUBLIC_GOOGLE_MAPS_KEY
  });

  const [showModal, setShowModal] = useState(false);
  const [events, setEvents] = useState<Event[]>([]); 
  const [clickedEvent, setClickedEvent] = useState<Event | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase.from("events").select("*");
      if (error) {
        console.error("Unable to fetch events:", error);
      } 
      else if (data) {
        //ensures only events with coordinates make the list (errors will popup otherwise)
        const eventsWithCoordinates = data.filter(
          (e) => e.latitude !== null && e.longitude !== null
        );
        setEvents(eventsWithCoordinates);
      }
    };
    fetchEvents();
  }, []);

  if(!isLoaded) return <div> Currently loading......</div>

  //when a user clicks on a marker, sets the event for info window
  const handleMarkerClick = (event: Event) => {setClickedEvent(event)}

  //calculates how many spots are left for the clicked event
  const spotsLeft = clickedEvent && (clickedEvent.max_capacity - clickedEvent.attendee_count)

  //make the window popup for when an event is clicked (Needs work)
  const infoWindow = clickedEvent && (<InfoWindow
    onCloseClick={() => setClickedEvent(null)}
    position= {{lat: clickedEvent.latitude!, lng: clickedEvent.longitude!}}
    >
      <div className="p-4">
        <h4 className="text-sm text-center">{clickedEvent.title}</h4>
        <p className="text-sm">Date: {clickedEvent.date}</p>
        <p className="text-sm">Time: {clickedEvent.start_time} - {clickedEvent.end_time}</p>
        <p className="text-sm">Spots left: {spotsLeft} </p>
        <p className="text-sm">About: {clickedEvent.description}</p>
      </div>
    </InfoWindow>

  )

  return (
    <div className="p-8">
      <h1 className="text-3xl mb-4 text-center">Welcome CampusCircuit</h1>
      <p>Check out the current campus events!</p>

      <button
        onClick={() => setShowModal(true)}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Create Event
      </button>

      <div className="w-full h-screen">
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "500px" }}
        center={{ lat: 41.872219, lng: -87.649204 }}
        zoom={17}
      >
        {events.map((event) => (
          <Marker
            key={event.id}
            position={{ lat: event.latitude!, lng: event.longitude! }}
            onClick={() => handleMarkerClick(event)}
          />
        ))}
        {infoWindow}
      </GoogleMap>
    </div>
      <CreateEventModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
}


