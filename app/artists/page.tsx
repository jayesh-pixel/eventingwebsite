"use client";
import React, { useState } from "react";
import Navigation from "@/components/navigation-new";
import { mockArtists } from "@/data/mockData";
import Link from "next/link";

export default function ArtistsPage() {
  const [search, setSearch] = useState("");
  const filteredArtists = mockArtists.filter(artist =>
    artist.name.toLowerCase().includes(search.toLowerCase()) ||
    artist.genre.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Navigation />
      <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-950 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex justify-center">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search artists by name or genre..."
              className="w-full max-w-md px-6 py-3 rounded-lg border border-slate-700 bg-slate-800 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00E1FC]"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {filteredArtists.map(artist => (
              <Link href={`/artists/${artist.id}`} key={artist.id} legacyBehavior>
                <a className="glass-card rounded-2xl overflow-hidden group cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl animate-fadeInUp">
                  <div className="relative overflow-hidden rounded-2xl mb-4">
                    <img
                      src={artist.imageUrl}
                      alt={`${artist.name} - ${artist.genre}`}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-1 group-hover:text-[#00E1FC] transition-colors duration-300">
                      {artist.name}
                    </h3>
                    <p className="text-slate-400 text-sm">{artist.genre}</p>
                  </div>
                </a>
              </Link>
            ))}
          </div>
          {filteredArtists.length === 0 && (
            <div className="text-center text-slate-400 mt-16 text-lg">No artists found for your search.</div>
          )}
        </div>
      </section>
    </>
  );
}
