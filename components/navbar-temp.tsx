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
// Make sure the config file exists at the specified path and exports homepageSearch.
// If the file or export does not exist, create it as shown below or update the path accordingly.
import { MdEventAvailable } from "react-icons/md";
import { FaUserCircle } from "react-icons/fa";
import { FaRegCircleUser } from "react-icons/fa6";
import { decryptData } from "@/utils/constants";
import { homepageSearch } from "@/utils/config";

interface NavbarProps {
  bgColor: string;
}

interface SearchItem {
  _id: string;
  Name?: string;
  EventName?: string;
}

const Navbar = ({ bgColor }: NavbarProps) => {
  const passphrase = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "";
  const [open, setOpen] = useState(false);

  const [searchTerm, setsearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [searchData, setSearchData] = useState<SearchItem[]>([]);

  const pathname = usePathname();
  const homePageUrl = pathname === "/";

  // Use Redux to check if the user is logged in
  // Define RootState type according to your Redux store structure
  interface RootState {
    uSess: any; // Replace 'any' with the actual type of uSess if known
  }
  const auth = useSelector((store: RootState) => store.uSess);

  // Updated: Getting token from Redux store
  const getToken = auth?.pT5 ? decryptData(auth.pT5, passphrase) : null;

  const cust_id = auth?.xA1 ? decryptData(auth.xA1, passphrase) : null;
  const isLoggedIn = !!getToken; // Check if the user is logged in based on token availability

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

  return (
    <div className=" font-poppins">
      <Toaster />
      <div
        className={` relative w-full  site-header pb-1  z-50`}
        // style={{
        //   boxShadow: " rgba(0, 0, 0, 0.08) 0px 4px 12px",
        // }}
      >
        <div className=" px-4 md:px-6">
          <div className="flex justify-between items-center pt-4 space-x-4 ">
            <div className="flex gap-4 justify-between items-center">
              <div>
                <span className="sr-only">Logo</span>
                <Link href="/">
                  <div className="cursor-pointer relative md:h-20 md:w-36 h-14 w-28">
                    <Image
                      src="/EC Logo Black Name.svg"
                      alt="logo"
                      layout="fill"
                      className="absolute"
                      objectFit="contain"
                    ></Image>
                  </div>
                </Link>
              </div>
            </div>

            <div className="hidden lg:flex justify-center  mt-2 text-lg">
              <ul
                className={`flex justify-center  ${
                  homePageUrl ? "gap-8" : "gap-14"
                }`}
              >
                <li
                  className=" text-black relative transition-all w-min-content
          before:w-0 before:h-1 before:absolute before:bottom-0 before:right-0 before:bg-blue-900 before:transition-all before:duration-500
          hover:before:w-full hover:before:left-0 hover:before:bg-blue-500"
                >
                  <Link href="/" className="">
                    Home
                  </Link>
                </li>
                <li
                  className=" text-black relative transition-all w-min-content
          before:w-0 before:h-1 before:absolute before:bottom-0 before:right-0 before:bg-blue-900 before:transition-all before:duration-500
          hover:before:w-full hover:before:left-0 hover:before:bg-blue-500 "
                >
                  <Link href="/venue">Venue</Link>
                </li>
                <li
                  className=" text-black relative transition-all w-min-content
          before:w-0 before:h-1 before:absolute before:bottom-0 before:right-0 before:bg-blue-900 before:transition-all before:duration-500
          hover:before:w-full hover:before:left-0 hover:before:bg-blue-500 "
                >
                  <Link href="/artists ">Artist</Link>
                </li>
                <li
                  className=" text-black relative transition-all w-min-content
          before:w-0 before:h-1 before:absolute before:bottom-0 before:right-0 before:bg-blue-900 before:transition-all before:duration-500
          hover:before:w-full hover:before:left-0 hover:before:bg-blue-500 "
                >
                  <Link href="/aboutus ">About us</Link>
                </li>
                <li
                  className=" text-black relative transition-all w-min-content
          before:w-0 before:h-1 before:absolute before:bottom-0 before:right-0 before:bg-blue-900 before:transition-all before:duration-500
          hover:before:w-full hover:before:left-0 hover:before:bg-blue-500"
                >
                  <Link href="/list-with-us">List with us</Link>
                </li>
              </ul>
            </div>

            <div className="flex items-center gap-4">
              {homePageUrl && (
                <div className="relative">
                  <button
                    className="flex items-center justify-center w-10 h-10 md:w-11 md:h-11 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-all duration-300 hover:shadow-md"
                    aria-label="Search"
                  >
                    <MagnifyingGlassIcon className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
                  </button>
                </div>
              )}
              {isLoggedIn ? (
                <div className="flex justify-center items-center">
                  <Link href={`/userDetails/${cust_id}`}>
                    <FaUserCircle className="size-8 md:size-10 text-gray-700 cursor-pointer" />
                  </Link>
                </div>
              ) : (
                <Link href="/signup">
                  <button className="whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-800">
                    Sign up
                  </button>
                </Link>
              )}
            </div>
          </div>


        </div>
      </div>
    </div>
  );
};

export default Navbar;
