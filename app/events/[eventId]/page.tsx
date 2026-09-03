"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, MapPin, Share2, Heart, Ticket } from "lucide-react";
import axios from "axios";
import Link from "next/link";
import { events as eventsConfig } from "@/utils/config";

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
  const [termsExpanded, setTermsExpanded] = useState(false);


  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!eventId) return;
      
      try {
        setIsLoading(true);
        const response = await axios.post<ApiResponse>(
          eventsConfig.GET_ALL,
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

  const stripHtml = (html: string) => html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

  // Convert plain-text newlines to <br> tags so line breaks from the backend are preserved.
  // Also wraps plain text in <p> tags for consistent rendering.
  const formatHtmlContent = (html: string) => {
    if (!html) return "";
    // If the content already contains HTML block tags (p, div, br, ul, ol, h1-h6),
    // only convert bare \n to <br> where there aren't already block elements
    const hasBlockTags = /<(p|div|br|ul|ol|h[1-6]|li|table)[\s>]/i.test(html);
    if (hasBlockTags) {
      // Replace bare newlines that aren't adjacent to existing HTML tags
      return html.replace(/\n(?!\s*<)/g, "<br />");
    }
    // Plain text: convert \n to <br>
    return html
      .split(/\n/)
      .map((line) => `<p>${line.replace(/\s+/g, " ").trim()}</p>`)
      .filter((p) => p !== "<p></p>")
      .join("");
  };

  const aboutText = stripHtml(eventDetails.AboutEvent || "");
  const termsText = stripHtml(eventDetails.EventTermsConditions || "");
  const showAboutToggle = aboutText.length > 140;
  const showTermsToggle = termsText.length > 140;
  const decodeHtmlEntities = (str: string) => {
    return str
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  };

  const getVenueMapUrl = (raw: string) => {
    if (!raw) return "";
    const decoded = decodeHtmlEntities(raw.trim());

    if (decoded.startsWith("http")) return decoded;
    if (decoded.startsWith("www.")) return `https://${decoded}`;

    const srcMatch = decoded.match(/src=["']([^"']+)["']/i);
    if (srcMatch?.[1]) return srcMatch[1];

    const hrefMatch = decoded.match(/href=["']([^"']+)["']/i);
    if (hrefMatch?.[1]) return hrefMatch[1];

    // Coordinates pattern (lat,lng)
    if (/^-?\d+\.?\d*\s*,\s*-?\d+\.?\d*$/.test(decoded)) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(decoded)}`;
    }

    // Plain text (not HTML) — use as Google Maps search query
    if (decoded && !decoded.includes("<")) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(decoded)}`;
    }

    return "";
  };

  const venueMapUrl = getVenueMapUrl(eventDetails.VenueMapLocationLink || "");

  // Fallback: if no map URL from the link, build a search query from venue name + city
  const venueSearchUrl =
    venueMapUrl ||
    (eventDetails.VenueName || eventDetails.VenueCity
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${eventDetails.VenueName} ${eventDetails.VenueCity}`.trim()
        )}`
      : "");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black pt-2 sm:pt-4 pb-24 lg:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-4 sm:mb-6">
          <Link href="/events">
            <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all group">
              <svg className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              Back to Events
            </Button>
          </Link>
        </div>

        {/* Main Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-8">
            {/* Hero Image Section */}
            <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl">
              {/* Main Image */}
              <div className="relative h-[300px] sm:h-[400px] md:h-[500px]">
                {eventDetails.EventCarouselImages.length > 0 && (
                  <img
                    src={getImageUrl(eventDetails.EventCarouselImages[activeImageIndex]?.image_path)}
                    alt={eventDetails.EventName}
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Category Badge */}
                <div className="absolute top-3 left-3 sm:top-6 sm:left-6">
                  <Badge className="bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] text-white border-0 px-4 py-2 text-sm font-semibold shadow-lg">
                    {eventDetails.categoryName}
                  </Badge>
                </div>

                {/* Action Buttons */}
                <div className="absolute top-3 right-3 sm:top-6 sm:right-6 flex space-x-2 sm:space-x-3">
                  <button
                    onClick={() => setIsLiked(!isLiked)}
                    className="bg-slate-900/80 backdrop-blur-md p-2.5 sm:p-3 rounded-full hover:bg-slate-800/90 transition-all duration-300 border border-slate-700/50"
                  >
                    <Heart className={`h-4 w-4 sm:h-5 sm:w-5 transition-all ${isLiked ? 'fill-red-500 text-red-500 scale-110' : 'text-white'}`} />
                  </button>
                  <button className="bg-slate-900/80 backdrop-blur-md p-2.5 sm:p-3 rounded-full hover:bg-slate-800/90 transition-all duration-300 border border-slate-700/50">
                    <Share2 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </button>
                </div>

                {/* Image Carousel Navigation */}
                {eventDetails.EventCarouselImages.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
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

              {/* Event details below the flier — clean, no overlap */}
              <div className="bg-slate-900/80 p-4 sm:p-6">
                <h1 className="text-xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4 leading-tight">
                  {eventDetails.EventName}
                </h1>

                {/* Meta Info Cards */}
                <div className="flex flex-wrap gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/50 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-[#00E1FC]" />
                    <span className="text-white font-medium text-sm">{eventDetails.EventStartDate}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/50 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl">
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-[#00E1FC]" />
                    <span className="text-white font-medium text-sm">{eventDetails.EventStartTime}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/50 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-[#00E1FC]" />
                    <span className="text-white font-medium text-sm">{eventDetails.VenueCity}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {eventDetails.Language.map((lang, index) => (
                    <Badge
                      key={index}
                      className="bg-[#00E1FC]/20 text-[#00E1FC] border border-[#00E1FC]/30 hover:bg-[#00E1FC]/30"
                    >
                      {lang}
                    </Badge>
                  ))}
                  {eventDetails.BestSuitedFor && (
                    <Badge className="bg-[#4ADE80]/20 text-[#4ADE80] border border-[#4ADE80]/30 hover:bg-[#4ADE80]/30">
                      {eventDetails.BestSuitedFor}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Event Info Panel */}
            <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 sm:p-6 shadow-xl space-y-5 sm:space-y-6">
              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-[#00E1FC] to-[#0F33D1] rounded-full"></div>
                  About This Event
                </h2>
                <div className="relative">
                  <div
                    className={`text-slate-300 text-base leading-relaxed [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-white [&_h3]:mt-4 [&_h3]:mb-2 overflow-hidden transition-all duration-300 ${
                      !aboutExpanded ? "line-clamp-2 max-h-[3.5em]" : "max-h-[5000px]"
                    }`}
                    dangerouslySetInnerHTML={{ __html: formatHtmlContent(eventDetails.AboutEvent) }}
                  />
                  {!aboutExpanded && (
                    <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-slate-900/60 to-transparent pointer-events-none"></div>
                  )}
                </div>
                {showAboutToggle && (
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
                )}
              </section>

              {eventDetails.EventArtists.length > 0 && (
                <>
                  <Separator className="bg-slate-700/50" />
                  <section>
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-5 flex items-center gap-2">
                      <div className="w-1 h-6 bg-gradient-to-b from-[#00E1FC] to-[#0F33D1] rounded-full"></div>
                      Featured Artists
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {eventDetails.EventArtists.map((artist, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 sm:p-4 bg-slate-800/50 rounded-xl border border-slate-700/40 hover:bg-slate-800/70 hover:border-[#00E1FC]/30 transition-all duration-300 group"
                        >
                          <div className="relative">
                            <img
                              src={getImageUrl(artist.ArtistImage)}
                              alt={artist.ArtistName}
                              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover ring-2 ring-slate-700/50 group-hover:ring-[#00E1FC]/50 transition-all"
                            />
                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#00E1FC]/0 to-[#0F33D1]/0 group-hover:from-[#00E1FC]/20 group-hover:to-[#0F33D1]/20 transition-all"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm sm:text-base font-semibold text-white mb-1 truncate group-hover:text-[#00E1FC] transition-colors">
                              {artist.ArtistName}
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-400">Featured Artist</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </>
              )}

              <Separator className="bg-slate-700/50" />
              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-[#00E1FC] to-[#0F33D1] rounded-full"></div>
                  Terms & Conditions
                </h2>
                <div className="relative">
                  <div
                    className={`text-slate-300 text-sm leading-relaxed [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mb-2 overflow-hidden transition-all duration-300 ${
                      !termsExpanded ? "line-clamp-2 max-h-[3.5em]" : "max-h-[5000px]"
                    }`}
                    dangerouslySetInnerHTML={{ __html: formatHtmlContent(eventDetails.EventTermsConditions) }}
                  />
                  {!termsExpanded && (
                    <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-slate-900/60 to-transparent pointer-events-none"></div>
                  )}
                </div>
                {showTermsToggle && (
                  <button
                    onClick={() => setTermsExpanded(!termsExpanded)}
                    className="mt-3 text-[#00E1FC] hover:text-[#00E1FC]/80 text-sm font-semibold transition-colors duration-200 flex items-center gap-1"
                  >
                    {termsExpanded ? "Show Less" : "Read More"}
                    <svg
                      className={`h-4 w-4 transition-transform duration-300 ${termsExpanded ? "rotate-180" : ""}`}
                      fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                )}
              </section>
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
                      {venueSearchUrl ? (
                        <a
                          href={venueSearchUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[#00E1FC] hover:text-[#00E1FC]/80 font-medium text-right max-w-[200px] underline underline-offset-2"
                        >
                          {eventDetails.VenueName}
                        </a>
                      ) : (
                        <span className="text-sm text-white font-medium text-right max-w-[200px]">
                          {eventDetails.VenueName}
                        </span>
                      )}
                    </div>
                    <Separator className="bg-slate-700/50" />
                    
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-sm text-slate-400">City</span>
                      <span className="text-sm text-white font-medium">{eventDetails.VenueCity}</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  {startingTicketPrice !== null ? (
                    <Link href={`/events/${eventId}/book`} className="hidden lg:block mt-6">
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

                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {startingTicketPrice !== null && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-slate-700/70 bg-slate-950/95 backdrop-blur-md p-3">
          <Link href={`/events/${eventId}/book`} className="block">
            <Button className="w-full h-12 bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] hover:from-[#00E1FC]/90 hover:to-[#0F33D1]/90 text-white font-semibold text-base shadow-lg">
              <Ticket className="mr-2 h-5 w-5" />
              Book Tickets Now
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
