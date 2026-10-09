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

          {/* The component owns its header so the whole section disappears when there are no featured events. */}
          <FeaturedEvents />

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
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-xl font-bold text-white sm:text-2xl md:text-3xl">
                  Explore <span className="text-blue-500">Artists</span>
                </h2>
                <Link
                  href="/artists"
                  className="group inline-flex shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-[11px] font-bold text-white transition-all hover:bg-blue-500 sm:px-4 sm:py-2 sm:text-xs"
                >
                  <span>View all</span>
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
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
