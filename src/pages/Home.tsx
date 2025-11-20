import { useState, useEffect } from "react";
import CreateEventModal from "../components/CreateEventModal";
import Sidebar from "../components/Sidebar";
import supabase from "../utils/supabase";
import type { Event } from "../types";

import {
  useLoadScript,
  GoogleMap,
  Marker,
  InfoWindow,
  MarkerClusterer,
} from "@react-google-maps/api";

function Home() {
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [view, setView] = useState<"map" | "list">("list");
  const [events, setEvents] = useState<Event[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userRSVPs, setUserRSVPs] = useState<string[]>([]);
  const [clickedEvent, setClickedEvent] = useState<Event | null>(null);
  const [filtered, setFiltered] = useState<Event[]>([]);
  const [centerMap, setCenterMap] = useState({
    lat: 41.872219,
    lng: -87.649204,
  });

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_PUBLIC_GOOGLE_MAPS_KEY,
  });

  // Auth Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRSVPs(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRSVPs(session.user.id);
      } else {
        setUserRSVPs([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch events from Supabase
  useEffect(() => {
    fetchEvents();
  }, []);

  // Fetch user's RSVPs
  const fetchUserRSVPs = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_events")
        .select("event_id")
        .eq("user_id", userId)
        .eq("status", "attending");

      if (error) throw error;

      const eventIds = data.map((item: any) => item.event_id);
      setUserRSVPs(eventIds);
    } catch (error) {
      console.error("Error fetching user RSVPs:", error);
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);

      // Fetch events with their tags
      const { data: eventsData, error: eventsError } = await supabase
        .from("events")
        .select(
          `
          *,
          event_tags (
            tags (
              name
            )
          )
        `
        )
        .order("date", { ascending: true });

      if (eventsError) throw eventsError;

      // Fetch all tags from the tags table
      const { data: tagsData, error: tagsError } = await supabase
        .from("tags")
        .select("name");

      if (tagsError) throw tagsError;

      // Set all available tags from the tags table
      const allTagNames = tagsData.map((tag: any) => tag.name);
      setAllTags(allTagNames);

      // Transform the data to match the Event interface
      const transformedEvents: Event[] = eventsData.map((event: any) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        location: event.location,
        room: event.room || "",
        lat: event.latitude,
        lng: event.longitude,
        date: event.date,
        start_time: event.start_time,
        end_time: event.end_time,
        tags: event.event_tags.map((et: any) => et.tags.name),
        max_capacity: event.max_capacity,
        attendees: event.attendee_count || 0,
        created_by: event.created_by,
      }));

      setEvents(transformedEvents);

      const filtered = transformedEvents.filter(
        (e) => e.lat !== null && e.lng !== null
      );
      setFiltered(filtered);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEvent = (event: any) => {
    console.log("Selected event:", event);
    setCenterMap({
      lat: event.lat,
      lng: event.lng,
    });
  };

  // RSVP Logic
  const handleRSVP = async (eventId: string) => {
    if (!user) {
      alert("Please log in to RSVP");
      return;
    }

    try {
      // Check if user has already RSVP'd
      const { data: existingRSVP, error: checkError } = await supabase
        .from("user_events")
        .select("*")
        .eq("event_id", eventId)
        .eq("user_id", user.id)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        // PGRST116 means no rows found, which is fine
        throw checkError;
      }

      if (existingRSVP) {
        // Remove RSVP
        const { error: deleteError } = await supabase
          .from("user_events")
          .delete()
          .eq("event_id", eventId)
          .eq("user_id", user.id);

        if (deleteError) throw deleteError;

        // Update local state
        setUserRSVPs((prev) => prev.filter((id) => id !== eventId));
        alert("RSVP removed!");
      } else {
        // Add RSVP
        const { error: insertError } = await supabase
          .from("user_events")
          .insert([
            {
              event_id: eventId,
              user_id: user.id,
              status: "attending",
            },
          ]);

        if (insertError) throw insertError;

        // Update local state
        setUserRSVPs((prev) => [...prev, eventId]);
        alert("RSVP confirmed!");
      }

      // Refresh events to update attendee counts
      fetchEvents();
    } catch (error) {
      console.error("Error handling RSVP:", error);
      alert(error instanceof Error ? error.message : "Failed to update RSVP");
    }
  };

  const handleTestSubmit = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("You must be logged in");
        return;
      }

      // Example event data
      const eventData = {
        title: "Test Event",
        description: "This is a test event",
        location: "Test Location",
        room: "101",
        date: "2025-12-01",
        start_time: "10:00:00",
        end_time: "12:00:00",
        latitude: 41.872219,
        longitude: -87.649204,
        max_capacity: 50,
        attendee_count: 0,
        created_by: user.id,
      };

      const { data: eventResult, error: eventError } = await supabase
        .from("events")
        .insert([eventData])
        .select()
        .single();

      if (eventError) throw eventError;

      // Example tags
      const tagNames = ["technology", "workshop"];

      for (const tagName of tagNames) {
        let { data: existingTag, error: tagFetchError } = await supabase
          .from("tags")
          .select("id")
          .eq("name", tagName)
          .single();

        let tagId;

        if (tagFetchError || !existingTag) {
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

        await supabase.from("event_tags").insert([
          {
            event_id: eventResult.id,
            tag_id: tagId,
          },
        ]);
      }

      alert("Test event created successfully!");
      console.log("Created event:", eventResult);
      fetchEvents(); // Refresh events after creating
    } catch (error) {
      console.error("Error:", error);
      alert(
        error instanceof Error ? error.message : "Failed to create test event"
      );
    }
  };

  // Filter events based on search and tag
  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !filterTag || event.tags.includes(filterTag);
    return matchesSearch && matchesTag;
  });

  //when a user clicks on a marker, sets the event for info window
  const handleMarkerClick = (event: Event) => {
    setClickedEvent(event);
  };

  //make the window popup for when an event is clicked (Needs work)
  const infoWindow = clickedEvent && (
    <InfoWindow
      onCloseClick={() => setClickedEvent(null)}
      position={{ lat: clickedEvent.lat!, lng: clickedEvent.lng! }}
    >
      <div className="p-4">
        <h4 className="text-sm text-center">{clickedEvent.title}</h4>
        <p className="text-sm">Date: {clickedEvent.date}</p>
        <p className="text-sm">
          Time: {clickedEvent.start_time} - {clickedEvent.end_time}
        </p>
        <p className="text-sm">About: {clickedEvent.description}</p>
      </div>
    </InfoWindow>
  );

  if (!isLoaded) return <p>Loading...</p>;

  return (
    <div className="flex h-screen">
      <Sidebar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterTag={filterTag}
        setFilterTag={setFilterTag}
        view={view}
        setView={setView}
        filteredEvents={filteredEvents}
        allTags={allTags}
        onSelectEvent={handleSelectEvent}
        onRSVP={handleRSVP}
        userRSVPs={userRSVPs}
      />

      <div className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl mb-4">Home</h1>
        {loading ? (
          <p>Loading events...</p>
        ) : (
          <p>Welcome to the event tracker - {events.length} events loaded</p>
        )}

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setShowCreateEventModal(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Create Event
          </button>

          <button
            onClick={handleTestSubmit}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Test Submit
          </button>
        </div>
        <div className="w-full h-screen">
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "500px" }}
            center={centerMap}
            zoom={17}
          >
            <MarkerClusterer>
              {(clusterer) => (
                <>
                  {filtered.map((event) => (
                    <Marker
                      key={event.id}
                      position={{ lat: event.lat!, lng: event.lng! }}
                      onClick={() => handleMarkerClick(event)}
                      clusterer={clusterer}
                    />
                  ))}
                </>
              )}
            </MarkerClusterer>
            {infoWindow}
          </GoogleMap>
        </div>

        <CreateEventModal
          isOpen={showCreateEventModal}
          onClose={() => setShowCreateEventModal(false)}
          onSuccess={fetchEvents}
        />
      </div>
    </div>
  );
}

export default Home;
