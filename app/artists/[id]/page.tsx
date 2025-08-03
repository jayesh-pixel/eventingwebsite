"use client";
import { MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mockArtists } from "@/data/mockData";
import Navigation from "@/components/navigation-new";

type Event = {
  id: string;
  name: string;
  date: string;
  venueId: string;
  venueName: string;
};

type Artist = {
  id: string;
  name: string;
  genre: string;
  imageUrl: string;
  eventCount: number;
  bio?: string;
  events?: Event[];
};

export default function ArtistDetail({ params }: { params: { id: string } }) {
  const artist = mockArtists.find((a) => a.id === params.id) as Artist;
  if (!artist) {
    return (
      <>
        <Navigation />
        <div className="max-w-2xl mx-auto py-24 text-center">
          <h2 className="text-2xl font-bold mb-4">Artist Not Found</h2>
          <p className="text-slate-400">Sorry, we couldn't find this artist.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <main className="pt-24 pb-12 min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
            <img
              src={artist.imageUrl}
              alt={artist.name}
              className="w-40 h-40 object-cover rounded-full border-4 border-primary shadow-lg"
            />
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2 text-white">{artist.name}</h1>
              <div className="flex items-center gap-4 mb-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-slate-400">{artist.genre}</span>
              </div>
              <p className="text-slate-300 mb-4">{artist.bio}</p>
              <Button className="bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] hover:shadow-lg hover:shadow-[#00E1FC]/25 transition-all duration-300 transform hover:scale-105">Book Artist</Button>
            </div>
          </div>
          <div className="bg-slate-900/80 rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-white">Upcoming Events</h2>
            {artist.events && artist.events.length > 0 ? (
              <ul className="space-y-4">
                {artist.events.map((event) => (
                  <li key={event.id} className="flex flex-col md:flex-row md:items-center justify-between bg-slate-800/60 rounded-lg p-4">
                    <div>
                      <span className="font-bold text-primary">{event.name}</span>
                      <span className="ml-2 text-slate-400">{event.date}</span>
                    </div>
                    <a href={`/venues/${event.venueId}`} className="flex items-center gap-2 text-blue-400 hover:underline mt-2 md:mt-0">
                      <MapPin className="h-4 w-4" />
                      <span>{event.venueName}</span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-400">No upcoming events for this artist.</p>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
