"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { categories as categoriesConfig } from "@/utils/config";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";

interface CategoryEvent {
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
  data: CategoryEvent[] | null;
}

interface CategoryEventsPageProps {
  params: { id: string };
}

export default function CategoryEventsPage({ params }: CategoryEventsPageProps) {
  const [events, setEvents] = useState<CategoryEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getImageUrl = (imagePath: string) => {
    return imagePath.startsWith("http")
      ? imagePath
      : `${process.env.NEXT_PUBLIC_BACKEND_URL}/${imagePath}`;
  };

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.post<ApiResponse>(categoriesConfig.GET_BY_ID, {
          category_id: params.id,
        });

        if (response.data?.error) {
          setError(response.data.message || "Failed to load events for this category.");
          setEvents([]);
          return;
        }

        const responseEvents = Array.isArray(response.data?.data) ? response.data.data : [];
        setEvents(responseEvents);
      } catch (err: unknown) {
        const maybeResponse = (err as any)?.response?.data as Partial<ApiResponse> | undefined;

        if (
          maybeResponse &&
          maybeResponse.error === false &&
          (!maybeResponse.data || (Array.isArray(maybeResponse.data) && maybeResponse.data.length === 0))
        ) {
          setEvents([]);
          setError(null);
          return;
        }

        setError("Failed to load events for this category.");
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchEvents();
  }, [params.id]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-8 flex items-center gap-3">
        <Link href="/" className="text-slate-400 hover:text-primary flex items-center gap-2">
          <ArrowLeft className="h-5 w-5" />
          Back to Home
        </Link>
        <h1 className="text-2xl font-bold ml-4">Category Events</h1>
      </div>
      {loading ? (
        <div className="text-center text-slate-400 py-20">Loading events...</div>
      ) : error ? (
        <div className="text-center text-red-400 py-20">{error}</div>
      ) : events.length === 0 ? (
        <div className="text-center text-slate-400 py-20">
          No events are currently available for this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <Link key={event.event_id} href={`/events/${event.event_id}`} className="block">
              <Card className="bg-slate-900/50 border-slate-800 overflow-hidden group cursor-pointer transition-all duration-300 hover:border-slate-700 hover:-translate-y-1">
                <div className="relative overflow-hidden h-52">
                  <img
                    src={
                      event.EventCardImages && event.EventCardImages.length > 0
                        ? getImageUrl(event.EventCardImages[0].image_path)
                        : ""
                    }
                    alt={event.EventName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent"></div>
                </div>

                <div className="p-5">
                  <h2 className="text-lg font-bold text-white mb-3 line-clamp-2 group-hover:text-primary transition-colors duration-300">
                    {event.EventName}
                  </h2>

                  <div className="space-y-1.5 mb-4">
                    <div className="text-sm text-slate-400">{event.EventStartDate} • {event.EventStartTime}</div>
                    <div className="text-sm text-slate-400">{event.VenueName}, {event.VenueCity}</div>
                  </div>

                  <div className="pt-3 border-t border-slate-800">
                    <div className="text-base font-semibold text-white">₹{event.LowestticketPrice}</div>
                    <div className="text-xs text-slate-500">onwards</div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
