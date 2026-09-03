"use client";
import { useState, useEffect } from "react";
import { Users, MapPin } from "lucide-react";
import axios from "axios";
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
    venueEvents: any[];
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
  venueEvents: any[];
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
                <div className="h-12 bg-slate-800 rounded-lg w-96 mx-auto mb-4"></div>
                <div className="h-6 bg-slate-800 rounded w-64 mx-auto"></div>
              </div>
              
              {/* Content skeleton */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div className="space-y-6">
                  <div className="rounded-3xl overflow-hidden h-[420px] bg-gradient-to-r from-slate-800 to-slate-700"></div>
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
            <div className="text-8xl mb-8">🏢</div>
            <h2 className="text-4xl font-bold text-white mb-6">Venue Not Found</h2>
            <p className="text-xl text-slate-400 mb-8 leading-relaxed">
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
      <section className="py-12 sm:py-14 bg-gradient-to-b from-slate-900 to-slate-950 min-h-screen">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header Section */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              <span className="text-[#00E1FC]">
                {venue.venueName}
              </span>
            </h1>
            <div className="flex items-center justify-center gap-3 text-xl text-slate-300 mb-4">
              <MapPin className="text-[#00E1FC] h-6 w-6" />
              <span>{location}</span>
            </div>
            <p className="text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
              {venue.venueDescription || `${venue.venueName} is a premium venue perfect for hosting amazing events.`}
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-20">
            {/* Left side: Image Gallery */}
            <div className="space-y-6">
              {/* Main Image */}
              <div className="relative rounded-3xl overflow-hidden h-[500px] group">
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

                {/* Image overlay info */}
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-slate-900/80 backdrop-blur-sm rounded-2xl p-4 border border-slate-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Users className="text-[#00E1FC] h-5 w-5" />
                        <span className="text-white font-medium">Premium Venue</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-green-400 text-sm">Available</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Image thumbnails */}
              {venue.venueImages && venue.venueImages.length > 1 && (
                <div className="grid grid-cols-3 gap-4">
                  {venue.venueImages.slice(0, 3).map((image, index) => (
                    <div key={index} className="rounded-xl overflow-hidden h-24 bg-slate-800">
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
            <div className="space-y-8">
              {/* Venue Details Card */}
              <div className="glass-card rounded-3xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Venue Details</h2>

                <div className="space-y-6">
                  {/* Location */}
                  <div className="flex items-start gap-4">
                    <div className="bg-[#00E1FC]/20 p-3 rounded-xl">
                      <MapPin className="text-[#00E1FC] h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold mb-1">Location</h3>
                      <p className="text-slate-400 leading-relaxed">{location}</p>
                    </div>
                  </div>

                  {/* Capacity */}
                  <div className="flex items-start gap-4">
                    <div className="bg-[#00E1FC]/20 p-3 rounded-xl">
                      <Users className="text-[#00E1FC] h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold mb-1">Capacity</h3>
                      <p className="text-slate-400">Perfect for events of all sizes</p>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="flex items-start gap-4">
                    <div className="bg-[#00E1FC]/20 p-3 rounded-xl">
                      <svg className="text-[#00E1FC] h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold mb-1">Features</h3>
                      <p className="text-slate-400">Modern amenities and professional setup</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 mt-8">
                  <button className="px-6 py-4 border border-slate-600 text-slate-300 rounded-xl hover:bg-slate-800 hover:border-[#00E1FC] transition-all duration-300">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Map Section */}
              <div className="glass-card rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-slate-700">
                  <h3 className="text-xl font-bold text-white">Location & Directions</h3>
                </div>
                <div className="h-80">
                  {venue.venueMapLocation ? (
                    <div dangerouslySetInnerHTML={{ __html: venue.venueMapLocation }} />
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
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Upcoming Events</h2>
              <p className="text-slate-400">Discover what's happening at this venue</p>
            </div>
            
            {venue.venueEvents && venue.venueEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {venue.venueEvents.map((event, index) => (
                  <div key={index} className="glass-card rounded-2xl p-6 group hover:shadow-xl hover:shadow-[#00E1FC]/10 transition-all duration-500">
                    <div className="flex items-start justify-between mb-4">
                      <div className="bg-gradient-to-r from-[#00E1FC]/20 to-[#0F33D1]/20 p-3 rounded-xl">
                        <svg className="text-[#00E1FC] h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-medium">
                        Upcoming
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#00E1FC] transition-colors duration-300">
                      {event.name || event.title || 'Special Event'}
                    </h3>
                    <p className="text-slate-400 text-sm mb-3">
                      {event.date || 'Date TBA'}
                    </p>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      {event.description || event.details || 'An exciting event coming soon. Stay tuned for more details!'}
                    </p>
                    
                    <div className="mt-4 pt-4 border-t border-slate-700">
                      <button className="text-[#00E1FC] text-sm font-medium hover:text-white transition-colors duration-300">
                        Learn More →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-6">📅</div>
                <h3 className="text-2xl font-bold text-white mb-4">No Upcoming Events</h3>
                <p className="text-slate-400 max-w-md mx-auto">
                  This venue currently has no scheduled events. Check back later for exciting updates!
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
  );}