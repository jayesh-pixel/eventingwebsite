"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Calendar, Clock, MapPin } from "lucide-react";
import axios from "axios";
import Link from "next/link";
import {
  upcomingEvents as upcomingEventsConfig,
  featuredEvents as featuredEventsConfig,
} from "@/utils/config";

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
  CategoryName?: string;
  AttendeeAvatars?: Array<{ image_path: string }>;
  AttendeeCount?: number;
}

interface ApiResponse {
  error: boolean;
  message: string;
  data: UpcomingEvent[];
}

const getImageUrl = (imagePath: string) => {
  if (!imagePath) return "";
  return imagePath.startsWith("http")
    ? imagePath
    : `${process.env.NEXT_PUBLIC_BACKEND_URL}/${imagePath}`;
};

const formatShortDate = (d?: string) => {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleString("en-US", { day: "numeric", month: "short" });
};

export default function UpcomingEvents() {
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [featuredEvents, setFeaturedEvents] = useState<UpcomingEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);

        const upcomingResponse = await axios.post<ApiResponse>(
          upcomingEventsConfig.GET_ALL
        );

        if (upcomingResponse.data && !upcomingResponse.data.error) {
          setUpcomingEvents(upcomingResponse.data.data || []);
        } else {
          setUpcomingEvents([]);
        }

        try {
          const featuredResponse = await axios.post<ApiResponse>(
            featuredEventsConfig.GET_ALL
          );
          if (featuredResponse.data && !featuredResponse.data.error) {
            setFeaturedEvents(featuredResponse.data.data || []);
          } else {
            setFeaturedEvents([]);
          }
        } catch {
          setFeaturedEvents([]);
        }
      } catch (error) {
        console.error("Failed to fetch events:", error);
        setUpcomingEvents([]);
        setFeaturedEvents([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const displayEvents = useMemo(() => {
    return upcomingEvents.filter((e) => {
      const hasImage = Array.isArray(e.EventCardImages) && e.EventCardImages.length > 0;
      const hasPrice = typeof e.LowestticketPrice === "number" && e.LowestticketPrice > 0;
      return hasImage && hasPrice;
    });
  }, [upcomingEvents]);

  const totalDots = Math.ceil(displayEvents.length / 4);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    if (!container || displayEvents.length === 0) return;
    const scrollPosition = container.scrollLeft;
    const cardWidth = container.scrollWidth / displayEvents.length;
    const newIndex = Math.round(scrollPosition / (cardWidth * 4));
    setActiveIndex(newIndex);
  };

  const scrollToIndex = (index: number) => {
    const container = document.getElementById("events-scroll-container");
    if (!container || displayEvents.length === 0) return;
    const cardWidth = container.scrollWidth / displayEvents.length;
    container.scrollTo({
      left: cardWidth * index * 4,
      behavior: "smooth",
    });
    setActiveIndex(index);
  };

  if (isLoading) {
    return (
      <section className="py-6 bg-black">
        <div className="max-w-full px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto gap-3 sm:gap-4 pb-4 snap-x snap-mandatory scroll-smooth scrollbar-hide">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[160px] sm:w-[200px] md:w-[220px] lg:w-[240px] snap-center"
              >
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
            className="flex overflow-x-auto gap-3 sm:gap-6 md:gap-8 pb-6 snap-x snap-mandatory scroll-smooth scrollbar-hide"
            onScroll={handleScroll}
          >
            {displayEvents.length > 0 ? (
              displayEvents.map((event, index) => (
                <Link
                  key={event.event_id}
                  href={`/events/${event.event_id}`}
                  className="block flex-shrink-0 w-[74vw] max-w-[270px] min-w-[230px] sm:w-[260px] md:w-[300px] lg:w-[320px] snap-start"
                >
                  <div
                    className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-[#00E1FC]/10 hover:border-slate-700 hover:-translate-y-1"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Image Section */}
                    <div className="relative h-40 sm:h-52 overflow-hidden">
                      <img
                        src={getImageUrl(event.EventCardImages?.[0]?.image_path || "")}
                        alt={event.EventName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent"></div>

                      {/* Date Badge - Top Right */}
                      <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md border border-slate-700/50 px-3 py-1.5 rounded-lg">
                        <div className="text-xs font-semibold text-[#00E1FC]">{formatShortDate(event.EventStartDate)}</div>
                      </div>

                      {/* Featured Badge - Top Left */}
                      {event.isFeatured === 1 && (
                        <div className="absolute top-3 left-3 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                          Featured
                        </div>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="p-3.5 sm:p-5">
                      <h4 className="text-[18px] sm:text-lg font-bold text-white mb-2.5 line-clamp-2 group-hover:text-[#00E1FC] transition-colors duration-300">{event.EventName}</h4>

                      <div className="space-y-1.5 mb-3">
                        <div className="flex items-center text-slate-400 text-[15px] sm:text-sm">
                          <Clock className="h-4 w-4 mr-2 text-[#00E1FC] flex-shrink-0" />
                          <span className="truncate">{event.EventStartTime}</span>
                        </div>
                        <div className="flex items-center text-slate-400 text-[15px] sm:text-sm">
                          <MapPin className="h-4 w-4 mr-2 text-[#00E1FC] flex-shrink-0" />
                          <span className="truncate">{event.VenueName}{event.VenueCity ? `, ${event.VenueCity}` : ''}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-start gap-2 pt-3 border-t border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="text-xl font-bold text-[#00E1FC]">{typeof event.LowestticketPrice === 'number' ? `₹${event.LowestticketPrice}` : ''}</div>
                          <div className="text-xs text-slate-500">onwards</div>
                        </div>
                        <button className="bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] hover:from-[#00E1FC]/90 hover:to-[#0F33D1]/90 text-white text-sm px-4 py-1.5 sm:px-5 sm:py-2 rounded-lg font-medium shadow-md hover:shadow-lg hover:shadow-[#00E1FC]/20 transition-all duration-300 whitespace-nowrap">Book Now</button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="flex-shrink-0 w-full text-center py-8">
                <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-400 text-base">No upcoming events with available tickets to show.</p>
              </div>
            )}
          </div>
          
          {/* Navigation Dots */}
          {displayEvents.length > 6 && (
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
