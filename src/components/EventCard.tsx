import React from "react";
import { MapPin, Clock, Users } from "lucide-react";
import type { Event } from "../types";

interface EventCardProps {
  event: Event;
  onSelect: (event: Event) => void;
  onRSVP: (id: string) => void;
  isRSVPd: boolean;
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  onSelect,
  onRSVP,
  isRSVPd,
}) => {
  return (
    <div
      onClick={() => onSelect(event)}
      className="bg-white p-4 rounded-lg shadow hover:shadow-lg cursor-pointer transition-shadow"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-lg">{event.title}</h3>
        {event.tags && event.tags[0] && (
          <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
            {event.tags[0]}
          </span>
        )}
      </div>
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center">
          <Clock size={16} className="mr-2" />
          <span>{event.start_time}</span>
        </div>
        <div className="flex items-center">
          <MapPin size={16} className="mr-2" />
          <span>{event.location}</span>
        </div>
        <div className="flex items-center">
          <Users size={16} className="mr-2" />
          <span>{event.attendees || 0} attending</span>
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRSVP(event.id);
        }}
        className={`mt-3 w-full py-2 rounded ${
          isRSVPd
            ? "bg-green-100 text-green-800"
            : "bg-purple-600 text-white hover:bg-purple-700"
        }`}
      >
        {isRSVPd ? "Going" : "RSVP"}
      </button>
    </div>
  );
};

export default EventCard;
