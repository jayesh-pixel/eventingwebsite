"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Calendar } from "lucide-react";
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
            className="flex overflow-x-auto gap-5 sm:gap-6 md:gap-8 pb-6 snap-x snap-mandatory scroll-smooth scrollbar-hide"
            onScroll={handleScroll}
          >
            {displayEvents.length > 0 ? (
              displayEvents.map((event, index) => (
                <Link
                  key={event.event_id}
                  href={`/events/${event.event_id}`}
                  className="block flex-shrink-0 w-[240px] sm:w-[260px] md:w-[280px] lg:w-[300px] snap-center"
                >
                  <div
                    className="relative h-[360px] sm:h-[380px] bg-slate-950/80 border border-slate-800 rounded-2xl overflow-hidden group cursor-pointer transition-all duration-300 hover:scale-[1.02] shadow-lg"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Image Section */}
                    <div className="relative h-[190px] sm:h-[210px] overflow-hidden">
                      <img
                        src={getImageUrl(event.EventCardImages?.[0]?.image_path || "")}
                        alt={event.EventName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>

                      {/* Featured Badge - Top Left */}
                      {event.isFeatured === 1 && (
                        <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                          <span className="text-sm">⭐</span>
                          <span className="ml-1">Featured</span>
                        </div>
                      )}

                      {/* Date Badge - Top Right */}
                      <div className="absolute top-3 right-3 bg-white/95 border border-blue-200/60 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
                        {formatShortDate(event.EventStartDate)}
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-4 h-[170px] sm:h-[170px] flex flex-col bg-slate-950/70">
                      <div className="flex items-start justify-between gap-3 min-h-0">
                        <div className="flex-1 min-h-0 min-w-0 overflow-hidden">
                          <h4 className="text-base font-semibold mb-2 text-white line-clamp-2">{event.EventName}</h4>

                          <div className="flex items-center gap-3 mb-3">
                            {/* Category pill (if available) */}
                            {event.CategoryName && (
                              <span className="text-blue-300 text-xs font-medium px-2 py-1 rounded-full border border-blue-500/30 bg-blue-500/10">{event.CategoryName}</span>
                            )}

                            {/* Attendee avatars + count (only when provided by API) */}
                            {event.AttendeeAvatars && event.AttendeeAvatars.length > 0 && (
                              <div className="flex items-center gap-2">
                                <div className="flex -space-x-2">
                                  {event.AttendeeAvatars.slice(0,3).map((a, i) => (
                                    <img
                                      key={i}
                                      src={getImageUrl(a.image_path)}
                                      className="h-6 w-6 rounded-full border border-white"
                                      alt={`avatar-${i}`}
                                    />
                                  ))}
                                </div>
                                {typeof event.AttendeeCount === 'number' && (
                                  <span className="text-slate-300 text-xs">{event.AttendeeCount.toLocaleString()} going</span>
                                )}
                              </div>
                            )}
                          </div>

                          <p className="text-slate-300 text-sm flex items-center gap-2 min-w-0">
                            <svg className="h-4 w-4 text-slate-400 flex-shrink-0" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            <span className="opacity-90 truncate">{event.VenueName}{event.VenueCity ? `, ${event.VenueCity}` : ''}</span>
                          </p>
                        </div>

                        {/* Bookmark icon */}
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-slate-500 hover:text-slate-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 2h8a2 2 0 0 1 2 2v17l-6-3-6 3V4a2 2 0 0 1 2-2z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                      </div>

                      <div className="mt-auto pt-2">
                        <div className="flex items-center justify-between">
                          <div className="text-blue-300 font-bold text-lg">{typeof event.LowestticketPrice === 'number' ? `₹${event.LowestticketPrice}` : ''}</div>
                          <div className="text-slate-400 text-xs">{event.EventStartTime || ''}</div>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="text-slate-500 text-xs">{/* optional metadata */}</div>
                          <div>
                            <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium">Book Now</button>
                          </div>
                        </div>
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
