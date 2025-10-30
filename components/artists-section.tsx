"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Users, Music, Mic, Guitar, Piano, Keyboard } from "lucide-react";
import { mockArtists } from "@/data/mockData";
import { artists as artistsConfig } from "@/utils/config";
import axios from "axios";

interface Artist {
  _id: string;
  Name: string;
  Email: string | null;
  PhoneNo: string | null;
  Description: string | null;
  Images: Array<{
    image_path: string;
    _id: string;
  }>;
  Priority: number;
  status: number;
}

interface ApiResponse {
  error: boolean;
  message: string;
  data: Artist[];
}

export default function ArtistsSection() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  // Fetch artists from API
  useEffect(() => {
    const fetchArtists = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get<ApiResponse>(artistsConfig.GET_ALL);
        
        if (response.data && !response.data.error) {
          // Sort by priority and take first 12 artists
          const sortedArtists = (response.data.data || [])
            .sort((a, b) => (b.Priority || 0) - (a.Priority || 0))
            .slice(0, 12);
          setArtists(sortedArtists);
        } else {
          console.error('API Error:', response.data.message);
          setArtists([]);
        }
      } catch (error) {
        console.error('Failed to fetch artists:', error);
        setArtists([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArtists();
  }, []);

  // Handle scroll to update active dot
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollPosition = container.scrollLeft;
    const cardWidth = container.scrollWidth / artists.length;
    const newIndex = Math.round(scrollPosition / (cardWidth * 6)); // 6 cards visible at once
    setActiveIndex(newIndex);
  };

  // Scroll to specific section
  const scrollToIndex = (index: number) => {
    const container = document.getElementById('artists-scroll-container');
    if (container) {
      const cardWidth = container.scrollWidth / artists.length;
      container.scrollTo({
        left: cardWidth * index * 6, // 6 cards at a time
        behavior: 'smooth'
      });
      setActiveIndex(index);
    }
  };

  // Calculate total number of dots needed (groups of 6 cards)
  const totalDots = Math.ceil(artists.length / 6);

  const getGenreIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("dj") || lowerName.includes("music")) return Music;
    if (lowerName.includes("king") || lowerName.includes("verma")) return Mic;
    if (lowerName.includes("walker") || lowerName.includes("ritviz")) return Guitar;
    if (lowerName.includes("karan") || lowerName.includes("madhur")) return Piano;
    if (lowerName.includes("rain") || lowerName.includes("keinemusik")) return Keyboard;
    return Guitar;
  };

  const getGenreColor = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("dj") || lowerName.includes("music")) return "primary";
    if (lowerName.includes("king") || lowerName.includes("verma")) return "secondary";
    if (lowerName.includes("walker") || lowerName.includes("ritviz")) return "accent";
    if (lowerName.includes("karan") || lowerName.includes("madhur")) return "destructive";
    return "primary";
  };

  if (isLoading) {
    return (
      <section className="py-12 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto space-x-3 pb-4 snap-x snap-mandatory scroll-smooth scrollbar-hide">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[calc(16.666%-10px)] min-w-[160px] snap-center">
                <div className="group cursor-pointer animate-pulse">
                  <div className="relative overflow-hidden rounded-xl mb-3">
                    <div className="w-full h-44 bg-slate-800"></div>
                  </div>
                  <div className="text-center">
                    <div className="h-4 bg-slate-800 rounded mb-1"></div>
                    <div className="h-3 bg-slate-800 rounded w-20 mx-auto"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* <div className="text-center mb-16 animate-fadeInUp">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Browse Events by 
            <span className="bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent"> Artists</span>
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Follow your favorite artists and discover new talents performing at exclusive venues worldwide.
          </p>
        </div> */}

        {/* Horizontal Scrollable Container - Shows 6 cards at a time */}
        <div className="relative">
          <div 
            id="artists-scroll-container"
            className="flex overflow-x-auto space-x-3 pb-4 snap-x snap-mandatory scroll-smooth scrollbar-hide"
            onScroll={handleScroll}
          >
            {artists && artists.length > 0 ? (
              artists.map((artist, index) => {
              const IconComponent = getGenreIcon(artist.Name);
              const colorClass = getGenreColor(artist.Name);

              const badgeBgClassMap: Record<string, string> = {
                primary: 'bg-slate-800/75',
                secondary: 'bg-slate-800/75',
                accent: 'bg-indigo-900/75',
                destructive: 'bg-rose-900/75',
              };
              const badgeBgClass = badgeBgClassMap[colorClass] || 'bg-slate-800/75';
              
              // Get image URL from API response or use default
              const imageUrl = artist.Images && artist.Images.length > 0 
                ? artist.Images[0].image_path.startsWith('http')
                  ? artist.Images[0].image_path
                  : `${process.env.NEXT_PUBLIC_BACKEND_URL}/${artist.Images[0].image_path}`
                : `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop&sig=${index}`;

              return (
                <div 
                  key={artist._id}
                  className="flex-shrink-0 w-[calc(16.666%-10px)] min-w-[160px] snap-center group cursor-pointer animate-fadeInUp"
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <div className="relative overflow-hidden rounded-xl mb-3">
                    <img 
                      src={imageUrl}
                      alt={`${artist.Name} - Artist`}
                      className="w-full h-44 object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop&sig=${index}`;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className={`${badgeBgClass} backdrop-blur-sm px-2 py-0.5 rounded-full text-xs font-medium flex items-center`}>
                          <IconComponent className="mr-1 h-2.5 w-2.5 text-white" />
                          <span className="text-white">View Events</span>
                        </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-sm font-semibold mb-1 text-white transition-colors duration-300">
                      {artist.Name}
                    </h3>
                    <p className="text-slate-400 text-xs line-clamp-1">
                      {artist.Description ? artist.Description.slice(0, 40) + (artist.Description.length > 40 ? '...' : '') : 'Music Artist'}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex-shrink-0 w-full text-center py-8">
              <Users className="h-12 w-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-base">No artists available at the moment.</p>
              <p className="text-slate-500 text-sm mt-2">Please check back later for amazing artists!</p>
            </div>
          )}
          </div>
          
          {/* Navigation Dots */}
          {artists.length > 6 && (
            <div className="flex justify-center items-center gap-2 mt-4">
              {[...Array(totalDots)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollToIndex(index)}
                  className={`transition-all duration-300 rounded-full ${
                    activeIndex === index 
                      ? 'w-8 h-2 bg-primary' 
                      : 'w-2 h-2 bg-slate-600 hover:bg-slate-500'
                  }`}
                  aria-label={`Go to page ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <Link href="/artists">
            <button className="group flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 hover:text-[#00E1FC] transition-all duration-300 border border-slate-700/50 rounded-lg hover:border-[#00E1FC]/50 hover:bg-slate-800/50">
              Discover More Artists
              <Users className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
