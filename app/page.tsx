import Navigation from "@/components/navigation";
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
      <EventCategories />
      <UpcomingEvents />
      <ArtistsSection />
      <VenuesSection />
      <NewsletterSection />
      <Footer />
    </div>
  );
}
