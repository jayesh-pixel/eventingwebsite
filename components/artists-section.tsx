"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Users } from "lucide-react";
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

  if (isLoading) {
    return (
      <section className="relative py-6 bg-black">
        <div className="max-w-full px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto gap-3 sm:gap-4 pb-4 snap-x snap-mandatory scroll-smooth scrollbar-hide">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[150px] sm:w-[180px] md:w-[200px] lg:w-[220px] snap-center">
                <div className="group cursor-pointer animate-pulse">
                  <div className="relative overflow-hidden rounded-lg sm:rounded-xl mb-3">
                    <div className="w-full h-40 sm:h-44 bg-slate-800"></div>
                  </div>
                  <div className="text-center space-y-1">
                    <div className="h-3 bg-slate-800 rounded"></div>
                    <div className="h-3 bg-slate-800 rounded w-16 mx-auto"></div>
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
    <div className="relative">
      {/* Horizontal Scrollable Container - Small circles */}
      <div 
        id="artists-scroll-container"
        className="flex overflow-x-auto gap-4 sm:gap-6 pb-2 snap-x snap-mandatory scroll-smooth scrollbar-hide"
        onScroll={handleScroll}
      >
        {artists && artists.length > 0 ? (
          artists.slice(0, 15).map((artist, index) => {
          
          // Get image URL from API response or use default
          const imageUrl = artist.Images && artist.Images.length > 0 
            ? artist.Images[0].image_path.startsWith('http')
              ? artist.Images[0].image_path
              : `${process.env.NEXT_PUBLIC_BACKEND_URL}/${artist.Images[0].image_path}`
            : `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop&sig=${index}`;

          return (
            <Link
              key={artist._id}
              href={`/artists/${artist._id}`}
              aria-label={`View ${artist.Name}`}
              className="flex-shrink-0 snap-center group cursor-pointer flex flex-col items-center gap-1.5"
            >
              <div className="relative overflow-hidden rounded-full w-16 h-16 sm:w-20 sm:h-20 border-2 border-blue-500/30 hover:border-blue-400 transition-all duration-300">
                <img 
                  src={imageUrl}
                  alt={`${artist.Name} - Artist`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop&sig=${index}`;
                  }}
                />
              </div>
              <p className="text-white text-[10px] sm:text-xs font-medium text-center line-clamp-1 max-w-[80px] sm:max-w-[100px]">
                {artist.Name}
              </p>
            </Link>
          );
        })
      ) : (
        <div className="flex-shrink-0 w-full text-center py-4">
          <Users className="h-8 w-8 text-slate-600 mx-auto mb-2" />
          <p className="text-slate-400 text-xs">No artists available</p>
        </div>
      )}
      </div>
    </div>
  );
}
