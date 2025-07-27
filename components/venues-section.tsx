
"use client";

import { useState, useEffect } from "react";
import { Users } from "lucide-react";
import { mockVenues } from "@/data/mockData";

export default function VenuesSection() {
  const [venues, setVenues] = useState<typeof mockVenues>(mockVenues);
  const [isLoading, setIsLoading] = useState(false);

  const getVenueColor = (capacity: number) => {
    if (capacity >= 30000) return "primary";
    if (capacity >= 10000) return "accent";
    if (capacity >= 2000) return "destructive";
    return "secondary";
  };

  if (isLoading) {
    return (
      <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass-card rounded-2xl overflow-hidden animate-pulse">
                <div className="h-48 bg-slate-800"></div>
                <div className="p-6">
                  <div className="h-6 bg-slate-800 rounded mb-2"></div>
                  <div className="h-4 bg-slate-800 rounded mb-3"></div>
                  <div className="h-3 bg-slate-800 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fadeInUp">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Premium 
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"> Venues</span>
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Experience music in the world's most iconic venues, from intimate clubs to grand arenas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {venues?.map((venue, index) => {
            const colorClass = getVenueColor(venue.capacity);
            const hoverColorClass = {
              primary: "hover:shadow-primary/25",
              secondary: "hover:shadow-secondary/25",
              accent: "hover:shadow-accent/25",
              destructive: "hover:shadow-destructive/25",
            }[colorClass];

            return (
              <div 
                key={venue.id}
                className={`glass-card rounded-2xl overflow-hidden group cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl ${hoverColorClass} animate-slideInLeft`}
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={venue.imageUrl}
                    alt={venue.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent"></div>
                  <div className="absolute bottom-4 left-4">
                    <div className={`bg-${colorClass}/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium flex items-center`}>
                      <Users className="mr-1 h-3 w-3" />
                      {venue.capacity.toLocaleString()} capacity
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className={`text-lg font-semibold mb-2 group-hover:text-${colorClass} transition-colors duration-300`}>
                    {venue.name}
                  </h3>
                  <p className="text-slate-400 text-sm mb-3">{venue.location}</p>
                  <p className="text-slate-500 text-xs">
                    {venue.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
