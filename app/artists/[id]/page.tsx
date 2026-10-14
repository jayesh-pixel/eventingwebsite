"use client";
import { useState, useEffect } from "react";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { artists as artistsConfig } from "@/utils/config";

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

interface EventsByArtistResponse {
  error: boolean;
  message: string;
  data: {
    currentArtist: Artist;
    currentArtistEvents: any[];
    otherArtists: Artist[];
  };
}

type Event = {
  id: string;
  name: string;
  date: string;
  venueId: string;
  venueName: string;
};

export default function ArtistDetail({ params }: { params: { id: string } }) {
  const [artist, setArtist] = useState<Artist | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArtistDetail = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching artist with ID:', params.id);

        const response = await axios.post<EventsByArtistResponse>(
          artistsConfig.ARTIST_BY_ID,
          { artist_id: params.id }
        );
        console.log('API Response:', response.data);
        
        if (response.data.error) {
          console.log('API Error:', response.data.message);
          setError(response.data.message);
        } else {
          console.log('Artist data:', response.data.data.currentArtist);
          
          if (response.data.data.currentArtist) {
            setArtist(response.data.data.currentArtist);
            setEvents(response.data.data.currentArtistEvents || []);
          } else {
            console.log('Artist not found in response');
            setError('Artist not found');
          }
        }
      } catch (err) {
        console.error('Error fetching artist detail:', err);
        setError('Failed to fetch artist details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchArtistDetail();
  }, [params.id]);

  if (isLoading) {
    return (
      <section className="py-12 sm:py-14 min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8 mb-8 animate-pulse">
            <div className="w-32 h-32 sm:w-40 sm:h-40 bg-slate-800 rounded-full"></div>
            <div className="flex-1 space-y-3">
              <div className="h-8 bg-slate-800 rounded w-48"></div>
              <div className="h-5 bg-slate-800 rounded w-32"></div>
              <div className="h-4 bg-slate-800 rounded w-full"></div>
              <div className="h-10 bg-slate-800 rounded w-32"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || !artist) {
    return (
      <section className="py-12 sm:py-14 min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4 text-white">Artist Not Found</h2>
          <p className="text-slate-400">{error || "Sorry, we couldn't find this artist."}</p>
        </div>
      </section>
    );
  }

  // Get image URL from API response or use default
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';
  const imageUrl = artist.Images && artist.Images.length > 0 
    ? artist.Images[0].image_path.startsWith('http')
      ? artist.Images[0].image_path
      : `${BACKEND_URL}/${artist.Images[0].image_path}`
    : `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop&sig=${artist._id}`;

  return (
    <section className="py-8 sm:py-14 min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-3xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-5 sm:gap-8 mb-6 sm:mb-8">
            <img
              src={imageUrl}
              alt={artist.Name}
              className="w-32 h-32 sm:w-40 sm:h-40 shrink-0 object-cover rounded-full border-4 border-primary shadow-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop&sig=${artist._id}`;
              }}
            />
            <div className="flex-1 w-full md:w-auto min-w-0 text-center md:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-white break-words">{artist.Name}</h1>
              <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-slate-400">Music Artist</span>
              </div>
              <p className="whitespace-pre-line text-slate-300 mb-4">
                {artist.Description || `${artist.Name} is a talented music artist bringing amazing performances to life.`}
              </p>
              <Button className="bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] hover:shadow-lg hover:shadow-[#00E1FC]/25 transition-all duration-300 transform hover:scale-105">
                Book Artist
              </Button>
            </div>
          </div>
          <div className="bg-slate-900/80 rounded-xl p-4 sm:p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-white">About Artist</h2>
            <div className="space-y-4">
              <div className="bg-slate-800/60 rounded-lg p-4">
                <h3 className="font-semibold text-primary mb-2">Contact Information</h3>
                {artist.Email && (
                  <p className="text-slate-300 mb-1 break-words">
                    <span className="text-slate-400">Email:</span> {artist.Email}
                  </p>
                )}
                {artist.PhoneNo && (
                  <p className="text-slate-300">
                    <span className="text-slate-400">Phone:</span> {artist.PhoneNo}
                  </p>
                )}
                {!artist.Email && !artist.PhoneNo && (
                  <p className="text-slate-400">Contact information not available</p>
                )}
              </div>
              
              <div className="bg-slate-800/60 rounded-lg p-4">
                <h3 className="font-semibold text-primary mb-2">About</h3>
                <p className="whitespace-pre-line text-slate-300">
                  {artist.Description || `${artist.Name} is a renowned music artist known for captivating performances and unique style. Book now for an unforgettable musical experience.`}
                </p>
              </div>

              {/* Events Section */}
              <div className="bg-slate-800/60 rounded-lg p-4">
                <h3 className="font-semibold text-primary mb-2">Upcoming Events</h3>
                {events && events.length > 0 ? (
                  <div className="space-y-3">
                    {events.map((event, index) => (
                      <div key={index} className="bg-slate-700/50 rounded-lg p-3 border border-slate-600">
                        <h4 className="font-medium text-white mb-1 break-words">{event.name || 'Event Name'}</h4>
                        <p className="text-slate-400 text-sm mb-1">
                          <span className="text-slate-300">Date:</span> {event.date || 'Date TBA'}
                        </p>
                        {event.venue && (
                          <p className="text-slate-400 text-sm">
                            <span className="text-slate-300">Venue:</span> {event.venue}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400">No upcoming events scheduled for this artist.</p>
                )}
              </div>
            </div>
          </div>
      </div>
    </section>
  );
}
