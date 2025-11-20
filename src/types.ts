export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  room: string;
  lat?: number;
  lng?: number;
  latitude?: number;
  longitude?: number;
  date: string;
  start_time: string;
  end_time: string;
  tags: string[];
  max_capacity: number;
  attendees: number;
  created_by: string;
}