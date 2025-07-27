"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { mockEvents } from "@/data/mockData";

export default function UpcomingEvents() {
  const [allEvents, setAllEvents] = useState<typeof mockEvents>(mockEvents);
  const [isLoading, setIsLoading] = useState(false);

  const featuredEvents = allEvents.filter(event => event.featured === "true");
  const upcomingEvents = allEvents.filter(event => event.featured !== "true").slice(0, 2);
  const featuredEvent = featuredEvents[0];

  if (isLoading) {
    return (
      <section className="py-20 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 glass-card rounded-3xl overflow-hidden animate-pulse">
              <div className="h-80 bg-slate-800"></div>
              <div className="p-8">
                <div className="h-8 bg-slate-800 rounded mb-4"></div>
                <div className="h-4 bg-slate-800 rounded mb-6"></div>
                <div className="flex justify-between">
                  <div className="h-6 bg-slate-800 rounded w-32"></div>
                  <div className="h-6 bg-slate-800 rounded w-16"></div>
                </div>
              </div>
            </div>
            <div className="space-y-8">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="glass-card rounded-2xl overflow-hidden animate-pulse">
                  <div className="h-48 bg-slate-800"></div>
                  <div className="p-6">
                    <div className="h-4 bg-slate-800 rounded mb-2"></div>
                    <div className="h-6 bg-slate-800 rounded mb-4"></div>
                    <div className="flex justify-between">
                      <div className="h-4 bg-slate-800 rounded w-16"></div>
                      <div className="h-4 bg-slate-800 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fadeInUp">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-accent to-destructive bg-clip-text text-transparent">Upcoming</span>
            {" "}Events
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Don't miss these incredible experiences. Book your tickets now for the hottest events.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Featured Event */}
          {featuredEvent && (
            <div className="lg:col-span-2">
              <div className="glass-card rounded-3xl overflow-hidden group cursor-pointer transition-all duration-500 hover:shadow-2xl hover:shadow-primary/25 animate-slideInLeft">
                <div className="relative h-80 overflow-hidden">
                  <img 
                    src={featuredEvent.imageUrl}
                    alt={featuredEvent.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent"></div>
                  
                  <div className="absolute top-6 left-6 bg-destructive/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
                    Featured Event
                  </div>
                  
                  <div className="absolute top-6 right-6 glass-card text-center p-4 rounded-xl">
                    <div className="text-2xl font-bold text-accent">{featuredEvent.date.split(' ')[0]}</div>
                    <div className="text-sm text-slate-300">{featuredEvent.date.split(' ')[1]}</div>
                  </div>
                </div>
                
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-medium">
                      {featuredEvent.category}
                    </span>
                    <span className="text-slate-400 text-sm">{featuredEvent.venue}</span>
                  </div>
                  <h3 className="text-3xl font-bold mb-3 group-hover:text-primary transition-colors duration-300">
                    {featuredEvent.title}
                  </h3>
                  <p className="text-slate-400 mb-6 leading-relaxed">
                    {featuredEvent.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex -space-x-2">
                        <div className="w-10 h-10 rounded-full border-2 border-slate-700 bg-gradient-to-r from-primary to-secondary"></div>
                        <div className="w-10 h-10 rounded-full border-2 border-slate-700 bg-gradient-to-r from-secondary to-accent"></div>
                        <div className="w-10 h-10 rounded-full border-2 border-slate-700 bg-slate-800 flex items-center justify-center">
                          <span className="text-xs font-medium">+3</span>
                        </div>
                      </div>
                      <span className="text-sm text-slate-400">5 Artists</span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-accent">${featuredEvent.price}</div>
                      <div className="text-sm text-slate-400">per ticket</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Smaller Events */}
          <div className="space-y-8">
            {upcomingEvents.map((event, index) => (
              <div 
                key={event.id}
                className="glass-card rounded-2xl overflow-hidden group cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-secondary/25 animate-slideInRight"
                style={{animationDelay: `${index * 0.2}s`}}
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent"></div>
                  <div className="absolute top-4 right-4 glass-card text-center p-2 rounded-lg">
                    <div className="text-lg font-bold text-accent">{event.date.split(' ')[0]}</div>
                    <div className="text-xs text-slate-300">{event.date.split(' ')[1]}</div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-secondary/20 text-secondary px-2 py-1 rounded-full text-xs">
                      {event.category}
                    </span>
                  </div>
                  <h4 className="text-lg font-semibold mb-2 group-hover:text-secondary transition-colors duration-300">
                    {event.title}
                  </h4>
                  <p className="text-slate-400 text-sm mb-4">{event.venue}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-accent font-medium">${event.price}</span>
                    <span className="text-xs text-slate-500">{event.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-12">
          <Button className="bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] px-8 py-3 hover:shadow-lg hover:shadow-[#00E1FC]/25 transition-all duration-300 transform hover:scale-105">
            <Calendar className="mr-2 h-4 w-4" />
            View All Events
          </Button>
        </div>
      </div>
    </section>
  );
}
