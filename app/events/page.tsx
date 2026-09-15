"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Search, Grid, List } from "lucide-react";
import { upcomingEvents as upcomingEventsConfig } from "@/utils/config";
import axios from "axios";
import Link from "next/link";

interface Event {
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
  data: Event[];
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const response = await axios.post<ApiResponse>(upcomingEventsConfig.GET_ALL);
        
        if (response.data && !response.data.error) {
          setEvents(response.data.data || []);
          setFilteredEvents(response.data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch events:', error);
        setEvents([]);
        setFilteredEvents([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    const filtered = events.filter(event =>
      event.EventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.VenueName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.VenueCity.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEvents(filtered);
  }, [searchTerm, events]);

  const getImageUrl = (imagePath: string) => {
    return imagePath.startsWith('http') 
      ? imagePath 
      : `${process.env.NEXT_PUBLIC_BACKEND_URL}/${imagePath}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-slate-800 rounded w-1/3"></div>
            <div className="h-12 bg-slate-800 rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 bg-slate-800 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-2 text-white">
            <span className="bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] bg-clip-text text-transparent">All</span>
            {" "}<span className="text-white">Events</span>
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Discover amazing events happening around you. Book your tickets now!
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
            <Input
              placeholder="Search events, venues, or cities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-400 focus:border-[#00E1FC] focus:ring-1 focus:ring-[#00E1FC]/20 transition-all"
            />
          </div>
          
          <div className="flex gap-3">
            <div className="flex border border-slate-700 rounded-lg bg-slate-800/30 p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className={`h-9 px-3 ${viewMode === "grid" ? "bg-[#00E1FC] text-white hover:bg-[#00E1FC]/90" : "text-slate-400 hover:bg-slate-700/50 hover:text-white"} transition-all`}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className={`h-9 px-3 ${viewMode === "list" ? "bg-[#00E1FC] text-white hover:bg-[#00E1FC]/90" : "text-slate-400 hover:bg-slate-700/50 hover:text-white"} transition-all`}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-5">
          <p className="text-sm text-slate-400 font-medium">
            {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Events Grid/List */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-slate-400 mb-2">No Events Found</h3>
            <p className="text-slate-500">Try adjusting your search criteria.</p>
          </div>
        ) : (
          <div className={
            viewMode === "grid" 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }>
            {filteredEvents.map((event) => (
              <Link key={event.event_id} href={`/events/${event.event_id}`} className={viewMode === "grid" ? "block h-full" : ""}>
                <Card className={`bg-slate-900/50 backdrop-blur-sm border-slate-800 overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-[#00E1FC]/10 hover:border-slate-700 hover:-translate-y-1 ${
                  viewMode === "list" ? "flex flex-col sm:flex-row" : "h-full flex flex-col"
                }`}>
                  <div className={`relative overflow-hidden ${
                    viewMode === "list" ? "w-full sm:w-60 md:w-80 h-48 sm:h-52" : "h-48 sm:h-52"
                  }`}>
                    <img
                      src={
                        event.EventCardImages && event.EventCardImages.length > 0
                          ? getImageUrl(event.EventCardImages[0].image_path)
                          : ''
                      }
                      alt={event.EventName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent"></div>
                    
                    <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md border border-slate-700/50 px-3 py-1.5 rounded-lg">
                      <div className="text-xs font-semibold text-[#00E1FC]">{event.EventStartDate}</div>
                    </div>
                    
                    {event.isFeatured === 1 && (
                      <div className="absolute top-3 left-3 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                        Featured
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-3 line-clamp-2 group-hover:text-[#00E1FC] transition-colors duration-300">
                        {event.EventName}
                      </h3>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-slate-400 text-sm">
                          <Clock className="h-4 w-4 mr-2 text-[#00E1FC] flex-shrink-0" />
                          <span className="truncate">{event.EventStartTime}</span>
                        </div>
                        <div className="flex items-center text-slate-400 text-sm">
                          <MapPin className="h-4 w-4 mr-2 text-[#00E1FC] flex-shrink-0" />
                          <span className="truncate">{event.VenueName}, {event.VenueCity}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-start gap-2 pt-3 border-t border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="text-xl font-bold text-[#00E1FC]">₹{event.LowestticketPrice}</div>
                        <div className="text-xs text-slate-500">onwards</div>
                      </div>
                      <Button className="bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] hover:from-[#00E1FC]/90 hover:to-[#0F33D1]/90 text-white text-sm px-4 sm:px-5 py-2 shadow-md hover:shadow-lg hover:shadow-[#00E1FC]/20 transition-all duration-300 whitespace-nowrap">
                        Book Now
                      </Button>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
