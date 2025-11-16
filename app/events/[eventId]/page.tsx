"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
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
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/events">
            <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all">
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              Back to Events
            </Button>
          </Link>
        </div>
        {/* Hero Image Section */}
        <div className="relative h-[400px] rounded-2xl overflow-hidden mb-8 group shadow-2xl">
          {eventDetails.EventCarouselImages.length > 0 && (
            <img
              src={getImageUrl(eventDetails.EventCarouselImages[activeImageIndex]?.image_path)}
              alt={eventDetails.EventName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/30 to-transparent"></div>
          
          {/* Image Navigation Dots */}
          {eventDetails.EventCarouselImages.length > 1 && (
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {eventDetails.EventCarouselImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImageIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === activeImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="absolute top-6 right-6 flex space-x-3">
            <button 
              onClick={() => setIsLiked(!isLiked)}
              className="glass-card p-3 rounded-full hover:bg-white/20 transition-colors duration-300"
            >
              <Heart className={`h-5 w-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
            </button>
            <button className="glass-card p-3 rounded-full hover:bg-white/20 transition-colors duration-300">
              <Share2 className="h-5 w-5 text-white" />
            </button>
          </div>

          {/* Event Category Badge */}
          <div className="absolute top-4 left-4 bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
            {eventDetails.categoryName}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Event Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Header */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-5 leading-tight">
                {eventDetails.EventName}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-slate-300 text-sm mb-4">
                <div className="flex items-center bg-slate-800/50 px-3 py-2 rounded-lg">
                  <Calendar className="h-4 w-4 mr-2 text-[#00E1FC]" />
                  {eventDetails.EventStartDate}
                </div>
                <div className="flex items-center bg-slate-800/50 px-3 py-2 rounded-lg">
                  <Clock className="h-4 w-4 mr-2 text-[#00E1FC]" />
                  {eventDetails.EventStartTime}
                </div>
                <div className="flex items-center bg-slate-800/50 px-3 py-2 rounded-lg">
                  <MapPin className="h-4 w-4 mr-2 text-[#00E1FC]" />
                  {eventDetails.VenueName}, {eventDetails.VenueCity}
                </div>
              </div>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {eventDetails.Language.map((lang, index) => (
                  <span key={index} className="bg-[#00E1FC]/20 text-[#00E1FC] border border-[#00E1FC]/30 px-3 py-1 rounded-full text-sm font-medium">
                    {lang}
                  </span>
                ))}
                <span className="bg-[#4ADE80]/20 text-[#4ADE80] border border-[#4ADE80]/30 px-3 py-1 rounded-full text-sm font-medium">
                  {eventDetails.BestSuitedFor}
                </span>
              </div>
            </div>

            {/* About Event */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <div className="h-1 w-1 bg-[#00E1FC] rounded-full mr-3"></div>
                About This Event
              </h2>
              <div 
                className="text-slate-300 text-sm leading-relaxed prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: eventDetails.AboutEvent }}
              />
            </div>

            {/* Artists */}
            {eventDetails.EventArtists.length > 0 && (
              <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-5 flex items-center">
                  <div className="h-1 w-1 bg-[#00E1FC] rounded-full mr-3"></div>
                  Featured Artists
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {eventDetails.EventArtists.map((artist, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <img
                        src={getImageUrl(artist.ArtistImage)}
                        alt={artist.ArtistName}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-white">{artist.ArtistName}</h3>
                        <p className="text-slate-400">Artist</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Terms & Conditions */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <div className="h-1 w-1 bg-[#00E1FC] rounded-full mr-3"></div>
                Terms & Conditions
              </h2>
              <div 
                className="text-slate-300 text-sm prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: eventDetails.EventTermsConditions }}
              />
            </div>

            {/* Venue Map */}
            {eventDetails.VenueMapLocationLink && (
              <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                  <div className="h-1 w-1 bg-[#00E1FC] rounded-full mr-3"></div>
                  Venue Location
                </h2>
                <div 
                  className="rounded-xl overflow-hidden w-full h-[350px]"
                  dangerouslySetInnerHTML={{ __html: eventDetails.VenueMapLocationLink }}
                />
              </div>
            )}
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6 sticky top-24 shadow-xl">
              <div className="text-center mb-6 pb-6 border-b border-slate-800">
                <div className="text-sm text-slate-400 mb-1">Starting from</div>
                <div className="text-4xl font-bold text-[#00E1FC] mb-1">
                  ₹{eventDetails.TicketPriceStartsFrom}
                </div>
                <p className="text-xs text-slate-500">per person</p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-slate-400">Event Date</span>
                  <span className="text-sm text-white font-medium">{eventDetails.EventStartDate}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-slate-400">Event Time</span>
                  <span className="text-sm text-white font-medium">{eventDetails.EventStartTime}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-slate-400">Venue</span>
                  <span className="text-sm text-white font-medium text-right">{eventDetails.VenueName}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-slate-400">City</span>
                  <span className="text-sm text-white font-medium">{eventDetails.VenueCity}</span>
                </div>
              </div>

              <Link href={`/events/${eventId}/book`}>
                <Button className="w-full bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] hover:from-[#00E1FC]/90 hover:to-[#0F33D1]/90 hover:shadow-lg hover:shadow-[#00E1FC]/20 transition-all duration-300 py-3 text-base font-semibold">
                  <Ticket className="mr-2 h-5 w-5" />
                  Book Tickets
                </Button>
              </Link>

              <div className="mt-6 pt-6 border-t border-slate-800">
                <div className="flex items-center justify-around text-xs">
                  <div className="flex items-center text-slate-400">
                    <Star className="h-4 w-4 mr-1.5 text-yellow-400" />
                    <span className="font-medium">4.8 Rating</span>
                  </div>
                  <div className="h-4 w-px bg-slate-700"></div>
                  <div className="flex items-center text-slate-400">
                    <Users className="h-4 w-4 mr-1.5 text-green-400" />
                    <span className="font-medium">150+ Going</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
