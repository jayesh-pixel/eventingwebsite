"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Play, ChevronLeft, ChevronRight } from "lucide-react";
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
    <section className="relative w-full h-[220px] sm:h-[280px] md:h-[400px] lg:h-[500px] overflow-hidden mt-16 lg:mt-24\">\n      {/* Hero background with banner slider */}
      <div className="absolute inset-0 z-0">
        {isLoading ? (
          <div className="w-full h-full bg-gradient-to-r from-slate-800 to-slate-700 animate-pulse"></div>
        ) : banners.length > 0 && (
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
                  className="absolute left-2 sm:left-4 lg:left-6 top-1/2 transform -translate-y-1/2 z-20 bg-slate-900/80 backdrop-blur-sm text-white p-2 sm:p-3 rounded-full hover:bg-slate-800 transition-all duration-300 hover:scale-110 border border-slate-700"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-2 sm:right-4 lg:right-6 top-1/2 transform -translate-y-1/2 z-20 bg-slate-900/80 backdrop-blur-sm text-white p-2 sm:p-3 rounded-full hover:bg-slate-800 transition-all duration-300 hover:scale-110 border border-slate-700"
                  aria-label="Next slide"
                >
                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                </button>
              </>
            )}

            {/* Slide indicators */}
            {banners.length > 0 && (
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex space-x-3">
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
        )}
      </div>
    </section>
  );
}
