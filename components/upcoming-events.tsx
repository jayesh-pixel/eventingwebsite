"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { mockEvents } from "@/data/mockData";
import { upcomingEvents as upcomingEventsConfig, featuredEvents as featuredEventsConfig } from "@/utils/config";
import axios from "axios";
import Link from "next/link";

interface UpcomingEvent {
  event_id: string;
  EventName: string;
  EventStartDate: string;
  EventStartTime: string;
  EventCardImages: Array<{
    image_path: string;
    _id: string;
  }>;
  LowestticketPrice: number;
  isFeatured: number;
  VenueName: string;
  VenueCity: string;
}

interface ApiResponse {
  error: boolean;
  message: string;
  data: UpcomingEvent[];
}

export default function UpcomingEvents() {
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [featuredEvents, setFeaturedEvents] = useState<UpcomingEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        
        // Fetch upcoming events using POST request
        const upcomingResponse = await axios.post<ApiResponse>(upcomingEventsConfig.GET_ALL);
        
        console.log('Upcoming Events Response:', upcomingResponse.data);

        if (upcomingResponse.data && !upcomingResponse.data.error) {
          setUpcomingEvents(upcomingResponse.data.data || []);
          console.log('Set upcoming events:', upcomingResponse.data.data);
        }

        // Try to fetch featured events, but don't fail if it doesn't work
        try {
          const featuredResponse = await axios.post<ApiResponse>(featuredEventsConfig.GET_ALL);
          if (featuredResponse.data && !featuredResponse.data.error) {
            setFeaturedEvents(featuredResponse.data.data || []);
          }
        } catch (featuredError) {
          console.log('Featured events not available:', featuredError);
          setFeaturedEvents([]);
        }

      } catch (error) {
        console.error('Failed to fetch events:', error);
        // Fallback to empty arrays if API fails
        setUpcomingEvents([]);
        setFeaturedEvents([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Get the first featured event or first upcoming event as main featured
  const featuredEvent = featuredEvents.length > 0 ? featuredEvents[0] : upcomingEvents[0];

  console.log('Featured Event:', featuredEvent);
  console.log('Upcoming Events Count:', upcomingEvents.length);
  console.log('Featured Events Count:', featuredEvents.length);

  // If only one event exists, show it as featured only (don't duplicate in sidebar)
  let sidebarEvents: UpcomingEvent[] = [];
  if (upcomingEvents.length > 1) {
    sidebarEvents = upcomingEvents.filter(event => event.event_id !== featuredEvent?.event_id).slice(0, 2);
  }
  // If only one event, don't show it in sidebar (already showing as featured)

  console.log('Sidebar Events:', sidebarEvents);

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

        <div className="flex flex-col space-y-8 lg:grid lg:grid-cols-3 lg:gap-8 lg:space-y-0">
          {/* Featured Event */}
          {featuredEvent ? (
            <div className={upcomingEvents.length === 1 ? "lg:col-span-3" : "lg:col-span-2"}>
              <Link href={`/events/${featuredEvent.event_id}`}>
                <div className="glass-card rounded-3xl overflow-hidden group cursor-pointer transition-all duration-500 hover:shadow-2xl hover:shadow-primary/25 animate-slideInLeft">
                  <div className="relative h-80 overflow-hidden">
                    <img 
                      src={
                        featuredEvent.EventCardImages && featuredEvent.EventCardImages.length > 0
                          ? featuredEvent.EventCardImages[0].image_path.startsWith('http')
                            ? featuredEvent.EventCardImages[0].image_path
                            : `${process.env.NEXT_PUBLIC_BACKEND_URL}/${featuredEvent.EventCardImages[0].image_path}`
                          : ''
                      }
                      alt={featuredEvent.EventName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent"></div>
                    
                    <div className="absolute top-6 left-6 bg-destructive/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
                      {featuredEvent.isFeatured ? 'Featured Event' : 'Upcoming Event'}
                    </div>
                    
                    <div className="absolute top-6 right-6 glass-card text-center p-4 rounded-xl">
                      <div className="text-2xl font-bold text-accent">{featuredEvent.EventStartDate}</div>
                    </div>
                  </div>
                  
                  <div className="p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="bg-slate-800/75 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Music Event
                      </span>
                      <span className="text-slate-400 text-sm">{featuredEvent.VenueName}, {featuredEvent.VenueCity}</span>
                    </div>
                    <h3 className="text-3xl font-bold mb-3 text-white transition-colors duration-300">
                      {featuredEvent.EventName}
                    </h3>
                    <p className="text-slate-400 mb-6 leading-relaxed">
                      Experience an amazing event at {featuredEvent.VenueName} in {featuredEvent.VenueCity}. Don't miss this incredible opportunity!
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
                        <span className="text-sm text-slate-400">Multiple Artists</span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-accent">₹{featuredEvent.LowestticketPrice}</div>
                        <div className="text-sm text-slate-400">onwards</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ) : (
            <div className="lg:col-span-2 glass-card rounded-3xl p-12 text-center">
              <Calendar className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-slate-400 mb-2">No Featured Events</h3>
              <p className="text-slate-500">Check back soon for exciting featured events!</p>
            </div>
          )}

          {/* Smaller Events - Only show if there are multiple events */}
          {upcomingEvents.length > 1 && (
            <div className="flex overflow-x-auto space-x-4 lg:flex-col lg:overflow-x-visible lg:space-x-0 lg:space-y-8">
              {sidebarEvents.map((event, index) => (
                <Link key={event.event_id} href={`/events/${event.event_id}`} className="flex-shrink-0 w-80 lg:w-auto">
                  <div 
                    className="glass-card rounded-2xl overflow-hidden group cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-secondary/25 animate-slideInRight"
                    style={{animationDelay: `${index * 0.2}s`}}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={
                          event.EventCardImages && event.EventCardImages.length > 0
                            ? event.EventCardImages[0].image_path.startsWith('http')
                              ? event.EventCardImages[0].image_path
                              : `${process.env.NEXT_PUBLIC_BACKEND_URL}/${event.EventCardImages[0].image_path}`
                            : ''
                        }
                        alt={event.EventName}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent"></div>
                      <div className="absolute top-4 right-4 glass-card text-center p-2 rounded-lg">
                        <div className="text-lg font-bold text-accent">{event.EventStartDate}</div>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-slate-800/75 text-white px-2 py-1 rounded-full text-xs">
                          Event
                        </span>
                      </div>
                      <h4 className="text-lg font-semibold mb-2 text-white transition-colors duration-300">
                        {event.EventName}
                      </h4>
                      <p className="text-slate-400 text-sm mb-4">{event.VenueName}, {event.VenueCity}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-accent font-medium">₹{event.LowestticketPrice}</span>
                        <span className="text-xs text-slate-500">{event.EventStartTime}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
              
              {/* Empty state for sidebar if no additional events */}
              {sidebarEvents.length === 0 && (
                <div className="flex-shrink-0 w-80 lg:w-auto text-center py-8">
                  <Calendar className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">More events coming soon!</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="text-center mt-12">
          <Link href="/events">
            <Button className="bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] px-8 py-3 hover:shadow-lg hover:shadow-[#00E1FC]/25 transition-all duration-300 transform hover:scale-105">
              <Calendar className="mr-2 h-4 w-4" />
              View All Events
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
