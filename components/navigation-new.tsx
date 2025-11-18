"use client";
import React, { useState, useEffect } from "react";
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import Image from "next/image";
import { LuMapPin } from "react-icons/lu";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { MdEventAvailable } from "react-icons/md";
import { FaUserCircle } from "react-icons/fa";
import { decryptData } from "@/utils/constants";
import { homepageSearch } from "@/utils/config";

interface NavbarProps {
  bgColor?: string;
}

interface SearchItem {
  _id: string;
  Name?: string;
  EventName?: string;
}

const Navigation = ({ bgColor = "bg-transparent" }: NavbarProps) => {
  const passphrase = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "";
  const [open, setOpen] = useState(false);

  const [searchTerm, setsearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [searchData, setSearchData] = useState<SearchItem[]>([]);

  const pathname = usePathname();
  const homePageUrl = pathname === "/";

  // Use Redux to check if the user is logged in
  interface RootState {
    uSess: any;
  }
  const auth = useSelector((store: RootState) => store.uSess);

  // Updated: Getting token from Redux store
  const getToken = auth?.pT5 ? decryptData(auth.pT5, passphrase) : null;
  const isLoggedInState = auth?.jL3 ? decryptData(auth.jL3, passphrase) : null;

  const cust_id = auth?.xA1 ? decryptData(auth.xA1, passphrase) : null;
  const isLoggedIn = !!(getToken && isLoggedInState === "true");

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

  useEffect(() => {
    const delay = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 700);

    return () => clearTimeout(delay);
  }, [searchTerm]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setsearchTerm(e.target.value);
  };

  useEffect(() => {
    toast.dismiss();
    const fetchData = async () => {
      try {
        if (debouncedSearch) {
          if (debouncedSearch.length < 3) {
            toast.error("Search term must be greater than 3 characters");
            return;
          }
        }

        const payload = {
          search_keyword: debouncedSearch,
        };

        const response = await axios.post(
          `${homepageSearch.SEARCH_EVENTS_VENUES}`,
          payload
        );

        if ((response.data as any)?.data?.length > 0) {
          setSearchData((response.data as any).data);
        } else {
          toast.error("Events or venues not found");
          setSearchData([]);
        }
      } catch (error: any) {
        if (error?.response) {
          const { status, data } = error.response;

          if (
            status === 404 ||
            status === 403 ||
            status === 500 ||
            status === 302 ||
            status === 409 ||
            status === 401 ||
            status === 400
          ) {
            setSearchData([]);
          }
        }
      }
    };
    if (debouncedSearch !== "") {
      fetchData();
    } else {
      setSearchData([]);
    }
  }, [debouncedSearch]);

  // Track scroll for navbar bg
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
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
            <Link href="/" className="text-white hover:text-[#00E1FC] transition-colors duration-300 font-semibold text-base tracking-wide">
              Home
            </Link>
            <Link href="/venues" className="text-white hover:text-[#00E1FC] transition-colors duration-300 font-semibold text-base tracking-wide">
              Venues
            </Link>
            <Link href="/artists" className="text-white hover:text-[#00E1FC] transition-colors duration-300 font-semibold text-base tracking-wide">
              Artists
            </Link>
            <Link href="/about" className="text-white hover:text-[#00E1FC] transition-colors duration-300 font-semibold text-base tracking-wide">
              About Us
            </Link>
            <Link href="/listwithus" className="text-white hover:text-[#00E1FC] transition-colors duration-300 font-semibold text-base tracking-wide">
              List With Us
            </Link>
          </div>

          <div className="flex items-center space-x-6">
            <div className="relative hidden sm:block">
              <MagnifyingGlassIcon className="w-6 h-6 absolute left-4 top-3.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={handleChange}
                className="bg-slate-800/50 border border-slate-700 rounded-lg pl-12 pr-4 py-3.5 w-72 text-white text-base placeholder-slate-400 focus:ring-2 focus:ring-[#00E1FC] focus:border-transparent transition-all duration-300"
                placeholder="Search events, venues..."
              />
              
              {searchData.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-lg border border-slate-700 rounded-lg shadow-xl max-h-64 overflow-y-auto z-50">
                    {searchData.map((data: SearchItem, index: number) => (
                      <div key={data._id}>
                        {data.Name && (
                          <Link href={`/venue/${data._id}`}>
                            <div className="p-3 flex items-center space-x-2 hover:bg-slate-700 transition-colors duration-200 border-b border-slate-700 last:border-b-0">
                              <LuMapPin className="text-[#00E1FC]" size={16} />
                              <p className="text-white">{data.Name}</p>
                            </div>
                          </Link>
                        )}
                        {data.EventName && (
                          <Link href={`/events/${data._id}`}>
                            <div className="p-3 flex items-center space-x-2 hover:bg-slate-700 transition-colors duration-200 border-b border-slate-700 last:border-b-0">
                              <MdEventAvailable className="text-[#FD743F]" size={16} />
                              <p className="text-white">{data.EventName}</p>
                            </div>
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                )}
            </div>
            
            {isLoggedIn ? (
              <Link href={`/userDetails/${cust_id}`} className="flex items-center gap-2 group">
                <div className="flex items-center gap-2 px-2 lg:px-4 py-2 rounded-lg hover:bg-slate-800/50 transition-all duration-300">
                  <FaUserCircle className="size-7 lg:size-10 text-[#00E1FC] group-hover:scale-110 transition-transform duration-300" />
                  <span className="hidden xl:block text-white font-semibold">Profile</span>
                </div>
              </Link>
            ) : (
              <Link href="/signup">
                <button className="bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] hover:shadow-lg hover:shadow-[#00E1FC]/25 transition-all duration-300 transform hover:scale-105 px-6 lg:px-10 py-2 lg:py-3.5 rounded-lg text-white font-bold text-sm lg:text-lg">
                  Sign Up
                </button>
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={handleToggle}
              className="lg:hidden text-white p-2"
            >
              {open ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="lg:hidden bg-slate-900/95 backdrop-blur-lg border-t border-slate-800">
            <div className="px-4 pt-2 pb-3 space-y-1">
              <Link href="/" className="block px-3 py-2 text-white hover:text-[#00E1FC] transition-colors duration-300">
                Home
              </Link>
              <Link href="/venues" className="block px-3 py-2 text-white hover:text-[#00E1FC] transition-colors duration-300">
                Venues
              </Link>
              <Link href="/artists" className="block px-3 py-2 text-white hover:text-[#00E1FC] transition-colors duration-300">
                Artists
              </Link>
              <Link href="/about" className="block px-3 py-2 text-white hover:text-[#00E1FC] transition-colors duration-300">
                About Us
              </Link>
              <Link href="/listwithus" className="block px-3 py-2 text-white hover:text-[#00E1FC] transition-colors duration-300">
                List With Us
              </Link>
              
              <div className="px-3 py-2">
                <div className="relative">
                  <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={handleChange}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-[#00E1FC] focus:border-transparent transition-all duration-300"
                    placeholder="Search events, venues..."
                  />
                </div>
              </div>
              
              <div className="px-3 py-2">
                {isLoggedIn ? (
                  <Link href={`/userDetails/${cust_id}`}>
                    <button className="w-full bg-slate-800/50 border border-slate-700 hover:border-[#00E1FC] transition-all duration-300 px-4 py-2 rounded-lg text-white font-medium flex items-center justify-center gap-2">
                      <FaUserCircle className="text-[#00E1FC]" size={20} />
                      My Profile
                    </button>
                  </Link>
                ) : (
                  <Link href="/signup">
                    <button className="w-full bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] hover:shadow-lg hover:shadow-[#00E1FC]/25 transition-all duration-300 px-4 py-2 rounded-lg text-white font-semibold">
                      Sign Up
                    </button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
