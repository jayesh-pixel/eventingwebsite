"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ArrowRight, Clock, MapPin, Sparkles } from "lucide-react";
import axios from "axios";
import Link from "next/link";
import { featuredEvents as featuredEventsConfig } from "@/utils/config";

interface FeaturedEvent {
  event_id: string;
  EventName: string;
  EventStartDate: string;
  EventStartTime: string;
  EventCardImages: Array<{
    image_path: string;
    _id: string;
  }>;
  LowestticketPrice: number | null;
  isFeatured: number;
  VenueName: string;
  VenueCity: string;
  CategoryName?: string;
}

interface ApiResponse {
  error: boolean;
  message: string;
  data: FeaturedEvent[];
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

export default function FeaturedEvents() {
  const [featuredEvents, setFeaturedEvents] = useState<FeaturedEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setIsLoading(true);
        const response = await axios.post<ApiResponse>(
          featuredEventsConfig.GET_ALL
        );
        if (response.data && !response.data.error) {
          setFeaturedEvents(response.data.data || []);
        } else {
          setFeaturedEvents([]);
        }
      } catch (error) {
        console.error("Failed to fetch featured events:", error);
        setFeaturedEvents([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  const displayEvents = useMemo(() => {
    return featuredEvents.filter((e) => {
      const hasImage =
        Array.isArray(e.EventCardImages) && e.EventCardImages.length > 0;
      return hasImage;
    });
  }, [featuredEvents]);

  if (isLoading) {
    return (
      <section className="relative border-y border-[#FF6B6B]/20 bg-gradient-to-b from-[#FF6B6B]/[0.07] via-black to-black py-8 sm:py-10">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="mb-6 h-12 w-56 animate-pulse rounded-xl bg-slate-800" />
          <div className="flex overflow-x-auto gap-3 sm:gap-6 md:gap-8 pb-6 snap-x snap-mandatory scroll-smooth scrollbar-hide">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[68vw] max-w-[250px] sm:max-w-[270px] sm:w-[260px] md:w-[300px] lg:w-[320px] snap-start"
              >
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden animate-pulse">
                  <div className="h-40 sm:h-52 bg-slate-800"></div>
                  <div className="p-3.5 sm:p-5">
                    <div className="h-4 bg-slate-800 rounded mb-2"></div>
                    <div className="h-3 bg-slate-800 rounded mb-2"></div>
                    <div className="h-3 bg-slate-800 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (displayEvents.length === 0) {
    return null;
  }

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
    const container = document.getElementById("featured-scroll-container");
    if (!container || displayEvents.length === 0) return;
    const cardWidth = container.scrollWidth / displayEvents.length;
    container.scrollTo({
      left: cardWidth * index * 4,
      behavior: "smooth",
    });
    setActiveIndex(index);
  };

  return (
    <section className="relative border-y border-[#FF6B6B]/20 bg-gradient-to-b from-[#FF6B6B]/[0.07] via-black to-black py-8 sm:py-10">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[300px] w-full max-w-[600px] -translate-x-1/2 rounded-full bg-[#FF6B6B]/10 blur-[120px]" />
      <div className="relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-1.5 rounded-full bg-gradient-to-b from-[#FF6B6B] to-[#FF8E53]" />
            <div>
              <h2 className="text-xl font-bold text-white sm:text-2xl md:text-3xl">
                Featured <span className="text-[#FF6B6B]">Events</span>
              </h2>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Handpicked just for you
              </span>
            </div>
          </div>
          <Link
            href="/events/featured"
            className="group inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#FF6B6B] px-3 py-1.5 text-[11px] font-bold text-white transition-all hover:bg-[#FF6B6B]/90 sm:px-4 sm:py-2 sm:text-xs"
          >
            View all
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <div className="relative">
          <div 
            id="featured-scroll-container"
            className="flex overflow-x-auto gap-3 sm:gap-6 md:gap-8 pb-6 snap-x snap-mandatory scroll-smooth scrollbar-hide items-stretch"
            onScroll={handleScroll}
          >
            {displayEvents.map((event, index) => (
              <Link
                key={event.event_id}
                href={`/events/${event.event_id}`}
                className="block flex-shrink-0 w-[68vw] max-w-[250px] sm:max-w-[270px] sm:w-[260px] md:w-[300px] lg:w-[320px] snap-start"
              >
                <div
                  className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-[#FF6B6B]/10 hover:border-[#FF6B6B]/30 hover:-translate-y-1 flex flex-col h-full"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Image Section */}
                  <div className="relative h-40 sm:h-52 overflow-hidden flex-shrink-0">
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
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      Featured
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-3.5 sm:p-5 flex flex-col flex-1 min-w-0">
                    <h4 className="text-base sm:text-lg font-bold text-white mb-2 sm:mb-2.5 line-clamp-2 break-words group-hover:text-[#FF6B6B] transition-colors duration-300">{event.EventName}</h4>

                    <div className="space-y-1.5 mb-3">
                      <div className="flex items-center min-w-0 text-slate-400 text-sm">
                        <Clock className="h-4 w-4 mr-2 text-[#00E1FC] flex-shrink-0" />
                        <span className="truncate">{event.EventStartTime}</span>
                      </div>
                      <div className="flex items-center min-w-0 text-slate-400 text-sm">
                        <MapPin className="h-4 w-4 mr-2 text-[#00E1FC] flex-shrink-0" />
                        <span className="truncate">{event.VenueName}{event.VenueCity ? `, ${event.VenueCity}` : ''}</span>
                      </div>
                    </div>

                    <div className="flex flex-row items-center justify-between gap-2 pt-3 border-t border-slate-800 mt-auto">
                      <div>
                        {event.LowestticketPrice === null ? (
                          <>
                            <div className="text-base font-bold text-slate-500">No Tickets</div>
                            <div className="text-xs text-slate-600">Available soon</div>
                          </>
                        ) : event.LowestticketPrice === 0 ? (
                          <>
                            <div className="text-xl font-bold text-[#00E1FC]">Free</div>
                            <div className="text-xs text-slate-500">&nbsp;</div>
                          </>
                        ) : (
                          <>
                            <div className="text-xl font-bold text-[#00E1FC]">₹{event.LowestticketPrice}</div>
                            <div className="text-xs text-slate-500">onwards</div>
                          </>
                        )}
                      </div>
                      {event.LowestticketPrice !== null && (
                        <button className="bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] hover:from-[#FF6B6B]/90 hover:to-[#FF8E53]/90 text-white text-sm px-4 py-2.5 sm:px-5 sm:py-2 rounded-lg font-medium shadow-md hover:shadow-lg hover:shadow-[#FF6B6B]/20 transition-all duration-300 whitespace-nowrap">Book Now</button>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Navigation Dots */}
          {displayEvents.length > 6 && (
            <div className="flex justify-center items-center gap-2 mt-4">
              {[...Array(totalDots)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollToIndex(index)}
                  className={`relative transition-all duration-300 rounded-full before:absolute before:-inset-3 ${
                    activeIndex === index 
                      ? 'w-8 h-2 bg-[#FF6B6B]' 
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
