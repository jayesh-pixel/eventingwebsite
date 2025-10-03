"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Search, Filter, Grid, List } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 pt-20" style={{backgroundColor: 'rgb(2 6 23)', color: 'rgb(248 250 252)'}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-accent to-destructive bg-clip-text text-transparent">All</span>
            {" "}Events
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Discover amazing events happening around you. Book your tickets now!
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
            <Input
              placeholder="Search events, venues, or cities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-600 text-white focus:border-accent"
            />
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-700">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            
            <div className="flex border border-slate-600 rounded-lg">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className={viewMode === "grid" ? "bg-accent" : "text-white hover:bg-slate-700"}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? "bg-accent" : "text-white hover:bg-slate-700"}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-slate-400">
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
              : "space-y-6"
          }>
            {filteredEvents.map((event) => (
              <Link key={event.event_id} href={`/events/${event.event_id}`}>
                <Card className={`glass-card border-slate-700 overflow-hidden group cursor-pointer transition-all duration-500 hover:shadow-xl hover:shadow-primary/25 ${
                  viewMode === "list" ? "flex" : ""
                }`}>
                  <div className={`relative overflow-hidden ${
                    viewMode === "list" ? "w-80 h-48" : "h-48"
                  }`}>
                    <img
                      src={
                        event.EventCardImages && event.EventCardImages.length > 0
                          ? getImageUrl(event.EventCardImages[0].image_path)
                          : ''
                      }
                      alt={event.EventName}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent"></div>
                    
                    <div className="absolute top-4 right-4 glass-card text-center p-2 rounded-lg">
                      <div className="text-sm font-bold text-accent">{event.EventStartDate}</div>
                    </div>
                    
                    {event.isFeatured === 1 && (
                      <div className="absolute top-4 left-4 bg-destructive/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
                        Featured
                      </div>
                    )}
                  </div>
                  
                  <div className={`p-6 flex-1 ${viewMode === "list" ? "flex flex-col justify-between" : ""}`}>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors duration-300">
                        {event.EventName}
                      </h3>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-slate-400 text-sm">
                          <Clock className="h-4 w-4 mr-2 text-accent" />
                          {event.EventStartTime}
                        </div>
                        <div className="flex items-center text-slate-400 text-sm">
                          <MapPin className="h-4 w-4 mr-2 text-accent" />
                          {event.VenueName}, {event.VenueCity}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-xl font-bold text-accent">₹{event.LowestticketPrice}</div>
                        <div className="text-xs text-slate-400">onwards</div>
                      </div>
                      <Button className="bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] hover:shadow-lg hover:shadow-[#00E1FC]/25 transition-all duration-300">
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
