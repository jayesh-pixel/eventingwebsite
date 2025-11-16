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
      
      {/* Compact Grid Layout - Full Width */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-8">
          {/* Upcoming Events & Artists - Full Width at Top */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            <div className="space-y-3">
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                <span className="bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] bg-clip-text text-transparent">Upcoming</span>{" "}
                <span className="text-white">Events</span>
              </h2>
              <UpcomingEvents />
            </div>
            
            <div className="space-y-3">
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                <span className="text-white">Featured</span>{" "}
                <span className="bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] bg-clip-text text-transparent">Artists</span>
              </h2>
              <ArtistsSection />
            </div>
          </div>

          {/* Categories & Venues in Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            <div className="space-y-3">
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                <span className="text-white">Browse by</span>{" "}
                <span className="bg-gradient-to-r from-[#4ADE80] to-[#10B981] bg-clip-text text-transparent">Categories</span>
              </h2>
              <EventCategories />
            </div>
            
            <div className="space-y-3">
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                <span className="text-white">Premium</span>{" "}
                <span className="bg-gradient-to-r from-[#A78BFA] to-[#8B5CF6] bg-clip-text text-transparent">Venues</span>
              </h2>
              <VenuesSection />
            </div>
          </div>
        </div>
      </div>

      <NewsletterSection />
      <Footer />
    </div>
  );
}
