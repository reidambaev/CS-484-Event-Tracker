import React from "react";
import { Search, Filter } from "lucide-react";
import EventCard from "./EventCard";
import type { Event } from "../types";

interface SidebarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterTag: string;
  setFilterTag: (tag: string) => void;
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
  filterTag,
  setFilterTag,
  view,
  setView,
  filteredEvents,
  allTags,
  onSelectEvent,
  onRSVP,
  userRSVPs,
}) => {
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
          <div className="flex items-center gap-2 mb-2">
            <Filter size={18} />
            <span className="font-medium">Filters</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterTag("")}
              className={`px-3 py-1 rounded-full text-sm ${
                !filterTag ? "bg-purple-600 text-white" : "bg-gray-100"
              }`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setFilterTag(tag)}
                className={`px-3 py-1 rounded-full text-sm ${
                  filterTag === tag ? "bg-purple-600 text-white" : "bg-gray-100"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2">
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
        </div>

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
