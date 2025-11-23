"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Play, ChevronLeft, ChevronRight } from "lucide-react";
import axios from "axios";

interface BannerData {
  _id: string;
  DesktopbannerImage: string;
  MobilebannerImage: string;
  Event_id: string;
  FilterationDateTime: string;
  createdAt: string;
  status: number;
}

interface BannerApiResponse {
  error: boolean;
  message: string;
  data: BannerData[];
}

const heroHighlights = [
  {
    label: "Cities Covered",
    value: "25+",
    icon: MapPin,
  },
  {
    label: "Upcoming Events",
    value: "120+",
    icon: Calendar,
  },
  {
    label: "Artists Onboard",
    value: "80+",
    icon: Play,
  },
];

export default function HeroSection() {
  const [banners, setBanners] = useState<BannerData[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setIsLoading(true);
        if (!BACKEND_URL) {
          throw new Error('Backend URL is not defined in environment variables.');
        }
        
        const response = await axios.get<BannerApiResponse>(
          `${BACKEND_URL}/webiste/homepage/getAllBannerSliderData`
        );
        
        if (response.data && !response.data.error) {
          const activeBanners = response.data.data.filter(banner => banner.status === 1);
          setBanners(activeBanners);
        } else {
          console.error('API Error:', response.data.message);
          setBanners([]);
        }
      } catch (error) {
        console.error('Failed to fetch banners:', error);
        setBanners([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBanners();
  }, [BACKEND_URL]);

  useEffect(() => {
    if (banners.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % banners.length);
      }, 4000); // Auto-slide every 4 seconds

      return () => clearInterval(timer);
    }
  }, [banners.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const getCurrentBannerImage = () => {
    if (banners.length === 0) {
      return { desktop: '', mobile: '' };
    }
    
    const currentBanner = banners[currentSlide];
    
    const desktopUrl = currentBanner.DesktopbannerImage.startsWith('http')
      ? currentBanner.DesktopbannerImage
      : `${BACKEND_URL}/${currentBanner.DesktopbannerImage}`;
      
    const mobileUrl = currentBanner.MobilebannerImage.startsWith('http')
      ? currentBanner.MobilebannerImage
      : `${BACKEND_URL}/${currentBanner.MobilebannerImage}`;
    
    return {
      desktop: desktopUrl,

      mobile: mobileUrl
    };
  };

  return (
    <section className="relative w-full overflow-hidden pt-6 pb-10 sm:pb-12 lg:pb-16">
      {/* Hero background with banner slider */}
      <div className="absolute inset-0 z-0">
        {isLoading ? (
          <div className="w-full h-full bg-gradient-to-r from-slate-800 to-slate-700 animate-pulse"></div>
        ) : banners.length > 0 ? (
          <>
            {/* Desktop Image */}
            {getCurrentBannerImage().desktop && (
              <img 
                src={getCurrentBannerImage().desktop}
                alt="Event banner" 
                className="hidden md:block w-full h-full object-cover transition-all duration-1000" 
                draggable={false}
              />
            )}
            
            {/* Mobile Image */}
            {getCurrentBannerImage().mobile && (
              <img 
                src={getCurrentBannerImage().mobile}
                alt="Event banner" 
                className="block md:hidden w-full h-full object-cover transition-all duration-1000" 
                draggable={false}
              />
            )}
            

            
            {/* Navigation arrows */}
            {banners.length > 0 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-2 sm:left-4 lg:left-6 top-1/2 transform -translate-y-1/2 z-40 bg-slate-900/80 backdrop-blur-sm text-white p-2 sm:p-3 rounded-full hover:bg-slate-800 transition-all duration-300 hover:scale-110 border border-slate-700"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-2 sm:right-4 lg:right-6 top-1/2 transform -translate-y-1/2 z-40 bg-slate-900/80 backdrop-blur-sm text-white p-2 sm:p-3 rounded-full hover:bg-slate-800 transition-all duration-300 hover:scale-110 border border-slate-700"
                  aria-label="Next slide"
                >
                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                </button>
              </>
            )}

            {/* Slide indicators */}
            {banners.length > 0 && (
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-40 flex space-x-3">
                {banners.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-4 h-4 rounded-full transition-all duration-300 border-2 ${
                      index === currentSlide
                        ? 'bg-[#00E1FC] border-[#00E1FC] shadow-lg shadow-[#00E1FC]/50 scale-110'
                        : 'bg-white/30 border-white/50 hover:bg-white/50 hover:border-white/75'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950"></div>
        )}
      </div>

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 z-20 bg-gradient-to-b from-slate-950/80 via-slate-950/40 to-slate-950/80"></div>
      <div className="absolute inset-0 z-10 bg-slate-950/30 backdrop-brightness-75"></div>

      <div className="relative z-50">
        <div className="mx-auto flex h-full w-full max-w-6xl flex-col items-start justify-end gap-6 px-4 sm:px-6 lg:px-8">
          <div className="space-y-4 sm:space-y-6">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#00E1FC]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-[#00E1FC]">
              Discover experiences
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold leading-tight text-white">
              Curate unforgettable nights with <span className="text-[#00E1FC]">Eventing Club</span>
            </h1>
            <p className="max-w-xl text-sm sm:text-base text-slate-200">
              Explore exclusive concerts, premium venues, and handpicked artists across the country. Book your next experience in just a few taps.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Link href="/events">
                <Button className="w-full sm:w-auto bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] text-white shadow-lg shadow-[#00E1FC]/30 hover:shadow-[#00E1FC]/40">
                  Explore Events
                </Button>
              </Link>
              <Link href="/venues">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto border-[#00E1FC]/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                >
                  <Play className="h-4 w-4" />
                  Discover Venues
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid w-full sm:w-auto grid-cols-2 gap-3 self-start sm:grid-cols-3 md:grid-cols-4">
            {heroHighlights.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-lg"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00E1FC]/15 text-[#00E1FC]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">{item.value}</p>
                    <p className="text-[11px] uppercase tracking-wide text-slate-300/80">{item.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
