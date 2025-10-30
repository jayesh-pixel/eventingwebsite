"use client";
import { useState, useEffect } from "react";
import { ArrowRight, Music, Guitar, Mic, Piano } from "lucide-react";

import Link from "next/link";
import { mockCategories } from "@/data/mockData";
import { categories as categoriesConfig } from "@/utils/config";
import axios from "axios";

const iconMap = {
  "fas fa-music": Music,
  "fas fa-guitar": Guitar,
  "fas fa-microphone": Mic,
  "fas fa-piano": Piano,
};

interface Category {
  _id: string;
  Name: string;
  Description: string | null;
  Images: Array<{
    image_path: string;
    _id: string;
  }>;
  Priority: number;
  status: number;
}

interface ApiResponse {
  error: boolean;
  message: string;
  data: Category[];
}

export default function EventCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get<ApiResponse>(categoriesConfig.GET_ALL);
        
        if (response.data && !response.data.error) {
          setCategories(response.data.data || []);
        } else {
          console.error('API Error:', response.data.message);
          // Fallback to empty array if API fails
          setCategories([]);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        // Fallback to empty array if API fails
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Handle scroll to update active dot
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollPosition = container.scrollLeft;
    const cardWidth = container.scrollWidth / categories.length;
    const newIndex = Math.round(scrollPosition / (cardWidth * 6)); // 6 cards visible at once
    setActiveIndex(newIndex);
  };

  // Scroll to specific section
  const scrollToIndex = (index: number) => {
    const container = document.getElementById('categories-scroll-container');
    if (container) {
      const cardWidth = container.scrollWidth / categories.length;
      container.scrollTo({
        left: cardWidth * index * 6, // 6 cards at a time
        behavior: 'smooth'
      });
      setActiveIndex(index);
    }
  };

  // Calculate total number of dots needed (groups of 6 cards)
  const totalDots = Math.ceil(categories.length / 6);

  if (isLoading) {
    return (
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto space-x-4 pb-4 snap-x snap-mandatory scroll-smooth scrollbar-hide">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[calc(16.666%-10px)] min-w-[160px] snap-center">
                <div className="glass-card rounded-2xl overflow-hidden animate-pulse">
                  <div className="h-32 bg-slate-800"></div>
                  <div className="p-3">
                    <div className="h-4 bg-slate-800 rounded mb-1"></div>
                    <div className="h-3 bg-slate-800 rounded mb-2"></div>
                    <div className="flex justify-between">
                      <div className="h-3 bg-slate-800 rounded w-16"></div>
                      <div className="h-3 bg-slate-800 rounded w-3"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* <div className="text-center mb-16 animate-fadeInUp">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Browse Events by Categories         
                      </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            From intimate acoustic sessions to massive festival experiences, find your perfect musical journey.
          </p>
        </div> */}

        {/* Horizontal Scrollable Container - Shows 4 cards at a time */}
        <div className="relative">
          <div 
            id="categories-scroll-container"
            className="flex overflow-x-auto space-x-6 pb-4 snap-x snap-mandatory scroll-smooth scrollbar-hide"
            onScroll={handleScroll}
          >
            {categories && categories.length > 0 ? (
              categories.map((category, index) => {
              // Since API doesn't provide icon/color, we'll use defaults based on category name or index
              const getIconAndColor = (name: string, index: number) => {
                const lowerName = name.toLowerCase();
                if (lowerName.includes('music')) return { icon: Music, color: 'primary' };
                if (lowerName.includes('concert') || lowerName.includes('live')) return { icon: Guitar, color: 'secondary' };
                if (lowerName.includes('holi') || lowerName.includes('nye')) return { icon: Mic, color: 'accent' };
                
                // Default rotation based on index
                const colors = ['primary', 'secondary', 'accent', 'danger'];
                const icons = [Music, Guitar, Mic, Piano];
                return { 
                  icon: icons[index % icons.length], 
                  color: colors[index % colors.length] 
                };
              };

              const { icon: IconComponent, color } = getIconAndColor(category.Name, index);
              
              const colorClass = {
                primary: "hover:shadow-primary/25",
                secondary: "hover:shadow-secondary/25",
                accent: "hover:shadow-accent/25",
                danger: "hover:shadow-destructive/25",
              }[color] || "hover:shadow-primary/25";

              // Get image URL from API response or use default

              const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "";
              const imageUrl = category.Images && category.Images.length > 0 
                ? category.Images[0].image_path.startsWith('http') 
                  ? category.Images[0].image_path 
                  : `${backendUrl}/${category.Images[0].image_path}`
                : `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop&sig=${index}`;

              return (
                <Link
                  key={category._id}
                  href={`/categories/${category._id}`}
                  className="block flex-shrink-0 w-[calc(16.666%-10px)] min-w-[160px] snap-center"
                  prefetch={false}
                >
                  <div
                    className={`glass-card rounded-2xl overflow-hidden group cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl ${colorClass} animate-slideInLeft h-full`}
                    style={{ animationDelay: `${index * 0.2}s` }}
                  >
                    <div className="relative h-32 overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={category.Name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          // Fallback to default image if API image fails to load
                          const target = e.target as HTMLImageElement;
                          target.src = `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop&sig=${index}`;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                      <div className={`absolute top-2 right-2 bg-${color}/20 backdrop-blur-sm rounded-full p-1`}>
                        <IconComponent className={`text-${color} h-3 w-3`} />
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-semibold mb-1 text-white transition-colors duration-300">
                        {category.Name}
                      </h3>
                      <p className="text-slate-400 text-xs mb-2">
                        {category.Description || "Discover amazing events in this category"}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium text-xs">Explore Events</span>
                        <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="flex-shrink-0 w-full text-center py-12">
              <Music className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">No categories available at the moment.</p>
              <p className="text-slate-500 text-sm mt-2">Please check back later for exciting event categories!</p>
            </div>
          )}
          </div>
          
          {/* Navigation Dots */}
          {categories.length > 6 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              {[...Array(totalDots)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollToIndex(index)}
                  className={`transition-all duration-300 rounded-full ${
                    activeIndex === index 
                      ? 'w-8 h-2 bg-primary' 
                      : 'w-2 h-2 bg-slate-600 hover:bg-slate-500'
                  }`}
                  aria-label={`Go to page ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <Link href="/events">
            <button className="group flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 hover:text-[#00E1FC] transition-all duration-300 border border-slate-700/50 rounded-lg hover:border-[#00E1FC]/50 hover:bg-slate-800/50">
              Browse All Categories
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
