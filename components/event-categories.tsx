"use client";
import { useState, useEffect } from "react";
import { ArrowRight, Music, Guitar, Mic, Piano } from "lucide-react";
import { mockCategories } from "@/data/mockData";

const iconMap = {
  "fas fa-music": Music,
  "fas fa-guitar": Guitar,
  "fas fa-microphone": Mic,
  "fas fa-piano": Piano,
};

export default function EventCategories() {
  const [categories, setCategories] = useState<typeof mockCategories>(mockCategories);
  const [isLoading, setIsLoading] = useState(false);

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
          {categories?.map((category, index) => {
            const IconComponent = iconMap[category.icon as keyof typeof iconMap] || Music;
            const colorClass = {
              primary: "hover:shadow-primary/25 hover:text-primary",
              secondary: "hover:shadow-secondary/25 hover:text-secondary",
              accent: "hover:shadow-accent/25 hover:text-accent",
              danger: "hover:shadow-destructive/25 hover:text-destructive",
            }[category.color] || "hover:shadow-primary/25 hover:text-primary";

            return (
              <div 
                key={category.id}
                className={`glass-card rounded-2xl overflow-hidden group cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl ${colorClass} animate-slideInLeft`}
                style={{animationDelay: `${index * 0.2}s`}}
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={`https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop&sig=${index}`}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                  <div className={`absolute top-4 right-4 bg-${category.color}/20 backdrop-blur-sm rounded-full p-2`}>
                    <IconComponent className={`text-${category.color} h-5 w-5`} />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-current transition-colors duration-300">
                    {category.name}
                  </h3>
                  <p className="text-slate-400 text-sm mb-4">{category.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-accent font-medium">{category.eventCount} Events</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
