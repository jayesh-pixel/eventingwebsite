import DOMPurify from "dompurify";

// Event/venue HTML comes from the dashboard and is rendered with dangerouslySetInnerHTML,
// so strip scripts, event handlers and other active content before it reaches the page.
// DOMPurify needs a DOM — these are only called after client-side fetches, so on the
// server we simply render nothing.

export function sanitizeHtml(html: string): string {
  if (typeof window === "undefined" || !html) return "";
  return DOMPurify.sanitize(html);
}

const GOOGLE_MAPS_EMBED = /^https:\/\/(www\.|maps\.)?google\.(com|co\.[a-z]{2}|[a-z]{2})\/maps(\/embed)?[/?]/i;

// Venue map field holds a Google Maps <iframe> snippet: keep that iframe, drop anything else.
export function sanitizeMapEmbed(html: string): string {
  if (typeof window === "undefined" || !html) return "";
  const clean = DOMPurify.sanitize(html, {
    ADD_TAGS: ["iframe"],
    ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "loading", "referrerpolicy"],
  });
  const doc = new DOMParser().parseFromString(clean, "text/html");
  doc.querySelectorAll("iframe").forEach((frame) => {
    if (!GOOGLE_MAPS_EMBED.test(frame.getAttribute("src") || "")) frame.remove();
  });
  return doc.body.innerHTML;
}
