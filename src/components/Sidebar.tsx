import React, { useState } from "react";
import { Search, Filter, ChevronDown, ChevronUp } from "lucide-react";
import EventCard from "./EventCard";
import type { Event } from "../types";

interface SidebarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterTags: string[];
  setFilterTags: (tags: string[]) => void;
  view: "map" | "list";
  setView: (view: "map" | "list") => void;
  filteredEvents: Event[];
  allTags: string[];
  onSelectEvent: (event: Event) => void;
  onRSVP: (id: string) => void;
  userRSVPs: string[];
}

const Sidebar: React.FC<SidebarProps> = ({
  searchQuery,
  setSearchQuery,
  filterTags,
  setFilterTags,
  view,
  setView,
  filteredEvents,
  allTags,
  onSelectEvent,
  onRSVP,
  userRSVPs,
}) => {
  const [showAllTags, setShowAllTags] = useState(false);

  const maxVisibleTags = 6; // Show 6 tags initially
  const visibleTags = showAllTags ? allTags : allTags.slice(0, maxVisibleTags);

  const toggleTag = (tag: string) => {
    if (filterTags.includes(tag)) {
      setFilterTags(filterTags.filter((t) => t !== tag));
    } else {
      setFilterTags([...filterTags, tag]);
    }
  };
  return (
    <aside className="w-80 bg-white border-r overflow-y-auto h-full flex flex-col">
      <div className="p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>

        {/* Filters */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Filter size={18} />
              <span className="font-medium">Filters</span>
            </div>
            {filterTags.length > 0 && (
              <button
                onClick={() => setFilterTags([])}
                className="text-xs text-purple-600 hover:text-purple-700"
              >
                Clear all
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {visibleTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  filterTags.includes(tag)
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
          {allTags.length > maxVisibleTags && (
            <button
              onClick={() => setShowAllTags(!showAllTags)}
              className="mt-2 flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 transition-colors"
            >
              {showAllTags ? (
                <>
                  Show less <ChevronUp size={16} />
                </>
              ) : (
                <>
                  Show all ({allTags.length - maxVisibleTags} more){" "}
                  <ChevronDown size={16} />
                </>
              )}
            </button>
          )}
        </div>

        {/* View Toggle */}
        {/* <div className="flex gap-2">
          <button
            onClick={() => setView("map")}
            className={`flex-1 py-2 rounded ${
              view === "map" ? "bg-purple-600 text-white" : "bg-gray-100"
            }`}
          >
            Map View
          </button>
          <button
            onClick={() => setView("list")}
            className={`flex-1 py-2 rounded ${
              view === "list" ? "bg-purple-600 text-white" : "bg-gray-100"
            }`}
          >
            List View
          </button>
        </div> */}

        {/* Events List */}
        <div className="space-y-3 pb-4">
          <h3 className="font-semibold">{filteredEvents.length} Events</h3>
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onSelect={onSelectEvent}
              onRSVP={onRSVP}
              isRSVPd={userRSVPs.includes(event.id)}
            />
          ))}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
