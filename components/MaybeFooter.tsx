"use client";
import Footer from "./footer";
import { usePathname } from "next/navigation";

export default function MaybeFooter() {
  const pathname = usePathname() || "";

  // Hide footer on booking/payment and user-details flows — only specific routes
  const shouldHide = (
    pathname.includes('/book') ||
    pathname.includes('/booking-success') ||
    pathname.includes('/booking-failed') ||
    pathname.includes('/payment-response') ||
    pathname.startsWith('/rndtckt') ||
    pathname.startsWith('/userDetails') ||
    pathname.includes('/payment')
  );

  if (shouldHide) return null;
  return <Footer />;
}
