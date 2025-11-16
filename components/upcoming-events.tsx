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
  const [activeIndex, setActiveIndex] = useState(0);

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

  // Handle scroll to update active dot
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollPosition = container.scrollLeft;
    const cardWidth = container.scrollWidth / upcomingEvents.length;
    const newIndex = Math.round(scrollPosition / (cardWidth * 4)); // 4 cards visible at once
    setActiveIndex(newIndex);
  };

  // Scroll to specific section
  const scrollToIndex = (index: number) => {
    const container = document.getElementById('events-scroll-container');
    if (container) {
      const cardWidth = container.scrollWidth / upcomingEvents.length;
      container.scrollTo({
        left: cardWidth * index * 4, // 4 cards at a time
        behavior: 'smooth'
      });
      setActiveIndex(index);
    }
  };

  // Calculate total number of dots needed (groups of 4 cards)
  const totalDots = Math.ceil(upcomingEvents.length / 4);

  // console.log('Upcoming Events Count:', upcomingEvents.length);
  // console.log('Featured Events Count:', featuredEvents.length);

  if (isLoading) {
    return (
      <section className="py-12 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto space-x-3 pb-4 snap-x snap-mandatory scroll-smooth scrollbar-hide">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[calc(16.666%-10px)] min-w-[200px] snap-center">
                <div className="glass-card rounded-xl overflow-hidden animate-pulse">
                  <div className="h-36 bg-slate-800"></div>
                  <div className="p-3">
                    <div className="h-3 bg-slate-800 rounded mb-2"></div>
                    <div className="h-4 bg-slate-800 rounded mb-2"></div>
                    <div className="h-3 bg-slate-800 rounded mb-2"></div>
                    <div className="flex justify-between">
                      <div className="h-3 bg-slate-800 rounded w-14"></div>
                      <div className="h-3 bg-slate-800 rounded w-10"></div>
                    </div>
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
            <span className="bg-gradient-to-r from-accent to-destructive bg-clip-text text-transparent">Upcoming</span>
            {" "}Events
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Don't miss these incredible experiences. Book your tickets now for the hottest events.
          </p>
        </div> */}

        {/* Horizontal Scrollable Container - Shows 6 cards at a time */}
        <div className="relative">
          <div 
            id="events-scroll-container"
            className="flex overflow-x-auto space-x-3 pb-4 snap-x snap-mandatory scroll-smooth scrollbar-hide"
            onScroll={handleScroll}
          >
            {upcomingEvents && upcomingEvents.length > 0 ? (
              upcomingEvents.map((event, index) => (
                <Link 
                  key={event.event_id} 
                  href={`/events/${event.event_id}`}
                  className="block flex-shrink-0 w-[calc(16.666%-10px)] min-w-[200px] snap-center"
                >
                  <div 
                    className="glass-card rounded-xl overflow-hidden group cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-secondary/25 animate-slideInLeft"
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    <div className="relative h-36 overflow-hidden">
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
                      
                      {event.isFeatured === 1 && (
                        <div className="absolute top-2 left-2 bg-destructive/90 backdrop-blur-sm text-white px-2 py-0.5 rounded-full text-xs font-medium">
                          Featured
                        </div>
                      )}

                      <div className="absolute top-2 right-2 bg-[#00E1FC] backdrop-blur-sm border border-[#00E1FC]/30 text-center p-1.5 rounded-lg">
                        <div className="text-xs font-bold text-white">{event.EventStartDate}</div>
                      </div>
                    </div>
 
                    
                    <div className="p-3">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="bg-[#00E1FC]/20 text-[#00E1FC] border border-[#00E1FC]/30 px-2 py-0.5 rounded-full text-xs font-medium">
                          Event
                        </span>
                      </div>
                      
                      <h4 className="text-sm font-semibold mb-1.5 text-white transition-colors duration-300 line-clamp-2">
                        {event.EventName}
                      </h4>
                      
                      <p className="text-slate-400 text-xs mb-2">{event.VenueName}, {event.VenueCity}</p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-[#00E1FC] font-bold text-sm">₹{event.LowestticketPrice}</span>
                        <span className="text-xs text-slate-400">{event.EventStartTime}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="flex-shrink-0 w-full text-center py-8">
                <Calendar className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-base">No upcoming events available at the moment.</p>
                <p className="text-slate-500 text-sm mt-2">Please check back later for exciting events!</p>
              </div>
            )}
          </div>
          
          {/* Navigation Dots */}
          {upcomingEvents.length > 6 && (
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
          <Link href="/events">
            <button className="group flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 hover:text-[#00E1FC] transition-all duration-300 border border-slate-700/50 rounded-lg hover:border-[#00E1FC]/50 hover:bg-slate-800/50">
              View All Events
              <Calendar className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
