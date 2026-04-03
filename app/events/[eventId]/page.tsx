"use client";

import { useState, useEffect, useRef } from "react";
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
  TicketPriceStartsFrom: number | null;
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
  const [aboutExpanded, setAboutExpanded] = useState(false);
  const [aboutClamped, setAboutClamped] = useState(false);
  const aboutRef = useRef<HTMLDivElement>(null);


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

  const startingTicketPrice =
    typeof eventDetails.TicketPriceStartsFrom === "number" &&
    Number.isFinite(eventDetails.TicketPriceStartsFrom) &&
    eventDetails.TicketPriceStartsFrom > 0
      ? eventDetails.TicketPriceStartsFrom
      : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/events">
            <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all group">
              <svg className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              Back to Events
            </Button>
          </Link>
        </div>

        {/* Main Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Image Section */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl group">
              {/* Main Image */}
              <div className="relative h-[300px] sm:h-[450px] md:h-[550px]">
                {eventDetails.EventCarouselImages.length > 0 && (
                  <img
                    src={getImageUrl(eventDetails.EventCarouselImages[activeImageIndex]?.image_path)}
                    alt={eventDetails.EventName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/40"></div>

                {/* Category Badge */}
                <div className="absolute top-6 left-6">
                  <Badge className="bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] text-white border-0 px-4 py-2 text-sm font-semibold shadow-lg">
                    {eventDetails.categoryName}
                  </Badge>
                </div>

                {/* Action Buttons */}
                <div className="absolute top-6 right-6 flex space-x-3">
                  <button
                    onClick={() => setIsLiked(!isLiked)}
                    className="bg-slate-900/80 backdrop-blur-md p-3 rounded-full hover:bg-slate-800/90 transition-all duration-300 border border-slate-700/50"
                  >
                    <Heart className={`h-5 w-5 transition-all ${isLiked ? 'fill-red-500 text-red-500 scale-110' : 'text-white'}`} />
                  </button>
                  <button className="bg-slate-900/80 backdrop-blur-md p-3 rounded-full hover:bg-slate-800/90 transition-all duration-300 border border-slate-700/50">
                    <Share2 className="h-5 w-5 text-white" />
                  </button>
                </div>

                {/* Title and Meta Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                  <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 leading-tight">
                    {eventDetails.EventName}
                  </h1>
                  
                  {/* Meta Info Cards */}
                  <div className="flex flex-wrap gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-slate-700/50 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl">
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-[#00E1FC]" />
                      <span className="text-white font-medium text-sm">{eventDetails.EventStartDate}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-slate-700/50 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl">
                      <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-[#00E1FC]" />
                      <span className="text-white font-medium text-sm">{eventDetails.EventStartTime}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-slate-700/50 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl">
                      <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-[#00E1FC]" />
                      <span className="text-white font-medium text-sm">{eventDetails.VenueCity}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {eventDetails.Language.map((lang, index) => (
                      <Badge
                        key={index}
                        className="bg-[#00E1FC]/20 text-[#00E1FC] border border-[#00E1FC]/30 hover:bg-[#00E1FC]/30 backdrop-blur-md"
                      >
                        {lang}
                      </Badge>
                    ))}
                    {eventDetails.BestSuitedFor && (
                      <Badge className="bg-[#4ADE80]/20 text-[#4ADE80] border border-[#4ADE80]/30 hover:bg-[#4ADE80]/30 backdrop-blur-md">
                        {eventDetails.BestSuitedFor}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Image Carousel Navigation */}
              {eventDetails.EventCarouselImages.length > 1 && (
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
                  {eventDetails.EventCarouselImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImageIndex(index)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        index === activeImageIndex 
                          ? 'bg-white w-8' 
                          : 'bg-white/40 w-2 hover:bg-white/60'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* About Event Section */}
            <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 sm:p-8 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-[#00E1FC] to-[#0F33D1] rounded-full"></div>
                About This Event
              </h2>
              <div className="relative">
                <div
                  ref={aboutRef}
                  className={`text-slate-300 text-base leading-relaxed [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-white [&_h3]:mt-4 [&_h3]:mb-2 overflow-hidden transition-all duration-300 ${
                    !aboutExpanded ? "line-clamp-2 max-h-[3.5em]" : "max-h-[5000px]"
                  }`}
                  dangerouslySetInnerHTML={{ __html: eventDetails.AboutEvent }}
                  onLoad={() => {
                    if (aboutRef.current && aboutRef.current.scrollHeight > aboutRef.current.clientHeight) {
                      setAboutClamped(true);
                    }
                  }}
                />
                {!aboutExpanded && (
                  <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-slate-900/60 to-transparent pointer-events-none"></div>
                )}
              </div>
              <button
                onClick={() => setAboutExpanded(!aboutExpanded)}
                className="mt-3 text-[#00E1FC] hover:text-[#00E1FC]/80 text-sm font-semibold transition-colors duration-200 flex items-center gap-1"
              >
                {aboutExpanded ? "Show Less" : "Read More"}
                <svg
                  className={`h-4 w-4 transition-transform duration-300 ${aboutExpanded ? "rotate-180" : ""}`}
                  fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Featured Artists Section */}
            {eventDetails.EventArtists.length > 0 && (
              <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 sm:p-8 shadow-xl">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-[#00E1FC] to-[#0F33D1] rounded-full"></div>
                  Featured Artists
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {eventDetails.EventArtists.map((artist, index) => (
                    <div 
                      key={index} 
                      className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/40 hover:bg-slate-800/70 hover:border-[#00E1FC]/30 transition-all duration-300 group"
                    >
                      <div className="relative">
                        <img
                          src={getImageUrl(artist.ArtistImage)}
                          alt={artist.ArtistName}
                          className="w-16 h-16 rounded-full object-cover ring-2 ring-slate-700/50 group-hover:ring-[#00E1FC]/50 transition-all"
                        />
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#00E1FC]/0 to-[#0F33D1]/0 group-hover:from-[#00E1FC]/20 group-hover:to-[#0F33D1]/20 transition-all"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-white mb-1 truncate group-hover:text-[#00E1FC] transition-colors">
                          {artist.ArtistName}
                        </h3>
                        <p className="text-sm text-slate-400">Featured Artist</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Terms & Conditions Section */}
            <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 sm:p-8 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-[#00E1FC] to-[#0F33D1] rounded-full"></div>
                Terms & Conditions
              </h2>
              <div
                className="text-slate-300 text-sm leading-relaxed [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mb-2 max-h-96 overflow-y-auto custom-scrollbar"
                dangerouslySetInnerHTML={{ __html: eventDetails.EventTermsConditions }}
              />
            </div>
          </div>

          {/* Right Column - Booking Card & Map */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-6">
              {/* Booking Card */}
              <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-slate-700/50 shadow-2xl rounded-2xl overflow-hidden">
                {/* Price Header */}
                <div className="bg-gradient-to-r from-[#00E1FC]/20 to-[#0F33D1]/20 border-b border-slate-700/50 p-6">
                  <div className="text-sm text-slate-300 mb-2">
                    {startingTicketPrice !== null ? "Starting from" : "Booking status"}
                  </div>
                  <div className="text-4xl font-bold text-white mb-1">
                    {startingTicketPrice !== null
                      ? `₹${startingTicketPrice.toLocaleString()}`
                      : "Tickets unavailable"}
                  </div>
                  <div className="text-xs text-slate-400">
                    {startingTicketPrice !== null ? "per person" : "Booking will open when tickets are available"}
                  </div>
                </div>

                {/* Event Details */}
                <div className="p-6 space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-sm text-slate-400 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-[#00E1FC]" />
                        Date
                      </span>
                      <span className="text-sm text-white font-medium text-right">{eventDetails.EventStartDate}</span>
                    </div>
                    <Separator className="bg-slate-700/50" />
                    
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-sm text-slate-400 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-[#00E1FC]" />
                        Time
                      </span>
                      <span className="text-sm text-white font-medium text-right">{eventDetails.EventStartTime}</span>
                    </div>
                    <Separator className="bg-slate-700/50" />
                    
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-sm text-slate-400 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-[#00E1FC]" />
                        Venue
                      </span>
                      <span className="text-sm text-white font-medium text-right max-w-[200px]">
                        {eventDetails.VenueName}
                      </span>
                    </div>
                    <Separator className="bg-slate-700/50" />
                    
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-sm text-slate-400">City</span>
                      <span className="text-sm text-white font-medium">{eventDetails.VenueCity}</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  {startingTicketPrice !== null ? (
                    <Link href={`/events/${eventId}/book`} className="block mt-6">
                      <Button className="w-full h-12 bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] hover:from-[#00E1FC]/90 hover:to-[#0F33D1]/90 text-white font-semibold text-base shadow-lg hover:shadow-[#00E1FC]/30 transition-all duration-300 group">
                        <Ticket className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                        Book Tickets Now
                      </Button>
                    </Link>
                  ) : (
                    <div className="mt-6 space-y-3">
                      <Button
                        disabled
                        className="w-full h-12 bg-slate-700 text-slate-300 font-semibold text-base cursor-not-allowed opacity-70"
                      >
                        <Ticket className="mr-2 h-5 w-5" />
                        Tickets Not Available
                      </Button>
                      <p className="text-sm text-center text-amber-300">
                        Tickets are not available for booking yet.
                      </p>
                    </div>
                  )}

                  {/* Social Proof */}
                  <div className="flex items-center justify-around text-xs text-slate-400 pt-4 border-t border-slate-700/50">
                    <div className="flex flex-col items-center gap-1">
                      <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                      <span className="font-medium text-white">4.8</span>
                      <span>Rating</span>
                    </div>
                    <div className="h-12 w-px bg-slate-700/50"></div>
                    <div className="flex flex-col items-center gap-1">
                      <Users className="h-5 w-5 text-green-400" />
                      <span className="font-medium text-white">150+</span>
                      <span>Going</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Venue Location Map */}
              {eventDetails.VenueMapLocationLink && (
                <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl">
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-[#00E1FC]" />
                      Venue Location
                    </h2>
                  </div>
                  <div
                    className="w-full h-[300px] border-t border-slate-700/50 [&_iframe]:w-full [&_iframe]:h-full [&_iframe]:min-h-[300px]"
                    dangerouslySetInnerHTML={{ __html: eventDetails.VenueMapLocationLink }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
