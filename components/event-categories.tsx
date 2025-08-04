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

  if (isLoading) {
    return (
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass-card rounded-2xl overflow-hidden animate-pulse">
                <div className="h-48 bg-slate-800"></div>
                <div className="p-6">
                  <div className="h-6 bg-slate-800 rounded mb-2"></div>
                  <div className="h-4 bg-slate-800 rounded mb-4"></div>
                  <div className="flex justify-between">
                    <div className="h-4 bg-slate-800 rounded w-20"></div>
                    <div className="h-4 bg-slate-800 rounded w-4"></div>
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
        <div className="text-center mb-16 animate-fadeInUp">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Browse Events by 
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"> Categories</span>
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            From intimate acoustic sessions to massive festival experiences, find your perfect musical journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
                primary: "hover:shadow-primary/25 hover:text-primary",
                secondary: "hover:shadow-secondary/25 hover:text-secondary",
                accent: "hover:shadow-accent/25 hover:text-accent",
                danger: "hover:shadow-destructive/25 hover:text-destructive",
              }[color] || "hover:shadow-primary/25 hover:text-primary";

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
                  className="block"
                  prefetch={false}
                >
                  <div
                    className={`glass-card rounded-2xl overflow-hidden group cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl ${colorClass} animate-slideInLeft`}
                    style={{ animationDelay: `${index * 0.2}s` }}
                  >
                    <div className="relative h-48 overflow-hidden">
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
                      <div className={`absolute top-4 right-4 bg-${color}/20 backdrop-blur-sm rounded-full p-2`}>
                        <IconComponent className={`text-${color} h-5 w-5`} />
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-current transition-colors duration-300">
                        {category.Name}
                      </h3>
                      <p className="text-slate-400 text-sm mb-4">
                        {category.Description || "Discover amazing events in this category"}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-accent font-medium">Explore Events</span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <Music className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">No categories available at the moment.</p>
              <p className="text-slate-500 text-sm mt-2">Please check back later for exciting event categories!</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
