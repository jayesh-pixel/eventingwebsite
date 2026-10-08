"use client";
import { useState, useEffect } from "react";
import { Users } from "lucide-react";
import Link from "next/link";
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

interface VenuesApiResponse {
  error: boolean;
  message: string;
  data: Venue[];
}

export default function VenuesPage() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [venueTypes, setVenueTypes] = useState<string[]>(["All"]);

  // Fetch venues from API
  useEffect(() => {
    const fetchVenues = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get<VenuesApiResponse>(venuesConfig.GET_ALL);
        
        if (response.data && !response.data.error) {
          // Sort by priority
          const sortedVenues = (response.data.data || [])
            .sort((a, b) => (b.Priority || 0) - (a.Priority || 0));
          setVenues(sortedVenues);
          
          // Extract unique venue types
          const types = ["All", ...Array.from(new Set(sortedVenues.map(v => v.VenueType || "Other")))];
          setVenueTypes(types);
        } else {
          console.error('API Error:', response.data.message);
          setVenues([]);
        }
      } catch (error) {
        console.error('Failed to fetch venues:', error);
        setVenues([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVenues();
  }, []);

  const filteredVenues = (filter === "All" ? venues : venues.filter(v => (v.VenueType || "Other") === filter))
    .filter(v => 
      v.Name.toLowerCase().includes(search.toLowerCase()) || 
      (v.City && v.City.toLowerCase().includes(search.toLowerCase())) ||
      (v.Address && v.Address.toLowerCase().includes(search.toLowerCase()))
    );

  return (
      <section className="py-8 sm:py-14 bg-gradient-to-b from-slate-900 to-slate-950 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 text-white">
              Discover Amazing <span className="text-[#00E1FC]">Venues</span>
            </h1>
            <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto">
              Find the perfect venue for your next event. From intimate gatherings to grand celebrations.
            </p>
          </div>

          {/* Filter Buttons — only worth showing when venues span more than one type */}
          {venueTypes.length > 2 && (
          <div className="mb-6 sm:mb-8 flex flex-wrap gap-2 sm:gap-3 justify-center">
            {venueTypes.map(type => (
              <button
                key={type}
                className={`px-4 py-2.5 sm:px-6 sm:py-3 rounded-full font-medium border transition-all duration-300 text-sm transform hover:scale-105 ${
                  filter === type
                    ? "bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] text-white border-transparent shadow-lg shadow-[#00E1FC]/25"
                    : "bg-slate-900/70 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white hover:border-[#00E1FC]/50"
                }`}
                onClick={() => setFilter(type)}
              >
                {type}
              </button>
            ))}
          </div>
          )}

          {/* Search Bar */}
          <div className="mb-8 sm:mb-10 flex justify-center">
            <div className="relative w-full max-w-md">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search venues by name or location..."
                className="w-full pl-4 pr-11 py-3 sm:px-6 sm:py-4 text-base rounded-xl border border-slate-700 bg-slate-800/50 backdrop-blur-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00E1FC] focus:border-transparent transition-all duration-300"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          {/* Venues Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-8">
            {isLoading ? (
              // Enhanced Loading skeleton
              [...Array(6)].map((_, i) => (
                <div key={i} className="glass-card rounded-2xl overflow-hidden animate-pulse">
                  <div className="h-44 sm:h-64 bg-gradient-to-r from-slate-800 to-slate-700 rounded-t-2xl"></div>
                  <div className="p-3 sm:p-6 space-y-3">
                    <div className="h-6 bg-slate-800 rounded-lg"></div>
                    <div className="h-4 bg-slate-800 rounded w-3/4 sm:w-32"></div>
                    <div className="h-3 bg-slate-800 rounded w-full"></div>
                    <div className="h-5 bg-slate-800 rounded w-20"></div>
                  </div>
                </div>
              ))
            ) : (
              filteredVenues.map((venue, index) => {
                // Get image URL from API response or use default
                const imageUrl = venue.Images && venue.Images.length > 0 
                  ? venue.Images[0].image_path.startsWith('http')
                    ? venue.Images[0].image_path
                    : `${process.env.NEXT_PUBLIC_BACKEND_URL}/${venue.Images[0].image_path}`
                  : `https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=500&h=400&fit=crop&sig=${index}`;

                // Get location string
                const location = [venue.City, venue.State, venue.Country].filter(Boolean).join(', ') || venue.Address || 'Location TBA';

                return (
                  <Link href={`/venues/${venue._id}`} key={venue._id} legacyBehavior>
                    <a className="glass-card rounded-2xl overflow-hidden group cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#00E1FC]/10 animate-fadeInUp" style={{animationDelay: `${index * 0.1}s`}}>
                      <div className="relative h-44 sm:h-64 overflow-hidden">
                        <img
                          src={imageUrl}
                          alt={venue.Name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=500&h=400&fit=crop&sig=${index}`;
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent"></div>
                        
                        {/* Capacity Badge */}
                        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 max-w-[calc(100%-1rem)]">
                          <div className="bg-slate-900/80 backdrop-blur-sm text-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium border border-slate-700 truncate">
                            {venue.VenueType || "Venue"}
                          </div>
                        </div>

                        {/* Capacity Info */}
                        <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4">
                          <div className="bg-[#00E1FC]/90 backdrop-blur-sm text-white px-2 py-1 sm:px-4 sm:py-2 rounded-full text-[10px] sm:text-sm font-medium flex items-center shadow-lg whitespace-nowrap">
                            <Users className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                            {venue.Capacity ? venue.Capacity.toLocaleString() : 'TBA'} capacity
                          </div>
                        </div>

                        {/* Overlay gradient for better text readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      </div>
                      
                      <div className="p-3 sm:p-6 bg-gradient-to-b from-slate-800/50 to-slate-900/50">
                        <h3 className="text-sm sm:text-xl font-bold mb-1 sm:mb-2 truncate group-hover:text-[#00E1FC] transition-colors duration-300">
                          {venue.Name}
                        </h3>
                        <div className="flex items-start gap-1 sm:gap-2 mb-2 sm:mb-3">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-[#00E1FC] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed min-w-0 truncate sm:whitespace-normal">{location}</p>
                        </div>
                        <p className="text-slate-500 text-xs sm:text-sm mb-2 sm:mb-4 leading-relaxed line-clamp-2 sm:line-clamp-none">
                          {venue.Description ? 
                            venue.Description.slice(0, 120) + (venue.Description.length > 120 ? '...' : '') : 
                            'A venue perfect for hosting memorable events and celebrations.'
                          }
                        </p>
                        
                        {/* Action area */}
                        <div className="flex items-center justify-between">
                          <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-slate-700 to-slate-600 text-slate-200 border border-slate-600">
                            {venue.VenueType || "Event Venue"}
                          </span>
                          <div className="flex items-center text-[#00E1FC] text-xs sm:text-sm font-medium group-hover:translate-x-1 transition-transform duration-300">
                            View Details
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </a>
                  </Link>
                );
              })
            )}
          </div>
          {/* No Results State */}
          {!isLoading && filteredVenues.length === 0 && (
            <div className="text-center mt-10 py-10 sm:mt-20 sm:py-16">
              <div className="text-6xl sm:text-8xl mb-6">🏢</div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">No Venues Found</h3>
              <p className="text-base sm:text-xl text-slate-400 mb-8 max-w-md mx-auto">
                We couldn't find any venues matching your search criteria. Try adjusting your filters or search terms.
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setFilter("All");
                }}
                className="bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] text-white px-8 py-3 rounded-full font-medium hover:shadow-lg hover:shadow-[#00E1FC]/25 transition-all duration-300 transform hover:scale-105"
              >
                Reset Filters
              </button>
            </div>
          )}

          {/* Stats Section */}
          {!isLoading && filteredVenues.length > 0 && (
            <div className="mt-10 sm:mt-16 text-center">
              <div className="inline-flex items-center px-6 py-3 bg-slate-800/50 backdrop-blur-sm rounded-full border border-slate-700">
                <span className="text-slate-400">Showing</span>
                <span className="mx-2 text-[#00E1FC] font-bold">{filteredVenues.length}</span>
                <span className="text-slate-400">venues</span>
                {filter !== "All" && (
                  <>
                    <span className="text-slate-400 ml-2">in</span>
                    <span className="ml-2 text-accent font-medium">{filter}</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
  );
}
