import React, { useState } from "react";
import { Search, Filter, ChevronDown, ChevronUp } from "lucide-react";
import EventCard from "./EventCard";
import type { Event } from "../types";

interface SidebarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterTags: string[];
  setFilterTags: (tags: string[]) => void;
  filterDateRange: { start: string; end: string };
  setFilterDateRange: (range: { start: string; end: string }) => void;
  filterLocations: string[];
  setFilterLocations: (locations: string[]) => void;
  filterCapacityAvailable: boolean;
  setFilterCapacityAvailable: (available: boolean) => void;
  filteredEvents: Event[];
  allTags: string[];
  allLocations: string[];
  onSelectEvent: (event: Event) => void;
  onRSVP: (id: string) => void;
  userRSVPs: string[];
}

const Sidebar: React.FC<SidebarProps> = ({
  searchQuery,
  setSearchQuery,
  filterTags,
  setFilterTags,
  filterDateRange,
  setFilterDateRange,
  filterLocations,
  setFilterLocations,
  filterCapacityAvailable,
  setFilterCapacityAvailable,
  filteredEvents,
  allTags,
  allLocations,
  onSelectEvent,
  onRSVP,
  userRSVPs,
}) => {
  const [showAllTags, setShowAllTags] = useState(false);
  const [showTagFilter, setShowTagFilter] = useState(false);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [showLocationFilter, setShowLocationFilter] = useState(false);
  const [showCapacityFilter, setShowCapacityFilter] = useState(false);
  const [showAllFilters, setShowAllFilters] = useState(false);

  const maxVisibleTags = 6; // Show 6 tags initially
  const visibleTags = showAllTags ? allTags : allTags.slice(0, maxVisibleTags);

  const toggleTag = (tag: string) => {
    if (filterTags.includes(tag)) {
      setFilterTags(filterTags.filter((t) => t !== tag));
    } else {
      setFilterTags([...filterTags, tag]);
    }
  };

  const toggleLocation = (location: string) => {
    if (filterLocations.includes(location)) {
      setFilterLocations(filterLocations.filter((l) => l !== location));
    } else {
      setFilterLocations([...filterLocations, location]);
    }
  };

  const clearAllFilters = () => {
    setFilterTags([]);
    setFilterDateRange({ start: "", end: "" });
    setFilterLocations([]);
    setFilterCapacityAvailable(false);
  };

  const hasActiveFilters =
    filterTags.length > 0 ||
    filterDateRange.start ||
    filterDateRange.end ||
    filterLocations.length > 0 ||
    filterCapacityAvailable;

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
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setShowAllFilters(!showAllFilters)}
              className="flex items-center gap-2 hover:text-purple-600 transition-colors"
            >
              <Filter size={18} />
              <span className="font-medium">Filters</span>
              {showAllFilters ? (
                <ChevronUp size={18} />
              ) : (
                <ChevronDown size={18} />
              )}
            </button>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-purple-600 hover:text-purple-700"
              >
                Clear all
              </button>
            )}
          </div>

          {showAllFilters && (
            <>
              {/* Tag Filter */}
              <div className="mb-4">
                <button
                  onClick={() => setShowTagFilter(!showTagFilter)}
                  className="flex items-center justify-between w-full text-sm font-medium mb-2 hover:text-purple-600 transition-colors"
                >
                  <span>Tag</span>
                  {showTagFilter ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </button>
                {showTagFilter && (
                  <>
                    <div className="flex flex-wrap gap-2 ml-6">
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
                        className="mt-2 ml-6 flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 transition-colors"
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
                  </>
                )}
              </div>

              {/* Date & Time Range Filter */}
              <div className="mb-4">
                <button
                  onClick={() => setShowDateFilter(!showDateFilter)}
                  className="flex items-center justify-between w-full text-sm font-medium mb-2 hover:text-purple-600 transition-colors"
                >
                  <span>Date & time range</span>
                  {showDateFilter ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </button>
                {showDateFilter && (
                  <div className="ml-6 space-y-2">
                    <div>
                      <label className="text-xs text-gray-600">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={filterDateRange.start}
                        onChange={(e) =>
                          setFilterDateRange({
                            ...filterDateRange,
                            start: e.target.value,
                          })
                        }
                        className="w-full px-3 py-1.5 border rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">End Date</label>
                      <input
                        type="date"
                        value={filterDateRange.end}
                        onChange={(e) =>
                          setFilterDateRange({
                            ...filterDateRange,
                            end: e.target.value,
                          })
                        }
                        className="w-full px-3 py-1.5 border rounded text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Location Filter */}
              <div className="mb-4">
                <button
                  onClick={() => setShowLocationFilter(!showLocationFilter)}
                  className="flex items-center justify-between w-full text-sm font-medium mb-2 hover:text-purple-600 transition-colors"
                >
                  <span>Location (e.g., building)</span>
                  {showLocationFilter ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </button>
                {showLocationFilter && (
                  <div className="ml-6 space-y-1.5">
                    {allLocations.map((location) => (
                      <label
                        key={location}
                        className="flex items-center gap-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={filterLocations.includes(location)}
                          onChange={() => toggleLocation(location)}
                          className="rounded"
                        />
                        {location}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Capacity Available Filter */}
              <div className="mb-4">
                <button
                  onClick={() => setShowCapacityFilter(!showCapacityFilter)}
                  className="flex items-center justify-between w-full text-sm font-medium mb-2 hover:text-purple-600 transition-colors"
                >
                  <span>Capacity availability</span>
                  {showCapacityFilter ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </button>
                {showCapacityFilter && (
                  <div className="ml-6 text-sm text-gray-600">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filterCapacityAvailable}
                        onChange={(e) =>
                          setFilterCapacityAvailable(e.target.checked)
                        }
                        className="rounded"
                      />
                      Only show events with available spots
                    </label>
                  </div>
                )}
              </div>
            </>
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
