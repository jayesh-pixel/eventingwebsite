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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Hero background with banner slider */}
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
            
            {/* Banner Info Display */}
            <div className="absolute bottom-20 left-6 z-20 bg-slate-900/80 backdrop-blur-sm rounded-lg p-4 border border-slate-700">
              <div className="text-white text-sm">
                <span className="block">Banner {currentSlide + 1} of {banners.length}</span>
                <span className="text-[#00E1FC] text-xs">
                  ID: {banners.length > 0 ? banners[currentSlide]?._id?.slice(-8) : 'N/A'}
                </span>
              </div>
            </div>
            
            {/* Navigation arrows */}
            {banners.length > 0 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-6 top-1/2 transform -translate-y-1/2 z-20 bg-slate-900/80 backdrop-blur-sm text-white p-3 rounded-full hover:bg-slate-800 transition-all duration-300 hover:scale-110 border border-slate-700"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-6 top-1/2 transform -translate-y-1/2 z-20 bg-slate-900/80 backdrop-blur-sm text-white p-3 rounded-full hover:bg-slate-800 transition-all duration-300 hover:scale-110 border border-slate-700"
                  aria-label="Next slide"
                >
                  <ChevronRight className="h-6 w-6" />
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
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/50 to-slate-950/90"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-fadeInUp">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Experience
            </span>
            <br />
            <span className="text-white">Music Like Never Before</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Discover exclusive events, world-class artists, and unforgettable moments at the most incredible venues around the globe.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button className="bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] px-8 py-4 text-lg hover:shadow-2xl hover:shadow-[#00E1FC]/25 transition-all duration-300 transform hover:scale-105 animate-glow">
              <Calendar className="mr-2 h-5 w-5" />
              Explore Events
            </Button>
            <Button variant="outline" className="border-2 border-[#FD743F] px-8 py-4 text-lg hover:bg-[#FDAB8B]/10 transition-all duration-300 transform text-[#FD743F] hover:scale-105">
              <Play className="mr-2 h-5 w-5" />
              Watch Experience
            </Button>
          </div>
        </div>
      </div>

      {/* Floating elements */}
      <div className="absolute top-1/4 left-10 w-20 h-20 bg-gradient-to-r from-primary to-secondary rounded-full opacity-20 animate-float"></div>
      <div className="absolute bottom-1/3 right-16 w-16 h-16 bg-gradient-to-r from-accent to-destructive rounded-full opacity-30 animate-float" style={{animationDelay: '2s'}}></div>
      <div className="absolute top-1/2 right-1/4 w-12 h-12 bg-gradient-to-r from-secondary to-primary rounded-full opacity-25 animate-float" style={{animationDelay: '4s'}}></div>
    </section>
  );
}
