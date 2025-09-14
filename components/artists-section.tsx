"use client";
import { useState, useEffect } from "react";
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
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="group cursor-pointer animate-pulse">
                <div className="relative overflow-hidden rounded-2xl mb-4">
                  <div className="w-full h-64 bg-slate-800"></div>
                </div>
                <div className="text-center">
                  <div className="h-6 bg-slate-800 rounded mb-1"></div>
                  <div className="h-4 bg-slate-800 rounded w-24 mx-auto"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fadeInUp">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Browse Events by 
            <span className="bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent"> Artists</span>
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Follow your favorite artists and discover new talents performing at exclusive venues worldwide.
          </p>
        </div>

        <div className="flex overflow-x-auto space-x-4 pb-4 sm:hidden">
          {artists && artists.length > 0 ? (
            artists.map((artist, index) => {
              const IconComponent = getGenreIcon(artist.Name);
              const colorClass = getGenreColor(artist.Name);
              
              // Get image URL from API response or use default
              const imageUrl = artist.Images && artist.Images.length > 0 
                ? artist.Images[0].image_path.startsWith('http')
                  ? artist.Images[0].image_path
                  : `https://node.eventingclub.in/${artist.Images[0].image_path}`
                : `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop&sig=${index}`;

              return (
                <div 
                  key={artist._id}
                  className="flex-shrink-0 w-48 group cursor-pointer animate-fadeInUp"
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <div className="relative overflow-hidden rounded-2xl mb-4">
                    <img 
                      src={imageUrl}
                      alt={`${artist.Name} - Artist`}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop&sig=${index}`;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className={`bg-${colorClass}/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium flex items-center`}>
                        <IconComponent className="mr-1 h-3 w-3" />
                        View Events
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className={`text-lg font-semibold mb-1 group-hover:text-${colorClass} transition-colors duration-300`}>
                      {artist.Name}
                    </h3>
                    <p className="text-slate-400 text-sm">
                      {artist.Description ? artist.Description.slice(0, 50) + (artist.Description.length > 50 ? '...' : '') : 'Music Artist'}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex-shrink-0 w-48 text-center py-12">
              <Users className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">No artists available at the moment.</p>
              <p className="text-slate-500 text-sm mt-2">Please check back later for amazing artists!</p>
            </div>
          )}
        </div>

        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {artists && artists.length > 0 ? (
            artists.map((artist, index) => {
              const IconComponent = getGenreIcon(artist.Name);
              const colorClass = getGenreColor(artist.Name);
              
              // Get image URL from API response or use default
              const imageUrl = artist.Images && artist.Images.length > 0 
                ? artist.Images[0].image_path.startsWith('http')
                  ? artist.Images[0].image_path
                  : `https://node.eventingclub.in/${artist.Images[0].image_path}`
                : `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop&sig=${index}`;

              return (
                <div 
                  key={artist._id}
                  className="group cursor-pointer animate-fadeInUp"
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <div className="relative overflow-hidden rounded-2xl mb-4">
                    <img 
                      src={imageUrl}
                      alt={`${artist.Name} - Artist`}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop&sig=${index}`;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className={`bg-${colorClass}/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium flex items-center`}>
                        <IconComponent className="mr-1 h-3 w-3" />
                        View Events
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className={`text-lg font-semibold mb-1 group-hover:text-${colorClass} transition-colors duration-300`}>
                      {artist.Name}
                    </h3>
                    <p className="text-slate-400 text-sm">
                      {artist.Description ? artist.Description.slice(0, 50) + (artist.Description.length > 50 ? '...' : '') : 'Music Artist'}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <Users className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">No artists available at the moment.</p>
              <p className="text-slate-500 text-sm mt-2">Please check back later for amazing artists!</p>
            </div>
          )}
        </div>

        <div className="text-center mt-12">
          <Button className="bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] px-8 py-3 hover:shadow-lg hover:shadow-[#00E1FC]/25 transition-all duration-300 transform hover:scale-105">
            <Users className="mr-2 h-4 w-4" />
            Discover More Artists
          </Button>
        </div>
      </div>
    </section>
  );
}
