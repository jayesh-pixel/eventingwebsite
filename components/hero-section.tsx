"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import axios from "axios";
import { getBanner } from "@/utils/config";

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
        const response = await axios.get<BannerApiResponse>(getBanner);
        
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
      <div className="relative w-full h-[45vh] sm:h-[50vh] md:h-[55vh] lg:h-[60vh] px-4 sm:px-8 md:px-12 lg:px-16 flex items-center">
        {isLoading ? (
          <div className="w-full h-full bg-gradient-to-r from-blue-950 to-black animate-pulse rounded-2xl"></div>
        ) : banners.length > 0 ? (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Slider Container - Shows 3 slides (prev, current, next) */}
            <div className="relative w-full h-full flex items-center justify-center overflow-visible">
              {banners.map((banner, index) => {
                const isActive = index === currentSlide;
                const isPrev = index === (currentSlide - 1 + banners.length) % banners.length;
                const isNext = index === (currentSlide + 1) % banners.length;
                
                if (!isActive && !isPrev && !isNext) return null;
                
                let position = 'translate-x-0 scale-100 z-20 opacity-100';
                if (isPrev) position = '-translate-x-[85%] scale-75 z-10 opacity-40';
                if (isNext) position = 'translate-x-[85%] scale-75 z-10 opacity-40';
                
                const desktopUrl = banner.DesktopbannerImage.startsWith('http')
                  ? banner.DesktopbannerImage
                  : `${BACKEND_URL}/${banner.DesktopbannerImage}`;
                  
                const mobileUrl = banner.MobilebannerImage.startsWith('http')
                  ? banner.MobilebannerImage
                  : `${BACKEND_URL}/${banner.MobilebannerImage}`;
                
                return (
                  <div
                    key={banner._id}
                    className={`absolute inset-0 transition-all duration-700 ease-in-out ${position} ${!isActive ? 'pointer-events-none' : ''}`}
                  >
                    {/* Desktop Image */}
                    <img 
                      src={desktopUrl}
                      alt="Event banner" 
                      className="hidden md:block w-full h-full object-cover rounded-2xl shadow-2xl" 
                      draggable={false}
                    />
                    
                    {/* Mobile Image */}
                    <img 
                      src={mobileUrl}
                      alt="Event banner" 
                      className="block md:hidden w-full h-full object-cover rounded-2xl shadow-2xl" 
                      draggable={false}
                    />
                    
                    {isActive && (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent rounded-2xl"></div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Navigation arrows */}
            {banners.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 z-40 bg-blue-600 hover:bg-blue-500 text-white rounded-full p-2 transition-all duration-300 hover:scale-110 shadow-lg"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 z-40 bg-blue-600 hover:bg-blue-500 text-white rounded-full p-2 transition-all duration-300 hover:scale-110 shadow-lg"
                  aria-label="Next slide"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}

            {/* Slide indicators */}
            {banners.length > 1 && (
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 z-40 flex space-x-3">
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
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 rounded-2xl"></div>
        )}
      </div>
    </section>
  );
}
