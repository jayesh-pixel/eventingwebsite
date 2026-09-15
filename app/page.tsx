import Link from "next/link";
import { ArrowRight } from "lucide-react";
import HeroSection from "@/components/hero-section";
import EventCategories from "@/components/event-categories";
import UpcomingEvents from "@/components/upcoming-events";
import FeaturedEvents from "@/components/featured-events";
import ArtistsSection from "@/components/artists-section";
import VenuesSection from "@/components/venues-section";
import NewsletterSection from "@/components/newsletter-section";

export default function Home() {
  return (
    <div className="overflow-x-hidden bg-black">
      {/* Large Hero Banner Section */}
      <HeroSection />

      <div className="relative z-10 w-full bg-black">
        <div>
          {/* Categories Section */}
          <section className="py-4 border-b border-blue-900/20">
            <div className="px-4 sm:px-6 lg:px-8 mb-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                  Browse All <span className="text-blue-500">Categories</span>
                </h2>
                <Link
                  href="/categories"
                  className="group inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-3 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-xs font-bold text-white transition-all duration-300 rounded-lg shadow-lg shadow-blue-600/20 hover:shadow-blue-500/40 shrink-0"
                >
                  <span>View all</span>
                  <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
            <EventCategories />
          </section>

          {/* Featured Events Section - Distinct Separate Section */}
          <section className="relative py-8 sm:py-10 border-y border-[#FF6B6B]/20 bg-gradient-to-b from-[#FF6B6B]/[0.07] via-black to-black">
            {/* Decorative gradient orb */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#FF6B6B]/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="relative z-10 px-4 sm:px-6 lg:px-8">
              {/* Section Header */}
              <div className="flex items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-1.5 rounded-full bg-gradient-to-b from-[#FF6B6B] to-[#FF8E53]" />
                  <div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                      Featured <span className="text-[#FF6B6B]">Events</span>
                    </h2>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      Handpicked just for you
                    </span>
                  </div>
                </div>
                <Link
                  href="/events/featured"
                  className="group inline-flex items-center gap-2 bg-[#FF6B6B] hover:bg-[#FF6B6B]/90 px-3 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-xs font-bold text-white transition-all duration-300 rounded-lg shadow-lg shadow-[#FF6B6B]/20 hover:shadow-[#FF6B6B]/40 shrink-0"
                >
                  <span>View all</span>
                  <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
              <FeaturedEvents />
            </div>
          </section>

          {/* Updated Section for Events - Remove header, show inline */}
          <section className="py-6">
            <div className="px-4 sm:px-6 lg:px-8 mb-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-1.5 rounded-full bg-gradient-to-b from-[#00E1FC] to-[#0F33D1]" />
                  <div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                      Upcoming <span className="text-blue-500">Events</span>
                    </h2>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      Just announced
                    </span>
                  </div>
                </div>
                <Link
                  href="/events"
                  className="group inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-3 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-xs font-bold text-white transition-all duration-300 rounded-lg shadow-lg shadow-blue-600/20 hover:shadow-blue-500/40 shrink-0"
                >
                  <span>View all</span>
                  <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
            <UpcomingEvents />
          </section>

          {/* Circular Artists Row */}
          <section className="py-6 border-t border-blue-900/20">
            <div className="px-4 sm:px-6 lg:px-8">
              <ArtistsSection />
            </div>
          </section>

          {/* Venues Section */}
          <section className="py-6 border-t border-blue-900/20">
            <div className="px-4 sm:px-6 lg:px-8 mb-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                  Explore <span className="text-blue-500">Venues</span>
                </h2>
                <Link
                  href="/venues"
                  className="group inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-3 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-xs font-bold text-white transition-all duration-300 rounded-lg shadow-lg shadow-blue-600/20 hover:shadow-blue-500/40 shrink-0"
                >
                  <span>Explore</span>
                  <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
            <VenuesSection />
          </section>

          <NewsletterSection />
        </div>
      </div>
    </div>
  );
}
