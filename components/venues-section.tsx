"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import axios from "axios";
import { venues as venuesConfig } from "@/utils/config";

interface Venue {
  _id: string;
  Name: string;
  Address?: string | null;
  City?: string | null;
  State?: string | null;
  Country?: string | null;
  Description?: string | null;
  Priority?: number;
  Images?: Array<{ image_path: string; _id: string }>;
}

interface VenuesResponse {
  error: boolean;
  data: Venue[];
}

const fallbackImage = "/placeholder.jpg";

const imageUrl = (path?: string) => {
  if (!path) return fallbackImage;
  return path.startsWith("http")
    ? path
    : `${process.env.NEXT_PUBLIC_BACKEND_URL}/${path}`;
};

export default function VenuesSection() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const response = await axios.get<VenuesResponse>(venuesConfig.GET_ALL);
        const liveVenues = Array.isArray(response.data?.data) ? response.data.data : [];
        setVenues(
          liveVenues
            .filter((venue) => venue?._id && venue?.Name)
            .sort((a, b) => Number(b.Priority || 0) - Number(a.Priority || 0))
            .slice(0, 18)
        );
      } catch (error) {
        console.error("Failed to fetch venues:", error);
        setVenues([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVenues();
  }, []);

  const pageSize = 6;
  const totalDots = Math.ceil(venues.length / pageSize);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const container = event.currentTarget;
    if (!venues.length) return;
    const cardWidth = container.scrollWidth / venues.length;
    setActiveIndex(Math.min(totalDots - 1, Math.max(0, Math.round(container.scrollLeft / (cardWidth * pageSize)))));
  };

  const scrollToIndex = (index: number) => {
    const container = document.getElementById("venues-scroll-container");
    if (!container || !venues.length) return;
    const cardWidth = container.scrollWidth / venues.length;
    container.scrollTo({ left: cardWidth * index * pageSize, behavior: "smooth" });
    setActiveIndex(index);
  };

  if (isLoading) {
    return (
      <div className="flex gap-3 overflow-hidden px-4 pb-4 sm:gap-4 sm:px-6 lg:px-8">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="h-56 w-[150px] shrink-0 animate-pulse rounded-xl bg-slate-900 sm:w-[180px] lg:w-[220px]" />
        ))}
      </div>
    );
  }

  if (venues.length === 0) return null;

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="relative">
        <div
          id="venues-scroll-container"
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-4 scrollbar-hide sm:gap-4"
          onScroll={handleScroll}
        >
          {venues.map((venue) => {
            const location = [venue.City, venue.State, venue.Country].filter(Boolean).join(", ") || venue.Address || "Location to be announced";
            return (
              <Link
                key={venue._id}
                href={`/venues/${venue._id}`}
                className="group w-[150px] shrink-0 snap-start overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 transition hover:-translate-y-1 hover:border-[#00E1FC]/40 sm:w-[180px] md:w-[200px] lg:w-[220px]"
              >
                <div className="relative h-32 overflow-hidden sm:h-36 md:h-40">
                  <img
                    src={imageUrl(venue.Images?.[0]?.image_path)}
                    alt={venue.Name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    onError={(event) => { event.currentTarget.src = fallbackImage; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                </div>
                <div className="p-3">
                  <h3 className="line-clamp-1 text-sm font-semibold text-white group-hover:text-[#00E1FC]">{venue.Name}</h3>
                  <p className="mt-1 flex items-start gap-1 text-xs text-slate-400">
                    <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-[#00E1FC]" />
                    <span className="line-clamp-2">{location}</span>
                  </p>
                  {venue.Description && <p className="mt-2 line-clamp-2 text-xs text-slate-500">{venue.Description}</p>}
                </div>
              </Link>
            );
          })}
        </div>

        {totalDots > 1 && (
          <div className="mt-3 flex items-center justify-center gap-2">
            {[...Array(totalDots)].map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => scrollToIndex(index)}
                className={`rounded-full transition-all ${activeIndex === index ? "h-2 w-8 bg-blue-500" : "h-2 w-2 bg-slate-600 hover:bg-slate-500"}`}
                aria-label={`Show venue group ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
