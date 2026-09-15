"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Clock, MapPin, Sparkles, Calendar } from "lucide-react";
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
      <div className="bg-transparent">
        <div className="max-w-full">
          <div className="flex overflow-x-auto gap-3 sm:gap-6 md:gap-8 pb-6 snap-x snap-mandatory scroll-smooth scrollbar-hide">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[74vw] max-w-[270px] min-w-[230px] sm:w-[260px] md:w-[300px] lg:w-[320px] snap-start"
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
      </div>
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
    <div className="bg-transparent">
      <div className="max-w-full">
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
                className="block flex-shrink-0 w-[74vw] max-w-[270px] min-w-[230px] sm:w-[260px] md:w-[300px] lg:w-[320px] snap-start"
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
                  <div className="p-3.5 sm:p-5 flex flex-col flex-1">
                    <h4 className="text-[18px] sm:text-lg font-bold text-white mb-2.5 line-clamp-2 group-hover:text-[#FF6B6B] transition-colors duration-300">{event.EventName}</h4>

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

                    <div className="flex flex-col items-start gap-2 pt-3 border-t border-slate-800 sm:flex-row sm:items-center sm:justify-between mt-auto">
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
                        <button className="bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] hover:from-[#FF6B6B]/90 hover:to-[#FF8E53]/90 text-white text-sm px-4 py-1.5 sm:px-5 sm:py-2 rounded-lg font-medium shadow-md hover:shadow-lg hover:shadow-[#FF6B6B]/20 transition-all duration-300 whitespace-nowrap">Book Now</button>
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
                  className={`transition-all duration-300 rounded-full ${
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
    </div>
  );
}