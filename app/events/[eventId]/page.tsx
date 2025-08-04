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
          "https://node.eventingclub.in/webiste/events/getEventDetailsById",
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
      : `https://node.eventingclub.in/${imagePath}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="text-white hover:bg-white/10">
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              Back
            </Button>
          </Link>
        </div>
        {/* Hero Image Section */}
        <div className="relative h-96 rounded-3xl overflow-hidden mb-8 group">
          {eventDetails.EventCarouselImages.length > 0 && (
            <img
              src={getImageUrl(eventDetails.EventCarouselImages[activeImageIndex]?.image_path)}
              alt={eventDetails.EventName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent"></div>
          
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
          <div className="absolute top-6 left-6 bg-primary/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
            {eventDetails.categoryName}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Left Column - Event Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Header */}
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {eventDetails.EventName}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-slate-400">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-accent" />
                  {eventDetails.EventStartDate}
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-accent" />
                  {eventDetails.EventStartTime}
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-accent" />
                  {eventDetails.VenueName}, {eventDetails.VenueCity}
                </div>
              </div>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                {eventDetails.Language.map((lang, index) => (
                  <span key={index} className="bg-secondary/20 text-secondary px-3 py-1 rounded-full text-sm">
                    {lang}
                  </span>
                ))}
                <span className="bg-accent/20 text-accent px-3 py-1 rounded-full text-sm">
                  {eventDetails.BestSuitedFor}
                </span>
              </div>
            </div>

            {/* About Event */}
            <div className="glass-card rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-4">About This Event</h2>
              <div 
                className="text-slate-300 leading-relaxed prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: eventDetails.AboutEvent }}
              />
            </div>

            {/* Artists */}
            {eventDetails.EventArtists.length > 0 && (
              <div className="glass-card rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Featured Artists</h2>
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
            <div className="glass-card rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-4">Terms & Conditions</h2>
              <div 
                className="text-slate-300 prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: eventDetails.EventTermsConditions }}
              />
            </div>

            {/* Venue Map */}
            {eventDetails.VenueMapLocationLink && (
              <div className="glass-card rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-4">Venue Location</h2>
                <div 
                  className="rounded-xl overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: eventDetails.VenueMapLocationLink }}
                />
              </div>
            )}
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="glass-card rounded-2xl p-8 sticky top-24">
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-accent mb-2">
                  ₹{eventDetails.TicketPriceStartsFrom}
                </div>
                <p className="text-slate-400">onwards</p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Event Date</span>
                  <span className="text-white font-medium">{eventDetails.EventStartDate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Event Time</span>
                  <span className="text-white font-medium">{eventDetails.EventStartTime}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Venue</span>
                  <span className="text-white font-medium text-right">{eventDetails.VenueName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">City</span>
                  <span className="text-white font-medium">{eventDetails.VenueCity}</span>
                </div>
              </div>

              <Link href={`/events/${eventId}/book`}>
                <Button className="w-full bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] hover:shadow-lg hover:shadow-[#00E1FC]/25 transition-all duration-300 transform hover:scale-105 py-3 text-lg font-semibold">
                  <Ticket className="mr-2 h-5 w-5" />
                  Book Now
                </Button>
              </Link>

              <div className="mt-6 pt-6 border-t border-slate-700">
                <div className="flex items-center justify-center space-x-4 text-sm text-slate-400">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 mr-1 text-yellow-500" />
                    4.8 Rating
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1 text-green-500" />
                    150+ Attending
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
