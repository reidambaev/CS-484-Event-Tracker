import { useState, useEffect } from "react";
import CreateEventModal from "../components/CreateEventModal";
import Sidebar from "../components/Sidebar";
import supabase from "../utils/supabase";
import type { Event } from "../types";

function Home() {
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [view, setView] = useState<"map" | "list">("list");
  const [events, setEvents] = useState<Event[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const userRSVPs: string[] = [];

  // Fetch events from Supabase
  useEffect(() => {
    fetchEvents();
  }, []);

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

      // Transform the data to match the Event interface
      const transformedEvents: Event[] = eventsData.map((event: any) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        location: event.location,
        room: event.room || "",
        lat: event.lat,
        lng: event.lng,
        date: event.date,
        start_time: event.start_time,
        end_time: event.end_time,
        tags: event.event_tags.map((et: any) => et.tags.name),
        max_capacity: event.max_capacity,
        attendees: event.attendee_count || 0,
        created_by: event.created_by,
      }));

      setEvents(transformedEvents);

      // Extract all unique tags
      const uniqueTags = Array.from(
        new Set(transformedEvents.flatMap((event) => event.tags))
      );
      setAllTags(uniqueTags);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEvent = (event: any) => {
    console.log("Selected event:", event);
  };

  const handleRSVP = (id: string) => {
    console.log("RSVP to event:", id);
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

        <CreateEventModal
          isOpen={showCreateEventModal}
          onClose={() => setShowCreateEventModal(false)}
        />
      </div>
    </div>
  );
}

export default Home;
