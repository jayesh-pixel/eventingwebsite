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
      
      {/* Compact Grid Layout - Less Scrolling */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-12">
          {/* Upcoming Events & Artists - Full Width at Top */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold">
                <span className="bg-gradient-to-r from-accent to-destructive bg-clip-text text-transparent">Upcoming</span> Events
              </h2>
              <UpcomingEvents />
            </div>
            
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold">
                Featured <span className="bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">Artists</span>
              </h2>
              <ArtistsSection />
            </div>
          </div>

          {/* Categories & Venues in Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold">
                Browse by <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Categories</span>
              </h2>
              <EventCategories />
            </div>
            
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold">
                Premium <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Venues</span>
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
