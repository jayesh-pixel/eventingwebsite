"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Check,
  Clock,
  Facebook,
  Link2,
  MapPin,
  MessageCircle,
  Navigation,
  Ticket,
  Twitter,
} from "lucide-react";
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
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [aboutExpanded, setAboutExpanded] = useState(false);
  const [termsExpanded, setTermsExpanded] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);

  // Share links need the live url, which only exists in the browser
  useEffect(() => {
    setShareUrl(window.location.href);
  }, []);


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

  // 0 is a valid price (free tickets) — only a missing/invalid value means no tickets
  const rawTicketPrice = eventDetails.TicketPriceStartsFrom;
  const parsedTicketPrice =
    rawTicketPrice === null || rawTicketPrice === undefined || (rawTicketPrice as unknown) === ""
      ? NaN
      : Number(rawTicketPrice);
  const startingTicketPrice =
    Number.isFinite(parsedTicketPrice) && parsedTicketPrice >= 0 ? parsedTicketPrice : null;

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
  const venueQuery = `${eventDetails.VenueName || ""} ${eventDetails.VenueCity || ""}`.trim();

  // Coordinates can come from a bare "lat,lng", a /maps/@lat,lng url, or an embed pb string
  const rawVenueLink = decodeHtmlEntities((eventDetails.VenueMapLocationLink || "").trim());
  const plainCoords = rawVenueLink.match(/^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/);
  const atCoords = venueMapUrl.match(/@(-?[\d.]+),(-?[\d.]+)/);
  // Google embed urls carry !2d<longitude>!3d<latitude>
  const pbCoords = venueMapUrl.match(/!2d(-?[\d.]+)!3d(-?[\d.]+)/);

  const venueCoords: [string, string] | null = plainCoords
    ? [plainCoords[1], plainCoords[2]]
    : atCoords
      ? [atCoords[1], atCoords[2]]
      : pbCoords
        ? [pbCoords[2], pbCoords[1]]
        : null;

  const isEmbedUrl = /\/maps\/embed|output=embed/.test(venueMapUrl);

  // Map shown inline on the page (iframe needs an embeddable url)
  const venueEmbedSrc = isEmbedUrl
    ? venueMapUrl
    : venueCoords
      ? `https://www.google.com/maps?q=${venueCoords[0]},${venueCoords[1]}&z=15&output=embed`
      : venueQuery
        ? `https://www.google.com/maps?q=${encodeURIComponent(venueQuery)}&output=embed`
        : "";

  // Where the map/venue click takes the user — always a normal Google Maps page
  const venueSearchUrl =
    (!isEmbedUrl && venueMapUrl) ||
    (venueCoords
      ? `https://www.google.com/maps/search/?api=1&query=${venueCoords[0]},${venueCoords[1]}`
      : venueQuery
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venueQuery)}`
        : "");

  // Chip row under the title: category, then each language, then the age guidance
  const metaTags = [
    eventDetails.categoryName,
    ...(eventDetails.Language || []),
    eventDetails.BestSuitedFor,
  ].filter(Boolean);

  const shareText = `${eventDetails.EventName}${eventDetails.VenueCity ? ` · ${eventDetails.VenueCity}` : ""}`;
  const shareTargets = shareUrl
    ? [
        {
          label: "Share on Facebook",
          href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
          icon: Facebook,
        },
        {
          label: "Share on Twitter",
          href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
          icon: Twitter,
        },
        {
          label: "Share on WhatsApp",
          href: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
          icon: MessageCircle,
        },
      ]
    : [];

  const copyEventLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      // Clipboard is blocked on insecure origins — the share buttons still work
    }
  };

  const bookNowButton =
    startingTicketPrice !== null ? (
      <Link href={`/events/${eventId}/book`} className="hidden lg:inline-block">
        <Button className="h-12 px-8 bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] hover:from-[#00E1FC]/90 hover:to-[#0F33D1]/90 text-white font-semibold text-base shadow-lg hover:shadow-[#00E1FC]/30 transition-all duration-300 group">
          <Ticket className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
          Book now
        </Button>
      </Link>
    ) : (
      <div className="hidden lg:block space-y-2">
        <Button
          disabled
          className="h-12 px-8 bg-slate-700 text-slate-300 font-semibold text-base cursor-not-allowed opacity-70"
        >
          <Ticket className="mr-2 h-5 w-5" />
          Tickets Not Available
        </Button>
        <p className="text-sm text-amber-300">Tickets are not available for booking yet.</p>
      </div>
    );

  const cardClass =
    "bg-gradient-to-br from-slate-900/60 to-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 sm:p-6 shadow-xl";

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

        {/* Hero — poster on the left, event summary on the right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-8 items-start">
          {/* Poster — shown whole, so fliers aren't cropped */}
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-700/50 bg-slate-900/70 shadow-2xl">
            {eventDetails.EventCarouselImages.length > 0 && (
              <img
                src={getImageUrl(eventDetails.EventCarouselImages[activeImageIndex]?.image_path)}
                alt={eventDetails.EventName}
                className="w-full h-auto max-h-[70vh] object-contain"
              />
            )}

            {/* Image Carousel Navigation */}
            {eventDetails.EventCarouselImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
                {eventDetails.EventCarouselImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    aria-label={`Show image ${index + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === activeImageIndex
                        ? "bg-white w-8"
                        : "bg-white/40 w-2 hover:bg-white/60"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="lg:pt-2">
            <h1 className="text-2xl sm:text-4xl font-bold leading-tight bg-gradient-to-r from-[#00E1FC] via-[#5BB8FF] to-[#8FA8FF] bg-clip-text text-transparent">
              {eventDetails.EventName}
            </h1>

            {metaTags.length > 0 && (
              <div className="mt-3 sm:mt-4 flex flex-wrap items-center text-sm sm:text-base text-slate-400">
                {metaTags.map((tag, index) => (
                  <span
                    key={`${tag}-${index}`}
                    className={index > 0 ? "border-l border-slate-700 pl-3 ml-3" : ""}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-5 sm:mt-6 space-y-3 sm:space-y-4">
              <div className="flex items-center gap-3 text-white">
                <Calendar className="h-5 w-5 shrink-0 text-[#00E1FC]" />
                <span className="text-base sm:text-lg">{eventDetails.EventStartDate}</span>
              </div>
              <div className="flex items-center gap-3 text-white">
                <Clock className="h-5 w-5 shrink-0 text-[#00E1FC]" />
                <span className="text-base sm:text-lg">{eventDetails.EventStartTime} Onwards</span>
              </div>
              <div className="flex items-center gap-3 text-white">
                <MapPin className="h-5 w-5 shrink-0 text-[#00E1FC]" />
                {venueSearchUrl ? (
                  <a
                    href={venueSearchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base sm:text-lg underline decoration-[#00E1FC]/40 underline-offset-4 hover:text-[#00E1FC] transition-colors"
                  >
                    {eventDetails.VenueName || eventDetails.VenueCity}
                  </a>
                ) : (
                  <span className="text-base sm:text-lg">{eventDetails.VenueName || eventDetails.VenueCity}</span>
                )}
              </div>
            </div>

            <div className="mt-5 sm:mt-6 text-2xl sm:text-3xl font-bold text-white">
              {startingTicketPrice === null
                ? "Tickets unavailable"
                : startingTicketPrice === 0
                  ? "Free"
                  : `₹ ${startingTicketPrice.toLocaleString()} Onwards`}
            </div>

            <div className="mt-5 sm:mt-6">{bookNowButton}</div>
          </div>
        </div>

        {/* Content — share + venue on the left, description + terms on the right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-8 mt-5 sm:mt-8 items-start">
          {/* Left Column */}
          <div className="space-y-5 sm:space-y-8">
            {/* Share this event */}
            <div className={cardClass}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-[#00E1FC] to-[#0F33D1] rounded-full"></div>
                  Share this event
                </h2>
                <div className="flex items-center gap-2">
                  {shareTargets.map(({ label, href, icon: Icon }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      title={label}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700/50 bg-slate-800/60 text-slate-300 hover:text-[#00E1FC] hover:border-[#00E1FC]/40 transition-colors"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  ))}
                  <button
                    type="button"
                    onClick={copyEventLink}
                    aria-label="Copy event link"
                    title={linkCopied ? "Link copied" : "Copy event link"}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700/50 bg-slate-800/60 text-slate-300 hover:text-[#00E1FC] hover:border-[#00E1FC]/40 transition-colors"
                  >
                    {linkCopied ? <Check className="h-4 w-4 text-emerald-400" /> : <Link2 className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Venue & Map */}
            {(eventDetails.VenueName || eventDetails.VenueCity) && (
              <div className={cardClass}>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-[#00E1FC] to-[#0F33D1] rounded-full"></div>
                  {eventDetails.VenueCity || "Venue"}
                </h2>

                {/* VenueName already reads like "Venue: City", so it is shown as stored */}
                <p className="text-slate-300 text-sm sm:text-base">{eventDetails.VenueName}</p>

                {venueEmbedSrc && (
                  <div className="relative mt-3 sm:mt-4 rounded-2xl overflow-hidden border border-slate-700/50">
                    <iframe
                      title="Venue location map"
                      src={venueEmbedSrc}
                      className="w-full h-56 sm:h-72 border-0 pointer-events-none"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      allowFullScreen
                    />
                    {/* Overlay keeps the whole map clickable — the iframe itself would swallow the click */}
                    {venueSearchUrl && (
                      <a
                        href={venueSearchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open ${eventDetails.VenueName || eventDetails.VenueCity} in Google Maps`}
                        className="absolute inset-0 flex items-end justify-end p-3 bg-slate-950/0 hover:bg-slate-950/20 transition-colors"
                      >
                        <span className="flex items-center gap-2 rounded-lg bg-slate-950/85 border border-slate-700/60 px-3 py-2 text-xs sm:text-sm font-medium text-white">
                          <Navigation className="h-4 w-4 text-[#00E1FC]" />
                          Get Directions
                        </span>
                      </a>
                    )}
                  </div>
                )}

                {!venueEmbedSrc && venueSearchUrl && (
                  <a
                    href={venueSearchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#00E1FC] hover:text-[#00E1FC]/80 transition-colors"
                  >
                    <Navigation className="h-4 w-4" />
                    View on Google Maps
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-5 sm:space-y-8">
            {/* Description */}
            <div className={`${cardClass} overflow-hidden`}>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-[#00E1FC] to-[#0F33D1] rounded-full"></div>
                Description
              </h2>
              <div className="relative overflow-hidden">
                <div
                  className={`text-slate-300 text-base leading-relaxed [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-white [&_h3]:mt-4 [&_h3]:mb-2 overflow-hidden transition-all duration-300 ${
                    !aboutExpanded ? "line-clamp-2 max-h-[3.5em]" : "max-h-[5000px]"
                  }`}
                  dangerouslySetInnerHTML={{ __html: formatHtmlContent(eventDetails.AboutEvent) }}
                />
                {!aboutExpanded && (
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#111827] to-transparent pointer-events-none"></div>
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
            </div>

            {/* Terms & Conditions */}
            <div className={`${cardClass} overflow-hidden`}>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-[#00E1FC] to-[#0F33D1] rounded-full"></div>
                Terms &amp; Conditions
              </h2>
              <div className="relative overflow-hidden">
                <div
                  className={`text-slate-300 text-sm leading-relaxed [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mb-2 overflow-hidden transition-all duration-300 ${
                    !termsExpanded ? "line-clamp-2 max-h-[3.5em]" : "max-h-[5000px]"
                  }`}
                  dangerouslySetInnerHTML={{ __html: formatHtmlContent(eventDetails.EventTermsConditions) }}
                />
                {!termsExpanded && (
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#111827] to-transparent pointer-events-none"></div>
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
            </div>

            {/* Featured Artists */}
            {eventDetails.EventArtists.length > 0 && (
              <div className={cardClass}>
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
              </div>
            )}
          </div>
        </div>
      </div>

      {startingTicketPrice !== null && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-slate-700/70 bg-slate-950/95 backdrop-blur-md p-3">
          <Link href={`/events/${eventId}/book`} className="block">
            <Button className="w-full h-12 bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] hover:from-[#00E1FC]/90 hover:to-[#0F33D1]/90 text-white font-semibold text-base shadow-lg">
              <Ticket className="mr-2 h-5 w-5" />
              Book now
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
