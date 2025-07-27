"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Users, Music, Mic, Guitar, Piano, Keyboard } from "lucide-react";
import { mockArtists } from "@/data/mockData";

export default function ArtistsSection() {
  const [artists, setArtists] = useState<typeof mockArtists>(mockArtists);
  const [isLoading, setIsLoading] = useState(false);

  const getGenreIcon = (genre: string) => {
    if (genre.includes("Electronic") || genre.includes("House")) return Music;
    if (genre.includes("Pop") || genre.includes("Indie")) return Mic;
    if (genre.includes("Rock") || genre.includes("Metal")) return Guitar;
    if (genre.includes("Jazz") || genre.includes("Blues")) return Piano;
    if (genre.includes("Synthwave") || genre.includes("Retro")) return Keyboard;
    return Guitar;
  };

  const getGenreColor = (genre: string) => {
    if (genre.includes("Electronic") || genre.includes("House")) return "primary";
    if (genre.includes("Pop") || genre.includes("Indie")) return "secondary";
    if (genre.includes("Rock") || genre.includes("Metal")) return "accent";
    if (genre.includes("Jazz") || genre.includes("Blues")) return "destructive";
    if (genre.includes("Synthwave") || genre.includes("Retro")) return "primary";
    return "secondary";
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {artists?.map((artist, index) => {
            const IconComponent = getGenreIcon(artist.genre);
            const colorClass = getGenreColor(artist.genre);
            
            return (
              <div 
                key={artist.id}
                className="group cursor-pointer animate-fadeInUp"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className="relative overflow-hidden rounded-2xl mb-4">
                  <img 
                    src={artist.imageUrl}
                    alt={`${artist.name} - ${artist.genre}`}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className={`bg-${colorClass}/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium flex items-center`}>
                      <IconComponent className="mr-1 h-3 w-3" />
                      {artist.eventCount} Events
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className={`text-lg font-semibold mb-1 group-hover:text-${colorClass} transition-colors duration-300`}>
                    {artist.name}
                  </h3>
                  <p className="text-slate-400 text-sm">{artist.genre}</p>
                </div>
              </div>
            );
          })}
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
