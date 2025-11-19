import { useState } from "react";
import CreateEventModal from "../components/CreateEventModal";
import Sidebar from "../components/Sidebar";
import supabase from "../utils/supabase";

function Home() {
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [view, setView] = useState<"map" | "list">("list");

  // Dummy data for now
  const dummyEvents = [
    {
      id: "1",
      title: "Tech Meetup",
      description: "A gathering for tech enthusiasts",
      location: "Downtown",
      date: "2025-12-01",
      start_time: "10:00:00",
      end_time: "12:00:00",
      tags: ["technology"],
      attendees: 25,
      max_capacity: 50,
      created_by: "user-123",
    },
  ];

  const allTags = ["technology", "workshop", "social"];
  const userRSVPs: string[] = [];

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
    } catch (error) {
      console.error("Error:", error);
      alert(
        error instanceof Error ? error.message : "Failed to create test event"
      );
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterTag={filterTag}
        setFilterTag={setFilterTag}
        view={view}
        setView={setView}
        filteredEvents={dummyEvents}
        allTags={allTags}
        onSelectEvent={handleSelectEvent}
        onRSVP={handleRSVP}
        userRSVPs={userRSVPs}
      />

      <div className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl mb-4">Home</h1>
        <p>Welcome to the event tracker</p>

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setShowModal(true)}
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
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      </div>
    </div>
  );
}

export default Home;
