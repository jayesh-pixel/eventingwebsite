"use client";
import React, { useState, useEffect } from "react";
import { artists as artistsConfig } from "@/utils/config";
import axios from "axios";
import Link from "next/link";

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

export default function ArtistsPage() {
  const [search, setSearch] = useState("");
  const [artists, setArtists] = useState<Artist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch artists from API
  useEffect(() => {
    const fetchArtists = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get<ApiResponse>(artistsConfig.GET_ALL);
        
        if (response.data && !response.data.error) {
          // Sort by priority
          const sortedArtists = (response.data.data || [])
            .sort((a, b) => (b.Priority || 0) - (a.Priority || 0));
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

  const filteredArtists = artists.filter(artist =>
    artist.Name.toLowerCase().includes(search.toLowerCase()) ||
    (artist.Description && artist.Description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
      <section className="py-8 sm:py-14 bg-gradient-to-b from-slate-900 to-slate-950 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
              All <span className="bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">Artists</span>
            </h1>
            <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto">
              Discover amazing artists and their upcoming events
            </p>
          </div>

          <div className="mb-6 sm:mb-8 flex justify-center">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search artists by name or description..."
              className="w-full max-w-md px-4 sm:px-6 py-3 text-base rounded-lg border border-slate-700 bg-slate-800 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00E1FC]"
            />
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-6">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="glass-card rounded-2xl overflow-hidden animate-pulse">
                  <div className="h-44 sm:h-64 bg-slate-800 rounded-2xl mb-2 sm:mb-4"></div>
                  <div className="text-center p-2 sm:p-4">
                    <div className="h-6 bg-slate-800 rounded mb-2"></div>
                    <div className="h-4 bg-slate-800 rounded w-24 mx-auto"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-6">
              {filteredArtists.map((artist, index) => {
                // Get image URL from API response or use default
                const imageUrl = artist.Images && artist.Images.length > 0 
                  ? artist.Images[0].image_path.startsWith('http')
                    ? artist.Images[0].image_path
                    : `${process.env.NEXT_PUBLIC_BACKEND_URL}/${artist.Images[0].image_path}`
                  : `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop&sig=${index}`;

                return (
                  <Link href={`/artists/${artist._id}`} key={artist._id} legacyBehavior>
                    <a className="glass-card rounded-2xl overflow-hidden group cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl animate-fadeInUp">
                      <div className="relative overflow-hidden rounded-2xl mb-2 sm:mb-4">
                        <img
                          src={imageUrl}
                          alt={`${artist.Name} - Artist`}
                          className="w-full h-44 sm:h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop&sig=${index}`;
                          }}
                        />
                      </div>
                      <div className="text-center p-2 sm:p-4">
                        <h3 className="text-sm sm:text-lg font-semibold mb-1 truncate group-hover:text-[#00E1FC] transition-colors duration-300">
                          {artist.Name}
                        </h3>
                        <p className="text-slate-400 text-xs sm:text-sm line-clamp-2">
                          {artist.Description ? artist.Description.slice(0, 40) + (artist.Description.length > 40 ? '...' : '') : 'Music Artist'}
                        </p>
                      </div>
                    </a>
                  </Link>
                );
              })}
            </div>
          )}

          {!isLoading && filteredArtists.length === 0 && (
            <div className="text-center text-slate-400 mt-10 sm:mt-16">
              <div className="text-5xl sm:text-6xl mb-4">🎤</div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2">No Artists Found</h3>
              <p className="text-base sm:text-lg">Try searching with different keywords or check back later for more artists.</p>
            </div>
          )}
        </div>
      </section>
  );
}
