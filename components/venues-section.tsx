
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, MapPin } from "lucide-react";
import { mockVenues } from "@/data/mockData";

export default function VenuesSection() {
  const [venues, setVenues] = useState<typeof mockVenues>(mockVenues);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // Handle scroll to update active dot
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollPosition = container.scrollLeft;
    const cardWidth = container.scrollWidth / venues.length;
    const newIndex = Math.round(scrollPosition / (cardWidth * 6)); // 6 cards visible at once
    setActiveIndex(newIndex);
  };

  // Scroll to specific section
  const scrollToIndex = (index: number) => {
    const container = document.getElementById('venues-scroll-container');
    if (container) {
      const cardWidth = container.scrollWidth / venues.length;
      container.scrollTo({
        left: cardWidth * index * 6, // 6 cards at a time
        behavior: 'smooth'
      });
      setActiveIndex(index);
    }
  };

  // Calculate total number of dots needed (groups of 6 cards)
  const totalDots = Math.ceil(venues.length / 6);

  const getVenueColor = (capacity: number) => {
    if (capacity >= 30000) return "primary";
    if (capacity >= 10000) return "accent";
    if (capacity >= 2000) return "destructive";
    return "secondary";
  };

  if (isLoading) {
    return (
      <section className="py-12 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto space-x-3 pb-4 snap-x snap-mandatory scroll-smooth scrollbar-hide">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[calc(16.666%-10px)] min-w-[160px] snap-center">
                <div className="glass-card rounded-xl overflow-hidden animate-pulse">
                  <div className="h-36 bg-slate-800"></div>
                  <div className="p-3">
                    <div className="h-4 bg-slate-800 rounded mb-2"></div>
                    <div className="h-3 bg-slate-800 rounded mb-2"></div>
                    <div className="h-3 bg-slate-800 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* <div className="text-center mb-16 animate-fadeInUp">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Premium 
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"> Venues</span>
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Experience music in the world's most iconic venues, from intimate clubs to grand arenas.
          </p>
        </div> */}

        {/* Horizontal Scrollable Container - Shows 6 cards at a time */}
        <div className="relative">
          <div 
            id="venues-scroll-container"
            className="flex overflow-x-auto space-x-3 pb-4 snap-x snap-mandatory scroll-smooth scrollbar-hide"
            onScroll={handleScroll}
          >
            {venues?.map((venue, index) => {
              const colorClass = getVenueColor(venue.capacity);
              const hoverColorClass = {
                primary: "hover:shadow-primary/25",
                secondary: "hover:shadow-secondary/25",
                accent: "hover:shadow-accent/25",
                destructive: "hover:shadow-destructive/25",
              }[colorClass];

              const badgeBgClassMap: Record<string, string> = {
                primary: 'bg-slate-800/75',
                accent: 'bg-indigo-900/75',
                destructive: 'bg-rose-900/75',
                secondary: 'bg-slate-800/75',
              };
              const badgeBgClass = badgeBgClassMap[colorClass] || 'bg-primary/90';

              return (
                <div 
                  key={venue.id}
                  className={`flex-shrink-0 w-[calc(16.666%-10px)] min-w-[160px] snap-center glass-card rounded-xl overflow-hidden group cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl ${hoverColorClass} animate-slideInLeft`}
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <div className="relative h-36 overflow-hidden">
                    <img 
                      src={venue.imageUrl}
                      alt={venue.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent"></div>
                    <div className="absolute bottom-2 left-2">
                      <div className={`${badgeBgClass} backdrop-blur-sm px-2 py-0.5 rounded-full text-xs font-medium flex items-center`}>
                        <Users className="mr-1 h-2.5 w-2.5 text-white" />
                        <span className="text-white">{venue.capacity.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-semibold mb-1 text-white transition-colors duration-300 line-clamp-1">
                      {venue.name}
                    </h3>
                    <p className="text-slate-400 text-xs mb-2 line-clamp-1">{venue.location}</p>
                    <p className="text-slate-500 text-xs line-clamp-2">
                      {venue.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Navigation Dots */}
          {venues.length > 6 && (
            <div className="flex justify-center items-center gap-2 mt-4">
              {[...Array(totalDots)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollToIndex(index)}
                  className={`transition-all duration-300 rounded-full ${
                    activeIndex === index 
                      ? 'w-8 h-2 bg-primary' 
                      : 'w-2 h-2 bg-slate-600 hover:bg-slate-500'
                  }`}
                  aria-label={`Go to page ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <Link href="/venues">
            <button className="group flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 hover:text-[#00E1FC] transition-all duration-300 border border-slate-700/50 rounded-lg hover:border-[#00E1FC]/50 hover:bg-slate-800/50">
              Explore All Venues
              <MapPin className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
