"use client";
import { useState, useEffect } from "react";
import { MapPin } from "lucide-react";
import axios from "axios";
import Link from "next/link";
import { venues as venuesConfig } from "@/utils/config";

interface Venue {
  _id: string;
  Name: string;
  Address: string | null;
  City: string | null;
  State: string | null;
  Country: string | null;
  Capacity: number | null;
  Description: string | null;
  Images: Array<{
    image_path: string;
    _id: string;
  }>;
  Priority: number;
  status: number;
  VenueType: string | null;
}

interface VenueEvent {
  event_id: string;
  EventName: string;
  EventStartDate?: string;
  EventStartTime?: string;
  LowestticketPrice?: number;
  EventCardImages?: Array<{ image_path: string; _id: string }>;
}

interface VenueEventsResponse {
  error: boolean;
  message: string;
  data: {
    venueName: string;
    venueImages: Array<{
      image_path: string;
      _id: string;
    }>;
    venueAddress: string;
    venueDescription: string;
    venueMapLocation: string;
    venueEvents: VenueEvent[];
  };
}

interface VenueDetailsParams {
  id: string;
}

interface VenueDetail {
  venueName: string;
  venueImages: Array<{
    image_path: string;
    _id: string;
  }>;
  venueAddress: string;
  venueDescription: string;
  venueMapLocation: string;
  venueEvents: VenueEvent[];
}

export default function VenueDetails({ params }: { params: VenueDetailsParams }) {
  const [venue, setVenue] = useState<VenueDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVenueDetail = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching venue with ID:', params.id);

        const response = await axios.post<VenueEventsResponse>(
          venuesConfig.GET_BY_ID,
          { venue_id: params.id }
        );
        console.log('API Response:', response.data);
        
        if (response.data.error) {
          console.log('API Error:', response.data.message);
          setError(response.data.message);
        } else {
          console.log('Venue data:', response.data.data);
          
          if (response.data.data.venueName) {
            setVenue(response.data.data);
          } else {
            console.log('Venue not found in response');
            setError('Venue not found');
          }
        }
      } catch (err) {
        console.error('Error fetching venue detail:', err);
        setError('Failed to fetch venue details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVenueDetail();
  }, [params.id]);

  if (isLoading) {
    return (
        <section className="py-12 sm:py-14 bg-gradient-to-b from-slate-900 to-slate-950 min-h-screen">
          <div className="max-w-6xl mx-auto px-4">
            {/* Enhanced Loading State */}
            <div className="animate-pulse">
              {/* Header skeleton */}
              <div className="text-center mb-10">
                <div className="h-12 bg-slate-800 rounded-lg w-3/4 sm:w-96 mx-auto mb-4"></div>
                <div className="h-6 bg-slate-800 rounded w-64 mx-auto"></div>
              </div>
              
              {/* Content skeleton */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div className="space-y-6">
                  <div className="rounded-3xl overflow-hidden h-64 sm:h-[420px] bg-gradient-to-r from-slate-800 to-slate-700"></div>
                  <div className="grid grid-cols-3 gap-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-24 bg-slate-800 rounded-xl"></div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-8">
                  <div className="space-y-4">
                    <div className="h-8 bg-slate-800 rounded w-48"></div>
                    <div className="h-6 bg-slate-800 rounded w-full"></div>
                    <div className="h-16 bg-slate-800 rounded w-full"></div>
                  </div>
                  <div className="h-80 bg-slate-800 rounded-2xl"></div>
                </div>
              </div>
            </div>
          </div>
        </section>
    );
  }

  if (error || !venue) {
    return (
        <section className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950 px-4 text-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="text-6xl sm:text-8xl mb-6 sm:mb-8">🏢</div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 sm:mb-6">Venue Not Found</h2>
            <p className="text-base sm:text-xl text-slate-400 mb-8 leading-relaxed">
              {error || "We couldn't find the venue you're looking for. It might have been moved or doesn't exist."}
            </p>
            <div className="space-y-4">
              <button
                onClick={() => window.history.back()}
                className="bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] text-white px-8 py-3 rounded-full font-medium hover:shadow-lg hover:shadow-[#00E1FC]/25 transition-all duration-300 transform hover:scale-105"
              >
                Go Back
              </button>
              <br />
              <a
                href="/venues"
                className="inline-block text-slate-400 hover:text-[#00E1FC] transition-colors duration-300"
              >
                Browse All Venues →
              </a>
            </div>
          </div>
        </section>
    );
  }

  // Get image URL from API response or use default
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';
  const imageUrl = venue.venueImages && venue.venueImages.length > 0 
    ? venue.venueImages[0].image_path.startsWith('http')
      ? venue.venueImages[0].image_path
      : `${BACKEND_URL}/${venue.venueImages[0].image_path}`
    : `https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&h=600&fit=crop&sig=${params.id}`;

  // Get location string
  const location = venue.venueAddress || 'Location TBA';

  return (
      <section className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 py-5 sm:py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header Section */}
          <div className="mb-5 text-center sm:mb-7">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-white break-words">
              <span className="text-[#00E1FC]">
                {venue.venueName}
              </span>
            </h1>
            <div className="flex items-start sm:items-center justify-center gap-2 sm:gap-3 text-base sm:text-xl text-slate-300 mb-4">
              <MapPin className="text-[#00E1FC] h-5 w-5 sm:h-6 sm:w-6 shrink-0 mt-0.5 sm:mt-0" />
              <span className="min-w-0 break-words">{location}</span>
            </div>
            <p className="mx-auto max-w-3xl text-sm leading-relaxed text-slate-400 sm:text-base">
              {venue.venueDescription || `${venue.venueName} is a venue perfect for hosting amazing events.`}
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="mb-8 grid grid-cols-1 items-start gap-5 lg:grid-cols-2 lg:gap-7">
            {/* Left side: Image Gallery */}
            <div className="space-y-3">
              {/* Main Image */}
              <div className="group relative h-52 overflow-hidden rounded-2xl sm:h-80">
                <img
                  src={imageUrl}
                  alt={venue.venueName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&h=600&fit=crop&sig=${params.id}`;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* Image overlay info removed per request */}
              </div>

              {/* Image thumbnails */}
              {venue.venueImages && venue.venueImages.length > 1 && (
                <div className="grid grid-cols-3 gap-2">
                  {venue.venueImages.slice(0, 3).map((image, index) => (
                    <div key={index} className="rounded-xl overflow-hidden h-20 sm:h-24 bg-slate-800">
                      <img
                        src={image.image_path.startsWith('http') ? image.image_path : `${process.env.NEXT_PUBLIC_BACKEND_URL}/${image.image_path}`}
                        alt={`${venue.venueName} view ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=200&h=150&fit=crop&sig=${index}`;
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right side: Details and Map */}
            <div className="space-y-5">
              {/* Venue Details Card */}
              <div className="glass-card rounded-2xl p-5 sm:p-6">
                <h2 className="mb-4 text-xl font-bold text-white">Venue Details</h2>

                <div className="space-y-5 sm:space-y-6">
                  {/* Location */}
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="bg-[#00E1FC]/20 p-3 rounded-xl shrink-0">
                      <MapPin className="text-[#00E1FC] h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-white font-semibold mb-1">Location</h3>
                      <p className="text-slate-400 leading-relaxed break-words">{location}</p>
                    </div>
                  </div>

                </div>

                {/* Action buttons removed per request */}
              </div>

              {/* Map Section */}
              <div className="glass-card overflow-hidden rounded-2xl">
                <div className="p-4 sm:p-6 border-b border-slate-700">
                  <h3 className="text-xl font-bold text-white">Location & Directions</h3>
                </div>
                <div className="h-56 sm:h-64">
                  {venue.venueMapLocation ? (
                    <div className="h-full [&_iframe]:h-full [&_iframe]:w-full [&_iframe]:max-w-full" dangerouslySetInnerHTML={{ __html: venue.venueMapLocation }} />
                  ) : (
                    <iframe
                      title="Venue Location"
                      src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(location)}`}
                      className="w-full h-full"
                      frameBorder="0"
                      allowFullScreen
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Events Section */}
          <div className="mb-10">
            <div className="mb-5 text-left sm:mb-7">
              <h2 className="mb-1 text-2xl font-bold text-white sm:text-3xl">Upcoming Events</h2>
              <p className="text-slate-400">Discover what's happening at this venue</p>
            </div>
            
            {venue.venueEvents && venue.venueEvents.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {venue.venueEvents.map((event, index) => (
                  <Link
                    key={event.event_id || index}
                    href={`/events/${event.event_id}`}
                    className="glass-card group overflow-hidden rounded-2xl transition-all duration-300 hover:border-[#00E1FC]/30 hover:shadow-xl hover:shadow-[#00E1FC]/10"
                  >
                    {event.EventCardImages?.[0]?.image_path && (
                      <img
                        src={event.EventCardImages[0].image_path.startsWith("http") ? event.EventCardImages[0].image_path : `${BACKEND_URL}/${event.EventCardImages[0].image_path}`}
                        alt={event.EventName}
                        className="h-36 w-full object-cover sm:h-40"
                      />
                    )}
                    <div className="p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-2 mb-3 sm:mb-4">
                      <div className="bg-gradient-to-r from-[#00E1FC]/20 to-[#0F33D1]/20 p-2 sm:p-3 rounded-xl">
                        <svg className="text-[#00E1FC] h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span className="bg-green-500/20 text-green-400 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium">
                        Upcoming
                      </span>
                    </div>
                    
                    <h3 className="text-sm sm:text-xl font-bold text-white mb-1 sm:mb-2 line-clamp-2 sm:line-clamp-none break-words group-hover:text-[#00E1FC] transition-colors duration-300">
                      {event.EventName}
                    </h3>
                    <p className="text-slate-400 text-xs sm:text-sm mb-2 sm:mb-3">
                      {event.EventStartDate || 'Date TBA'}
                      {event.EventStartTime ? ` · ${event.EventStartTime}` : ''}
                    </p>
                    {typeof event.LowestticketPrice === 'number' && (
                      <p className="text-white text-sm sm:text-base font-semibold">
                        {event.LowestticketPrice === 0
                          ? 'Free'
                          : `₹ ${event.LowestticketPrice.toLocaleString()} Onwards`}
                      </p>
                    )}

                    <div className="mt-3 pt-3 sm:mt-4 sm:pt-4 border-t border-slate-700">
                      <span className="text-[#00E1FC] text-xs sm:text-sm font-medium group-hover:text-white transition-colors duration-300">
                        Learn More →
                      </span>
                    </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 sm:py-16">
                <div className="text-5xl sm:text-6xl mb-6">📅</div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">No Upcoming Events</h3>
                <p className="text-slate-400 max-w-md mx-auto">
                  This venue currently has no scheduled events. Check back later for exciting updates!
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
  );}
