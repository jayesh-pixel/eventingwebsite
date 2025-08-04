"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { categories as categoriesConfig } from "@/utils/config";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Event {
  id: string;
  Name: string;
  Description: string;
  // Add other event fields as needed
}

export default function CategoryEventsPage() {
  const { id } = useParams();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.post(categoriesConfig.GET_BY_ID, { category_id: id });
        setEvents((response.data as any).data || []);
      } catch (err: any) {
        setError("Failed to load events for this category.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchEvents();
  }, [id]);

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
        <div className="text-center text-slate-400 py-20">No events found for this category.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map(event => (
            <div key={event.id} className="bg-slate-900/80 rounded-xl p-6 border border-slate-700/50 shadow-lg">
              <h2 className="text-xl font-semibold text-white mb-2">{event.Name}</h2>
              <p className="text-slate-400 text-sm">{event.Description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
