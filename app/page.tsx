import Link from "next/link";
import { ArrowRight } from "lucide-react";
import HeroSection from "@/components/hero-section";
import EventCategories from "@/components/event-categories";
import UpcomingEvents from "@/components/upcoming-events";
import ArtistsSection from "@/components/artists-section";
import VenuesSection from "@/components/venues-section";
import NewsletterSection from "@/components/newsletter-section";

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  accent?: string;
  description?: string;
  href?: string;
  linkLabel?: string;
}

const SectionHeader = ({
  eyebrow,
  title,
  accent,
  description,
  href,
  linkLabel,
}: SectionHeaderProps) => (
  <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between px-4 sm:px-6 lg:px-8 py-3 border-b border-blue-500/10">
    <div className="space-y-1">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-400">
        {eyebrow}
      </span>
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
        {title} {accent && <span className="text-blue-500">{accent}</span>}
      </h2>
      {description && (
        <p className="max-w-2xl text-xs text-gray-400 leading-relaxed">
          {description}
        </p>
      )}
    </div>
    {href && linkLabel && (
      <Link
        href={href}
        className="group inline-flex items-center gap-2 self-start bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-bold text-white transition-all duration-300 rounded-lg shadow-lg shadow-blue-600/20 hover:shadow-blue-500/40"
      >
        <span>{linkLabel}</span>
        <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
      </Link>
    )}
  </div>
);

export default function Home() {
  return (
    <div className="overflow-x-hidden bg-black">
      <HeroSection />

      <div className="relative z-10 w-full bg-black">
        <div>
          <section>
            <SectionHeader
              eyebrow="Don't miss"
              title="Upcoming"
              accent="Events"
              description="Handpicked experiences launching soon across cities. Secure your spot before they sell out."
            />
            <UpcomingEvents />
          </section>

          <section className="border-b border-blue-900/20">
            <SectionHeader
              eyebrow="Browse"
              title="Curated"
              accent="Categories"
              description="From intimate acoustic sessions to high-energy festivals, find events that match your vibe."
              href="/events"
              linkLabel="View all events"
            />
            <EventCategories />
          </section>

          <section className="border-b border-blue-900/20">
            <SectionHeader
              eyebrow="Featuring"
              title="Spotlight"
              accent="Artists"
              description="Discover trending artists and follow their upcoming performances nearby."
              href="/artists"
              linkLabel="See all artists"
            />
            <ArtistsSection />
          </section>

          <section className="border-b border-blue-900/20">
            <SectionHeader
              eyebrow="Premium"
              title="Signature"
              accent="Venues"
              description="Experience live events at handpicked venues known for their ambience and acoustics."
              href="/venues"
              linkLabel="Explore venues"
            />
            <VenuesSection />
          </section>

          <NewsletterSection />
        </div>
      </div>
    </div>
  );
}
