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
  <div className="flex flex-col gap-4 px-1 sm:flex-row sm:items-end sm:justify-between">
    <div className="space-y-2 sm:space-y-3">
      <span className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#00E1FC]/80">
        {eyebrow}
      </span>
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
        {title} {accent && <span className="text-[#00E1FC]">{accent}</span>}
      </h2>
      {description && (
        <p className="max-w-xl text-sm sm:text-base text-slate-300/90">
          {description}
        </p>
      )}
    </div>
    {href && linkLabel && (
      <Link
        href={href}
        className="group inline-flex items-center gap-2 self-start rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-[#00E1FC]/60 hover:text-[#00E1FC]"
      >
        <span>{linkLabel}</span>
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      </Link>
    )}
  </div>
);

export default function Home() {
  return (
    <div className="overflow-x-hidden">
      <HeroSection />

      <div className="relative z-10 w-full px-3 sm:px-6 lg:px-8 pb-10 sm:pb-14 lg:pb-20">
        <div className="space-y-8 sm:space-y-12 lg:space-y-14">
          <section className="space-y-4 sm:space-y-6">
            <SectionHeader
              eyebrow="Don't miss"
              title="Upcoming"
              accent="Events"
              description="Handpicked experiences launching soon across cities. Secure your spot before they sell out."
            />
            <UpcomingEvents />
          </section>

          <section className="space-y-4 sm:space-y-6">
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

          <section className="space-y-4 sm:space-y-6">
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

          <section className="space-y-4 sm:space-y-6">
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
