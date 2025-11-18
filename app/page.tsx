import Navigation from "@/components/navigation-new";
import HeroSection from "@/components/hero-section";
import EventCategories from "@/components/event-categories";
import UpcomingEvents from "@/components/upcoming-events";
import ArtistsSection from "@/components/artists-section";
import VenuesSection from "@/components/venues-section";
import NewsletterSection from "@/components/newsletter-section";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      <Navigation />
      <HeroSection />
      
      {/* Responsive Layout - Mobile Optimized */}
      <div className="w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="space-y-6 sm:space-y-8 lg:space-y-10">
          {/* Upcoming Events Section */}
          <div className="space-y-2 sm:space-y-3">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white px-1">
              <span className="bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] bg-clip-text text-transparent">Upcoming</span>{" "}
              <span className="text-white">Events</span>
            </h2>
            <UpcomingEvents />
          </div>
          
          {/* Artists Section */}
          <div className="space-y-2 sm:space-y-3">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white px-1">
              <span className="text-white">Featured</span>{" "}
              <span className="bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] bg-clip-text text-transparent">Artists</span>
            </h2>
            <ArtistsSection />
          </div>

          {/* Categories Section */}
          <div className="space-y-2 sm:space-y-3">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white px-1">
              <span className="text-white">Browse by</span>{" "}
              <span className="bg-gradient-to-r from-[#4ADE80] to-[#10B981] bg-clip-text text-transparent">Categories</span>
            </h2>
            <EventCategories />
          </div>
          
          {/* Venues Section */}
          <div className="space-y-2 sm:space-y-3">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white px-1">
              <span className="text-white">Premium</span>{" "}
              <span className="bg-gradient-to-r from-[#A78BFA] to-[#8B5CF6] bg-clip-text text-transparent">Venues</span>
            </h2>
            <VenuesSection />
          </div>
        </div>
      </div>

      <NewsletterSection />
      <Footer />
    </div>
  );
}
