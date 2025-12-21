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
    <section className="relative w-full overflow-hidden bg-black">
      {/* Hero background with banner slider */}
      <div className="relative w-full h-[45vh] sm:h-[50vh] md:h-[55vh] lg:h-[60vh]">
        {isLoading ? (
          <div className="w-full h-full bg-gradient-to-r from-blue-950 to-black animate-pulse"></div>
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
            
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
            

            
            {/* Navigation arrows */}
            {banners.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 z-40 text-white/70 hover:text-blue-400 transition-all duration-300 hover:scale-125"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="h-8 w-8 sm:h-10 sm:w-10 drop-shadow-lg" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 z-40 text-white/70 hover:text-blue-400 transition-all duration-300 hover:scale-125"
                  aria-label="Next slide"
                >
                  <ChevronRight className="h-8 w-8 sm:h-10 sm:w-10 drop-shadow-lg" />
                </button>
              </>
            )}

            {/* Slide indicators */}
            {banners.length > 1 && (
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-40 flex space-x-3">
                {banners.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`transition-all duration-300 rounded-full ${
                      index === currentSlide
                        ? 'w-8 h-3 bg-blue-500 shadow-lg shadow-blue-500/50'
                        : 'w-3 h-3 bg-white/40 hover:bg-white/60'
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
    </section>
  );
}
