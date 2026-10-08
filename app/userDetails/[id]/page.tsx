"use client";

import { customer } from "@/utils/config";
import { decryptData } from "@/utils/constants";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";
import { resetState } from "@/store/slices/authSlice";
import { IoIosLogOut } from "react-icons/io";
import EditProfile from "@/components/EditProfile";
import Link from "next/link";
import { Calendar, Mail, MapPin, Phone, Ticket } from "lucide-react";

const UserDetails = ({ params }: { params: { id: string } }) => {
  const passphrase = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "";
  const auth = useSelector((store: any) => store.uSess);
  const dispatch = useDispatch();
  const router = useRouter();
  
  const isLoggedIn = auth?.jL3 ? decryptData(auth.jL3, passphrase) : false;
  const token = auth?.pT5 ? decryptData(auth.pT5, passphrase) : "";
  const cust_id = auth?.xA1 ? decryptData(auth.xA1, passphrase) : "";
  
  const [userDetails, setUserDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'tickets'>('profile');
  const [ticketsData, setTicketsData] = useState<any | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn || !token) {
      router.push("/signup");
    }
  }, [isLoggedIn, token, router]);

  // Fetch user details
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!cust_id) return;
      
      try {
        setLoading(true);
        const payload = { customer_id: cust_id };
        const response = await axios.post(`${customer.GET_BY_ID}`, payload);
        
        if ((response.data as any)?.data) {
          setUserDetails((response.data as any).data);
        }
      } catch (error: any) {
        if (error.response) {
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
            toast.error(data.message);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    if (cust_id) {
      fetchUserDetails();
    }
  }, [cust_id]);

  // Fetch tickets when tickets tab is selected
  useEffect(() => {
    const fetchTickets = async () => {
      if (!cust_id) return;
      try {
        const payload = { customer_id: cust_id };
        const response = await axios.post(`${customer.GET_TICKETS_BY_ID}`, payload);
        const data = (response.data as any)?.data;

        if (!data) {
          setTicketsData(null);
          return;
        }

        // Normalize multiple possible response shapes
        // 1) Object with UpcomingEventTickets / PastEventTickets / PromoterBookedTickets
        if (data.UpcomingEventTickets || data.PastEventTickets || data.PromoterBookedTickets) {
          setTicketsData({
            UpcomingEventTickets: data.UpcomingEventTickets || [],
            PastEventTickets: data.PastEventTickets || [],
            PromoterBookedTickets: data.PromoterBookedTickets || [],
          });
          return;
        }

        // 2) Object with lowercase keys
        if (data.upcoming || data.past || data.promoter_tickets) {
          setTicketsData({
            UpcomingEventTickets: data.upcoming || [],
            PastEventTickets: data.past || [],
            PromoterBookedTickets: data.promoter_tickets || [],
          });
          return;
        }

        // 3) Flat array of bookings — treat as upcoming
        if (Array.isArray(data)) {
          setTicketsData({
            UpcomingEventTickets: data,
            PastEventTickets: [],
            PromoterBookedTickets: [],
          });
          return;
        }

        // 4) Single booking object
        if (typeof data === 'object') {
          setTicketsData({
            UpcomingEventTickets: [data],
            PastEventTickets: [],
            PromoterBookedTickets: [],
          });
          return;
        }

        setTicketsData(null);
      } catch (err) {
        console.error("Failed to fetch tickets:", err);
        setTicketsData(null);
      }
    };

    if (activeTab === 'tickets') {
      fetchTickets();
    }
  }, [activeTab, cust_id]);

  // Handle logout
  const handleLogout = () => {
    // Clear Redux state
    dispatch(resetState());
    
    // Drop only the persisted login state, not unrelated site data
    localStorage.removeItem("persist:root");
    
    // Redirect to home
    router.push("/");
    toast.success("Logged out successfully");
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-2 border-slate-700 border-t-[#00E1FC] animate-spin" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return null; // Will redirect in useEffect
  }

  const name = userDetails?.CustomerName || "User";
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part: string) => part[0]?.toUpperCase())
    .join("");

  const tabClass = (tab: "profile" | "tickets") =>
    `flex-1 rounded-lg py-2.5 text-sm sm:text-base font-semibold transition-colors ${
      activeTab === tab ? "bg-slate-800 text-white shadow" : "text-slate-400 hover:text-white"
    }`;

  const emptyTickets = (
    <div className="text-center px-2 py-10 sm:py-12">
      <Ticket className="w-14 h-14 mx-auto text-slate-600 mb-4" />
      <h3 className="text-lg sm:text-xl font-bold text-white mb-2">You don&apos;t have any tickets</h3>
      <p className="text-sm sm:text-base text-slate-400 mb-6">Start exploring events and book your tickets to see them here.</p>
      <Link
        href="/"
        className="inline-block bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] px-6 py-3 rounded-xl text-white font-semibold"
      >
        Explore events
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      <Toaster />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 pb-12 sm:pt-10">
        {/* Header */}
        <div className="rounded-2xl border border-[#00E1FC]/20 bg-gradient-to-r from-[#00E1FC]/10 to-[#0F33D1]/20 p-5 sm:p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#00E1FC] to-[#0F33D1] text-xl sm:text-2xl font-bold text-white">
              {initials || "U"}
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-white truncate">{name}</h1>
              {userDetails?.Email && (
                <p className="mt-1 flex items-center gap-2 text-sm text-slate-300">
                  <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                  <span className="truncate">{userDetails.Email}</span>
                </p>
              )}
              {userDetails?.MobileNumber && (
                <p className="mt-1 flex items-center gap-2 text-sm text-slate-300">
                  <Phone className="h-4 w-4 shrink-0 text-slate-400" />
                  <span>+91 {userDetails.MobileNumber}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex gap-1 rounded-xl border border-slate-800 bg-slate-900/60 p-1">
          <button onClick={() => setActiveTab("profile")} className={tabClass("profile")}>
            Profile
          </button>
          <button onClick={() => setActiveTab("tickets")} className={tabClass("tickets")}>
            My Tickets
          </button>
        </div>

        {/* Main Content */}
        <div className="mt-6">
          {activeTab === "profile" ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 sm:p-6">
              <h2 className="text-lg font-bold text-white mb-5">Personal Details</h2>
              <EditProfile id={cust_id} data={userDetails} />
            </div>
          ) : (
            (() => {
              const upcoming = ticketsData?.UpcomingEventTickets || [];
              const past = ticketsData?.PastEventTickets || [];
              const promoterBooked = ticketsData?.PromoterBookedTickets || [];
              const combined = [...upcoming, ...past, ...promoterBooked];

              if (combined.length === 0) {
                return (
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/50">{emptyTickets}</div>
                );
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {combined.map((t: any) => (
                    <div
                      key={t.Booking_id}
                      className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/50 p-4 sm:p-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-base sm:text-lg font-semibold text-white break-words">{t.EventName}</h3>
                        {t.Status && (
                          <span className="shrink-0 rounded-full bg-[#00E1FC]/10 px-2.5 py-1 text-xs font-medium text-[#00E1FC]">
                            {t.Status}
                          </span>
                        )}
                      </div>
                      <div className="mt-3 space-y-1.5 text-sm text-slate-300">
                        <p className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 shrink-0 text-slate-500" />
                          {t.EventDate}
                          {t.EventTime ? ` • ${t.EventTime}` : ""}
                        </p>
                        {(t.EventVenue || t.VenueCity) && (
                          <p className="flex items-start gap-2">
                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                            <span className="min-w-0 break-words">
                              {[t.EventVenue, t.VenueCity].filter(Boolean).join(" • ")}
                            </span>
                          </p>
                        )}
                      </div>
                      <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-800 pt-4">
                        <p className="min-w-0 truncate text-xs text-slate-500">Booking ID: {t.Booking_id}</p>
                        <Link
                          href={`/rndtckt/${t.Booking_id}`}
                          className="shrink-0 rounded-lg bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] px-4 py-2 text-sm font-semibold text-white"
                        >
                          View Ticket
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()
          )}
        </div>

        {/* Sign out */}
        <button
          onClick={handleLogout}
          className="mt-8 flex w-full sm:w-auto sm:mx-auto items-center justify-center gap-2 rounded-xl border border-red-500/40 px-6 py-3 font-semibold text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <IoIosLogOut size={20} />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default UserDetails;
