"use client";
import { useState } from "react";
import Navigation from "@/components/navigation-new";
import { Users } from "lucide-react";
import Link from "next/link";

export const mockVenues = [
  {
    id: "1",
    name: "Grand Hall",
    location: "Downtown",
    capacity: 500,
    description: "A spacious venue for large events.",
    imageUrl: "/images/grand-hall.jpg",
    type: "Conference"
  },
  {
    id: "2",
    name: "Rooftop Lounge",
    location: "City Center",
    capacity: 150,
    description: "Perfect for intimate gatherings.",
    imageUrl: "/images/rooftop-lounge.jpg",
    type: "Lounge"
  },
  // ...other venues
];

const venueTypes = [
  "All",
  ...Array.from(new Set(mockVenues.map(v => v.type || "Other")))
];

export default function VenuesPage() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const filteredVenues = (filter === "All" ? mockVenues : mockVenues.filter(v => (v.type || "Other") === filter))
    .filter(v => v.name.toLowerCase().includes(search.toLowerCase()) || v.location.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <Navigation />
      <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-950 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-wrap gap-4 justify-center">
            {venueTypes.map(type => (
              <button
                key={type}
                className={`px-6 py-2 rounded-full font-medium border transition-colors duration-200 text-sm ${
                  filter === type
                    ? "bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] text-white border-transparent shadow-lg"
                    : "bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white"
                }`}
                onClick={() => setFilter(type)}
              >
                {type}
              </button>
            ))}
          </div>
          <div className="mb-8 flex justify-center">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search venues by name or location..."
              className="w-full max-w-md px-6 py-3 rounded-lg border border-slate-700 bg-slate-800 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00E1FC]"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredVenues.map(venue => (
              <Link href={`/venues/${venue.id}`} key={venue.id} legacyBehavior>
                <a className="glass-card rounded-2xl overflow-hidden group cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl animate-slideInLeft">
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={venue.imageUrl}
                      alt={venue.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent"></div>
                    <div className="absolute bottom-4 left-4">
                      <div className="bg-[#00E1FC]/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                        <Users className="mr-1 h-3 w-3" />
                        {venue.capacity.toLocaleString()} capacity
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-[#00E1FC] transition-colors duration-300">
                      {venue.name}
                    </h3>
                    <p className="text-slate-400 text-sm mb-3">{venue.location}</p>
                    <p className="text-slate-500 text-xs mb-2">{venue.description}</p>
                    <span className="inline-block bg-slate-800 text-slate-300 px-3 py-1 rounded-full text-xs font-medium">
                      {venue.type || "Other"}
                    </span>
                  </div>
                </a>
              </Link>
            ))}
          </div>
          {filteredVenues.length === 0 && (
            <div className="text-center text-slate-400 mt-16 text-lg">No venues found for selected filter.</div>
          )}
        </div>
      </section>
    </>
  );
}
