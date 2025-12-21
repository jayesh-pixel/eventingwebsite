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
      <section className="py-6 bg-black">
        <div className="max-w-full px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto gap-3 sm:gap-4 pb-4 snap-x snap-mandatory scroll-smooth scrollbar-hide">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[160px] sm:w-[200px] md:w-[220px] lg:w-[240px] snap-center">
                <div className="glass-card rounded-lg sm:rounded-xl overflow-hidden animate-pulse">
                  <div className="h-32 sm:h-36 md:h-40 bg-slate-800"></div>
                  <div className="p-2.5 sm:p-3">
                    <div className="h-2.5 sm:h-3 bg-slate-800 rounded mb-2"></div>
                    <div className="h-3 sm:h-4 bg-slate-800 rounded mb-2"></div>
                    <div className="h-2.5 sm:h-3 bg-slate-800 rounded mb-2"></div>
                    <div className="flex justify-between">
                      <div className="h-2.5 sm:h-3 bg-slate-800 rounded w-12 sm:w-14"></div>
                      <div className="h-2.5 sm:h-3 bg-slate-800 rounded w-8 sm:w-10"></div>
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
    <section className="bg-black">
      <div className="max-w-full px-4 sm:px-6 lg:px-8">
        {/* <div className="text-center mb-16 animate-fadeInUp">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-accent to-destructive bg-clip-text text-transparent">Upcoming</span>
            {" "}Events
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Don't miss these incredible experiences. Book your tickets now for the hottest events.
          </p>
        </div> */}

        <div className="relative">
          <div 
            id="events-scroll-container"
            className="flex overflow-x-auto gap-5 sm:gap-6 md:gap-8 pb-6 snap-x snap-mandatory scroll-smooth scrollbar-hide"
            onScroll={handleScroll}
          >
            {upcomingEvents && upcomingEvents.length > 0 ? (
              upcomingEvents.map((event, index) => (
                <Link 
                  key={event.event_id} 
                  href={`/events/${event.event_id}`}
                  className="block flex-shrink-0 w-[240px] sm:w-[260px] md:w-[280px] lg:w-[300px] snap-center"
                >
                  <div 
                    className="relative bg-slate-900 rounded-xl overflow-hidden group cursor-pointer transition-all duration-300 hover:scale-[1.02] shadow-lg animate-slideInLeft"
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    {/* Image Section */}
                    <div className="relative h-[200px] sm:h-[220px] overflow-hidden">
                      <img 
                        src={
                          event.EventCardImages && event.EventCardImages.length > 0
                            ? event.EventCardImages[0].image_path.startsWith('http')
                              ? event.EventCardImages[0].image_path
                              : `${process.env.NEXT_PUBLIC_BACKEND_URL}/${event.EventCardImages[0].image_path}`
                            : ''
                        }
                        alt={event.EventName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      
                      {/* Featured Badge - Top Left */}
                      {event.isFeatured === 1 && (
                        <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1">
                          ⭐ Featured
                        </div>
                      )}

                      {/* Date Badge - Top Right */}
                      <div className="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold">
                        {event.EventStartDate}
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-4 bg-slate-900">
                      <h4 className="text-base font-bold mb-2 text-white group-hover:text-blue-400 transition-colors duration-300 line-clamp-2 flex items-center gap-2">
                        {event.EventName}
                        <span className="bg-red-500/20 text-red-400 border border-red-400/40 px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1 flex-shrink-0">
                          ⚡ LIVE
                        </span>
                      </h4>
                      
                      <p className="text-gray-400 text-xs mb-3 line-clamp-1 flex items-center gap-1">
                        📍 {event.VenueName}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-blue-400 font-bold text-lg">₹{event.LowestticketPrice}</div>
                        <div className="text-gray-400 text-xs flex items-center gap-1">
                          ⏰ {event.EventStartTime}
                        </div>
                      </div>

                      <button className="w-full mt-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 text-sm">
                        Book Now
                      </button>
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
      </div>
    </section>
  );
}
