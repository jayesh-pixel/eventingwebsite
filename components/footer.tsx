"use client";

import { Instagram, Twitter, Music2, Youtube } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Footer() {
  const pathname = usePathname() || "";
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "Eventing Club";
  const appDescription =
    process.env.NEXT_PUBLIC_APP_DESCRIPTION ||
    "Discover events, explore artists, and book tickets seamlessly.";

  const socialLinks = [
    {
      href: process.env.NEXT_PUBLIC_INSTAGRAM_URL,
      icon: Instagram,
      label: "Instagram",
    },
    {
      href: process.env.NEXT_PUBLIC_TWITTER_URL,
      icon: Twitter,
      label: "Twitter",
    },
    {
      href: process.env.NEXT_PUBLIC_TIKTOK_URL,
      icon: Music2,
      label: "TikTok",
    },
    {
      href: process.env.NEXT_PUBLIC_YOUTUBE_URL,
      icon: Youtube,
      label: "YouTube",
    },
  ].filter((item) => Boolean(item.href));

  // Hide footer on event detail pages, booking flow pages, and payment flow pages
  if (/^\/events\/[^/]+(\/(book|booking-success|booking-failed))?$/.test(pathname)) return null;

  return (
    <footer className="site-footer py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {appName}
            </div>
            <p className="text-slate-400 leading-relaxed">
              {appDescription}
            </p>
            {socialLinks.length > 0 && (
              <div className="flex space-x-4">
                {socialLinks.map(({ href, icon: Icon, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-primary transition-colors duration-300"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Events */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Events</h3>
            <ul className="space-y-2 text-slate-400">
              <li><Link href="/events" className="hover:text-primary transition-colors duration-300">All Events</Link></li>
              <li><Link href="/categories" className="hover:text-primary transition-colors duration-300">Categories</Link></li>
              <li><Link href="/venues" className="hover:text-primary transition-colors duration-300">Venues</Link></li>
            </ul>
          </div>

          {/* Artists */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Artists</h3>
            <ul className="space-y-2 text-slate-400">
              <li><Link href="/artists" className="hover:text-primary transition-colors duration-300">All Artists</Link></li>
              <li><Link href="/events" className="hover:text-primary transition-colors duration-300">Upcoming Performances</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Support</h3>
            <ul className="space-y-2 text-slate-400">
              <li><Link href="/listwithus" className="hover:text-primary transition-colors duration-300">List With Us</Link></li>
              <li><Link href="/signup" className="hover:text-primary transition-colors duration-300">Account</Link></li>
              <li><Link href="/failure" className="hover:text-primary transition-colors duration-300">Need Help</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-slate-400 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} {appName}. All rights reserved.
          </div>
          <div className="flex items-center space-x-4 text-sm text-slate-400">
            <Link href="/terms-and-conditions" className="hover:text-primary transition-colors duration-300">Terms &amp; Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
