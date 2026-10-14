import type { Metadata } from "next";
import { events as eventsConfig } from "@/utils/config";
import { SITE_NAME, SITE_PREVIEW_IMAGE } from "@/lib/site";

// The event page is a client component, so link previews (WhatsApp, Facebook, X...) got
// only the site-wide tags. This builds the event's own title, description and poster
// on the server, where crawlers read them.

interface EventMetaSource {
  EventName?: string;
  EventStartDate?: string;
  EventStartTime?: string;
  AboutEvent?: string;
  VenueName?: string;
  VenueCity?: string;
  OnlineEventFlag?: number;
  VenueToBeAnnounced?: number;
  TicketPriceStartsFrom?: number | string | null;
  EventCarouselImages?: { image_path?: string }[];
}

const DESCRIPTION_MAX_LENGTH = 200;

const fetchEventForMeta = async (eventId: string): Promise<EventMetaSource | null> => {
  try {
    const response = await fetch(eventsConfig.GET_ALL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_id: eventId }),
      // Previews are re-fetched by every app a link is pasted into; cache briefly.
      next: { revalidate: 300 },
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data && !data.error ? data.data?.EventDetailsObj ?? null : null;
  } catch {
    return null;
  }
};

const toPlainText = (html = "") =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();

const truncate = (text: string, max: number) =>
  text.length <= max ? text : `${text.slice(0, max - 1).replace(/\s+\S*$/, "")}…`;

const getImageUrl = (imagePath?: string) => {
  if (!imagePath) return undefined;
  const url = imagePath.startsWith("http")
    ? imagePath
    : `${process.env.NEXT_PUBLIC_BACKEND_URL}/${imagePath}`;
  return encodeURI(url);
};

const getLocation = (event: EventMetaSource) => {
  if (event.OnlineEventFlag == 1) return "Online";
  if (event.VenueToBeAnnounced == 1) return "Venue to be announced";
  return [event.VenueName, event.VenueCity].filter(Boolean).join(", ");
};

export async function generateMetadata({
  params,
}: {
  params: { eventId: string };
}): Promise<Metadata> {
  const event = await fetchEventForMeta(params.eventId);
  if (!event?.EventName) return {};

  const price = Number(event.TicketPriceStartsFrom);
  const hasPrice =
    event.TicketPriceStartsFrom !== null &&
    event.TicketPriceStartsFrom !== undefined &&
    event.TicketPriceStartsFrom !== "" &&
    Number.isFinite(price);

  // "11 Oct,2026 · 19:00 Onwards · Venue, City · Tickets from ₹200" then the about text.
  const summary = [
    event.EventStartDate,
    event.EventStartTime,
    getLocation(event),
    hasPrice ? (price === 0 ? "Free entry" : `Tickets from ₹${price}`) : "",
  ]
    .filter(Boolean)
    .join(" · ");
  const description = truncate(
    [summary, toPlainText(event.AboutEvent)].filter(Boolean).join(". "),
    DESCRIPTION_MAX_LENGTH
  );

  const url = `/events/${params.eventId}`;
  const image = getImageUrl(event.EventCarouselImages?.[0]?.image_path);
  // A page's openGraph replaces the site one entirely, so fall back to the logo here.
  const images = [{ url: image || SITE_PREVIEW_IMAGE, alt: event.EventName }];

  return {
    title: event.EventName,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      url,
      title: event.EventName,
      description,
      images,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: event.EventName,
      description,
      images: [image || SITE_PREVIEW_IMAGE],
    },
  };
}

export default function EventLayout({ children }: { children: React.ReactNode }) {
  return children;
}
