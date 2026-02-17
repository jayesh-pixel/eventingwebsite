"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, MapPin, Users, Star, Share2, Heart, Ticket } from "lucide-react";
import axios from "axios";
import Link from "next/link";

interface EventCarouselImage {
  image_path: string;
  _id: string;
}

interface EventGenre {
  genre_id: string;
  _id: string;
}

interface EventArtist {
  ArtistName: string;
  ArtistImage: string;
}

interface EventDetails {
  EventCarouselImages: EventCarouselImage[];
  EventName: string;
  Genre: EventGenre[];
  Language: string[];
  BestSuitedFor: string;
  EventStartDate: string;
  EventStartTime: string;
  TicketPriceStartsFrom: number;
  AboutEvent: string;
  EventGalleryImages: any[];
  EventArtists: EventArtist[];
  EventFaqs: any[];
  EventTermsConditions: string;
  categoryName: string;
  VenueEventFlag: number;
  OnlineEventFlag: number;
  VenueToBeAnnounced: number;
  VenueName: string;
  VenueCity: string;
  VenueMapLocationLink: string;
}

interface ApiResponse {
  error: boolean;
  message: string;
  data: {
    EventDetailsObj: EventDetails;
    suggestedEvents: any[];
  };
}

export default function EventDetailsPage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Keep this view as a single-screen experience (no page scrolling)
  useEffect(() => {
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, []);

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!eventId) return;
      
      try {
        setIsLoading(true);
        const response = await axios.post<ApiResponse>(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/webiste/events/getEventDetailsById`,
          { event_id: eventId }
        );

        if (response.data && !response.data.error) {
          setEventDetails(response.data.data.EventDetailsObj);
        }
      } catch (error) {
        console.error('Failed to fetch event details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link href="/">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                Back
              </Button>
            </Link>
          </div>
          <div className="animate-pulse">
            <div className="h-96 bg-slate-800 rounded-3xl mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-8 bg-slate-800 rounded"></div>
                <div className="h-6 bg-slate-800 rounded w-3/4"></div>
                <div className="h-40 bg-slate-800 rounded"></div>
              </div>
              <div className="space-y-6">
                <div className="h-60 bg-slate-800 rounded-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!eventDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link href="/">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                Back
              </Button>
            </Link>
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Event Not Found</h1>
            <p className="text-slate-400 mb-8">The event you're looking for doesn't exist.</p>
            <Link href="/">
              <Button className="bg-gradient-to-r from-[#00E1FC] to-[#0F33D1]">
                Go Back Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getImageUrl = (imagePath: string) => {
    return imagePath.startsWith('http') 
      ? imagePath 
      : `${process.env.NEXT_PUBLIC_BACKEND_URL}/${imagePath}`;
  };

  return (
    <div className="h-[calc(100vh-5rem)] lg:h-[calc(100vh-6rem)] overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-black">
      <div className="h-full w-full px-4 sm:px-6 lg:px-10 py-4 flex flex-col gap-3">
        {/* Back Button */}
        <div className="flex-none">
          <Link href="/events">
            <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all">
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              Back to Events
            </Button>
          </Link>
        </div>

        {/* Full-viewport unified card */}
        <div className="flex-1 min-h-0 bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden">
          <div className="h-full min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 sm:p-5 lg:p-6">
            {/* Left */}
            <div className="lg:col-span-9 min-h-0 grid grid-rows-[3fr_2fr] gap-4">
              {/* Hero */}
              <div className="relative min-h-0 rounded-2xl overflow-hidden group">
                {eventDetails.EventCarouselImages.length > 0 && (
                  <img
                    src={getImageUrl(eventDetails.EventCarouselImages[activeImageIndex]?.image_path)}
                    alt={eventDetails.EventName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/25 to-transparent"></div>

                {/* Image Navigation Dots */}
                {eventDetails.EventCarouselImages.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {eventDetails.EventCarouselImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveImageIndex(index)}
                        className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                          index === activeImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex space-x-2">
                  <button
                    onClick={() => setIsLiked(!isLiked)}
                    className="glass-card p-2.5 rounded-full hover:bg-white/20 transition-colors duration-300"
                  >
                    <Heart className={`h-5 w-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                  </button>
                  <button className="glass-card p-2.5 rounded-full hover:bg-white/20 transition-colors duration-300">
                    <Share2 className="h-5 w-5 text-white" />
                  </button>
                </div>

                {/* Category */}
                <div className="absolute top-4 left-4 bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
                  {eventDetails.categoryName}
                </div>

                {/* Title + Meta overlay */}
                <div className="absolute bottom-4 left-4 right-4">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
                    {eventDetails.EventName}
                  </h1>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-slate-200 text-sm">
                    <span className="inline-flex items-center gap-2 bg-slate-900/60 border border-slate-700/40 px-3 py-2 rounded-lg">
                      <Calendar className="h-4 w-4 text-[#00E1FC]" />
                      {eventDetails.EventStartDate}
                    </span>
                    <span className="inline-flex items-center gap-2 bg-slate-900/60 border border-slate-700/40 px-3 py-2 rounded-lg">
                      <Clock className="h-4 w-4 text-[#00E1FC]" />
                      {eventDetails.EventStartTime}
                    </span>
                    <span className="inline-flex items-center gap-2 bg-slate-900/60 border border-slate-700/40 px-3 py-2 rounded-lg">
                      <MapPin className="h-4 w-4 text-[#00E1FC]" />
                      {eventDetails.VenueName}, {eventDetails.VenueCity}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {eventDetails.Language.map((lang, index) => (
                      <Badge
                        key={index}
                        className="bg-[#00E1FC]/15 text-[#00E1FC] border border-[#00E1FC]/25 hover:bg-[#00E1FC]/15"
                      >
                        {lang}
                      </Badge>
                    ))}
                    {eventDetails.BestSuitedFor && (
                      <Badge className="bg-[#4ADE80]/15 text-[#4ADE80] border border-[#4ADE80]/25 hover:bg-[#4ADE80]/15">
                        {eventDetails.BestSuitedFor}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom content (no scrolling) */}
              <div className="min-h-0 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="min-h-0 bg-slate-900/40 border border-slate-700/40 rounded-2xl p-4 overflow-hidden">
                  <h2 className="text-base font-semibold text-white mb-2">About This Event</h2>
                  <div
                    className="min-h-0 overflow-hidden text-slate-300 text-sm leading-relaxed [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1"
                    dangerouslySetInnerHTML={{ __html: eventDetails.AboutEvent }}
                  />
                </div>

                <div className="min-h-0 bg-slate-900/40 border border-slate-700/40 rounded-2xl p-4 overflow-hidden">
                  <h2 className="text-base font-semibold text-white mb-3">Featured Artists</h2>
                  {eventDetails.EventArtists.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3">
                      {eventDetails.EventArtists.slice(0, 4).map((artist, index) => (
                        <div key={index} className="flex items-center gap-3 p-2.5 bg-slate-800/40 rounded-xl border border-slate-700/30">
                          <img
                            src={getImageUrl(artist.ArtistImage)}
                            alt={artist.ArtistName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div className="min-w-0">
                            <h3 className="text-sm font-semibold text-white truncate">{artist.ArtistName}</h3>
                            <p className="text-xs text-slate-400">Artist</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">No featured artists listed.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right */}
            <div className="lg:col-span-3 min-h-0 grid grid-rows-[auto_1fr] gap-4">
              {/* Booking */}
              <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-md border border-slate-700/50 shadow-2xl rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-[#00E1FC]/15 to-[#0F33D1]/15 border-b border-slate-700/50 p-4">
                  <div className="text-xs text-slate-300">Starting from</div>
                  <div className="text-3xl font-bold text-[#00E1FC] leading-tight">₹{eventDetails.TicketPriceStartsFrom}</div>
                  <div className="text-[11px] text-slate-400">per person</div>
                </div>

                <div className="p-4 space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400">Event Date</span>
                      <span className="text-xs text-white font-medium">{eventDetails.EventStartDate}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400">Event Time</span>
                      <span className="text-xs text-white font-medium">{eventDetails.EventStartTime}</span>
                    </div>
                    <div className="flex justify-between items-start gap-4">
                      <span className="text-xs text-slate-400">Venue</span>
                      <span className="text-xs text-white font-medium text-right">{eventDetails.VenueName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400">City</span>
                      <span className="text-xs text-white font-medium">{eventDetails.VenueCity}</span>
                    </div>
                  </div>

                  <Separator className="bg-slate-600/40" />

                  <Link href={`/events/${eventId}/book`}>
                    <Button className="w-full h-10 bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] hover:from-[#00E1FC]/90 hover:to-[#0F33D1]/90 text-white font-semibold shadow-lg hover:shadow-[#00E1FC]/25 transition-all duration-300">
                      <Ticket className="mr-2 h-5 w-5" />
                      Book Tickets
                    </Button>
                  </Link>

                  <div className="flex items-center justify-around text-[11px] text-slate-400 pt-1">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-1.5 text-yellow-400" />
                      <span className="font-medium">4.8 Rating</span>
                    </div>
                    <div className="h-4 w-px bg-slate-700"></div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1.5 text-green-400" />
                      <span className="font-medium">150+ Going</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms + Map */}
              <div className="min-h-0 bg-slate-900/40 border border-slate-700/40 rounded-2xl p-4 overflow-hidden grid grid-rows-[1fr_1fr] gap-4">
                <div className="min-h-0 overflow-hidden">
                  <h2 className="text-base font-semibold text-white mb-2">Terms & Conditions</h2>
                  <div
                    className="min-h-0 overflow-hidden text-slate-300 text-sm leading-relaxed [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1"
                    dangerouslySetInnerHTML={{ __html: eventDetails.EventTermsConditions }}
                  />
                </div>

                {eventDetails.VenueMapLocationLink ? (
                  <div className="min-h-0 overflow-hidden">
                    <h2 className="text-base font-semibold text-white mb-2">Venue Location</h2>
                    <div
                      className="min-h-0 rounded-2xl overflow-hidden w-full h-full border border-slate-700/40 [&_iframe]:w-full [&_iframe]:h-full"
                      dangerouslySetInnerHTML={{ __html: eventDetails.VenueMapLocationLink }}
                    />
                  </div>
                ) : (
                  <div className="min-h-0 overflow-hidden">
                    <h2 className="text-base font-semibold text-white mb-2">Venue Location</h2>
                    <p className="text-sm text-slate-400">Map not available.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
