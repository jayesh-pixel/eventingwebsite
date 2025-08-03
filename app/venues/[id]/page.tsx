"use client"

import Navigation from "@/components/navigation";
import { Users, MapPin } from "lucide-react";

// Ensure mockVenues contains the 'events' property in its objects for proper typing.
export const mockVenues = [
  {
    id: "1",
    name: "Grand Hall",
    location: "123 Main St, Cityville",
    capacity: 500,
    description: "A spacious venue for large events.",
    imageUrl: "/images/venue1.jpg",
    type: "Conference Center",
    events: [
      {
        id: "e1",
        title: "Tech Conference 2024",
        date: "2024-07-15",
        details: "A conference for tech enthusiasts."
      }
    ]
  },
  {
    id: "2",
    name: "Skyline Rooftop",
    location: "456 High St, Cityville",
    capacity: 200,
    description: "An open-air rooftop with stunning city views.",
    imageUrl: "/images/venue2.jpg",
    type: "Rooftop",
    events: []
  }
];

interface VenueDetailsParams {
  id: string;
}

interface Event {
  id: string;
  title: string;
  date: string;
  details: string;
}

interface Venue {
  id: string;
  name: string;
  location: string;
  capacity: number;
  description: string;
  imageUrl: string;
  type: string;
  events?: Event[];
}

export default function VenueDetails({ params }: { params: VenueDetailsParams }) {
  const venue = mockVenues.find(v => v.id === params.id);

  if (!venue) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950">
          <h2 className="text-3xl font-bold text-white mb-4">Venue Not Found</h2>
          <p className="text-slate-400">The venue you are looking for does not exist.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <section className="py-16 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left side: main image */}
          <div className="rounded-2xl overflow-hidden h-96">
            <img
              src={venue.imageUrl}
              alt={venue.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Right side: details and map */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-white flex items-center gap-2">
                {venue.name}
                <Users className="text-[#00E1FC] h-6 w-6" />
              </h1>
              <p className="text-slate-300 mt-1 flex items-center gap-2">
                <MapPin className="text-[#00E1FC] h-5 w-5" />
                {venue.location}
              </p>
              <p className="text-slate-400 mt-2">{venue.description}</p>
            </div>

            <div className="rounded-2xl overflow-hidden border border-slate-700">
              <iframe
                title="Venue Location"
                src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(
                  `${venue.name}, ${venue.location}`
                )}`}
                className="w-full h-64"
                frameBorder="0"
                allowFullScreen
              />
            </div>
          </div>
        </div>

        {/* Upcoming Events Section */}
        <div className="max-w-5xl mx-auto px-4 mt-16">
          <h2 className="text-2xl font-semibold text-white mb-4">Upcoming Events At This Venue:</h2>
          {venue.events && venue.events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {venue.events.map((event: Event) => (
                <div key={event.id} className="bg-slate-800 p-6 rounded-2xl">
                  <h3 className="text-xl font-bold text-white">{event.title}</h3>
                  <p className="text-slate-400 mt-1">{event.date}</p>
                  <p className="text-slate-300 mt-2">{event.details}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-800 rounded-2xl p-8 text-center text-slate-400">
              No events available
            </div>
          )}
        </div>
      </section>
    </>
  );
}
