"use client";
import React, { useState, useEffect } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import Image from "next/image";
import { Toaster } from "react-hot-toast";
import { FaUserCircle } from "react-icons/fa";
import { ChevronRight, ClipboardList, Home, Info, MapPin, Mic2 } from "lucide-react";
import { decryptData } from "@/utils/constants";

interface NavbarProps {
  bgColor?: string;
}

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/venues", label: "Venues", icon: MapPin },
  { href: "/artists", label: "Artists", icon: Mic2 },
  { href: "/about", label: "About Us", icon: Info },
  { href: "/listwithus", label: "List With Us", icon: ClipboardList },
];

const Navigation = ({ bgColor = "bg-transparent" }: NavbarProps) => {
  const passphrase = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "";
  const [open, setOpen] = useState(false);

  const pathname = usePathname() || "/";

  // Use Redux to check if the user is logged in
  interface RootState {
    uSess: any;
  }
  const auth = useSelector((store: RootState) => store.uSess);

  // Updated: Getting token from Redux store
  const getToken = auth?.pT5 ? decryptData(auth.pT5, passphrase) : null;
  const isLoggedInState = auth?.jL3 ? decryptData(auth.jL3, passphrase) : null;

  const cust_id = auth?.xA1 ? decryptData(auth.xA1, passphrase) : null;
  const mobileNumber = auth?.vY4 ? decryptData(auth.vY4, passphrase) : null;
  const isLoggedIn = !!(getToken && isLoggedInState === "true");

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  // Add/Remove class to block scrolling when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [open]);

  const handleToggle = () => {
    setOpen(!open);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
    <nav className="fixed top-0 w-full z-50 font-poppins bg-slate-950/95 backdrop-blur-md border-b border-slate-800/50">
      <Toaster />
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-24">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <div className="cursor-pointer relative h-28 w-40 md:h-36 md:w-56 lg:h-28 lg:w-80">
                <Image
                  src="/EC%20Logo.png"
                  alt="Eventing Club Logo"
                  fill
                  className="object-contain object-left"
                  priority
                />
              </div>
            </Link>
          </div>

          <div className="hidden lg:flex items-center flex-1 justify-center space-x-12 xl:space-x-16 mx-8">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-white hover:text-[#00E1FC] transition-colors duration-300 font-semibold text-base tracking-wide"
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-3 sm:space-x-6">
            {isLoggedIn ? (
              <Link href={`/userDetails/${cust_id}`} className="hidden items-center gap-2 group lg:flex">
                <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-800/50 transition-all duration-300">
                  <FaUserCircle className="size-5 lg:size-6 text-[#00E1FC] group-hover:scale-110 transition-transform duration-300" />
                  <span className="hidden lg:inline text-white font-medium text-sm">Profile</span>
                </div>
              </Link>
            ) : (
              <Link href="/signup" className="block">
                <button className="bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] hover:shadow-lg hover:shadow-[#00E1FC]/25 transition-all duration-300 transform hover:scale-105 px-3 sm:px-4 lg:px-5 py-1.5 sm:py-2 lg:py-2 rounded-lg text-white font-semibold text-xs sm:text-sm">
                  Login / Sign Up
                </button>
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={handleToggle}
              aria-label="Open menu"
              className="lg:hidden text-white p-2"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>

      {/* Mobile menu — rendered outside <nav>: its backdrop-blur would otherwise trap this
          fixed overlay inside the 64px navbar instead of covering the viewport */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-[60] bg-black/60 font-poppins" onClick={handleClose}>
          <aside
            className="ml-auto flex h-full w-[min(88vw,360px)] flex-col border-l border-slate-800/70 bg-slate-950 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
          {/* Header — same logo size as the navbar so opening the menu doesn't jump */}
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 border-b border-slate-800/50">
            <Link href="/" className="flex-shrink-0" onClick={handleClose}>
              <div className="cursor-pointer relative h-28 w-40 md:h-36 md:w-56">
                <Image
                  src="/EC%20Logo.png"
                  alt="Eventing Club Logo"
                  fill
                  className="object-contain object-left"
                  priority
                />
              </div>
            </Link>
            <button
              onClick={handleClose}
              aria-label="Close menu"
              className="text-white p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5">
            {/* Profile */}
            {isLoggedIn ? (
              <Link
                href={`/userDetails/${cust_id}`}
                onClick={handleClose}
                className="flex items-center gap-4 rounded-2xl bg-gradient-to-r from-[#00E1FC]/15 to-[#0F33D1]/25 border border-[#00E1FC]/20 p-4"
              >
                <FaUserCircle className="h-12 w-12 shrink-0 text-[#00E1FC]" />
                <div className="min-w-0 flex-1">
                  <p className="text-base font-semibold text-white">My Profile</p>
                  <p className="truncate text-sm text-slate-400">
                    {mobileNumber ? `+91 ${mobileNumber}` : "View your account & tickets"}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" />
              </Link>
            ) : (
              <div className="rounded-2xl bg-gradient-to-r from-[#00E1FC]/15 to-[#0F33D1]/25 border border-[#00E1FC]/20 p-4">
                <p className="text-base font-semibold text-white">Welcome to Eventing Club</p>
                <p className="mt-1 text-sm text-slate-400">Login to book tickets and view your bookings.</p>
                <Link href="/signup" onClick={handleClose} className="mt-4 block">
                  <span className="block w-full rounded-xl bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] px-4 py-3 text-center text-base font-semibold text-white">
                    Login / Sign Up
                  </span>
                </Link>
              </div>
            )}

            {/* Links */}
            <nav className="mt-6 space-y-1">
              {navLinks.map(({ href, label, icon: Icon }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={handleClose}
                    className={`flex items-center gap-4 rounded-xl px-4 py-3.5 text-base font-medium transition-colors ${
                      active
                        ? "bg-slate-800/70 text-[#00E1FC]"
                        : "text-slate-200 hover:bg-slate-800/50 hover:text-white"
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span className="flex-1">{label}</span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-600" />
                  </Link>
                );
              })}
            </nav>
          </div>
          </aside>
        </div>
      )}
    </>
  );
};

export default Navigation;
