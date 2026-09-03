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
        if ((response.data as any)?.data) {
          const data = (response.data as any).data;
          // Handle various response shapes — API may return UpcomingEventTickets/PastEventTickets
          // or a flat array, or additional promoter-booked tickets
          const upcoming = data.UpcomingEventTickets || data.upcoming || [];
          const past = data.PastEventTickets || data.past || [];
          // Also check for promoter-booked tickets if the API returns them separately
          const promoterBooked = data.PromoterBookedTickets || data.promoter_tickets || [];
          const combined = [...upcoming, ...past, ...promoterBooked];

          if (combined.length > 0) {
            setTicketsData({
              UpcomingEventTickets: upcoming,
              PastEventTickets: past,
              PromoterBookedTickets: promoterBooked,
            });
          } else {
            setTicketsData(null);
          }
        } else {
          setTicketsData(null);
        }
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
    
    // Clear localStorage if any
    localStorage.clear();
    
    // Redirect to home
    router.push("/");
    toast.success("Logged out successfully");
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      <Toaster />
      <div className="pt-12 pb-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {userDetails?.CustomerName || "User"}
            </h1>
            <p className="text-slate-300 text-lg">
              {userDetails?.Email || "No email provided"}
            </p>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300 font-semibold"
          >
            <IoIosLogOut size={22} />
            Sign Out
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8 border-b border-slate-800">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'profile' 
                ? 'text-white border-b-2 border-[#00E1FC]' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Edit profile
          </button>
          <button 
            onClick={() => setActiveTab('tickets')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'tickets' 
                ? 'text-white border-b-2 border-[#00E1FC]' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tickets
          </button>
        </div>

        {/* Main Content */}
        {activeTab === 'profile' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Account Details */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">Account Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400 block mb-2">Email Address:</label>
                  <div className="text-white font-medium">{userDetails?.Email || "Not provided"}</div>
                </div>
                
                <div>
                  <label className="text-sm text-slate-400 block mb-2">Mobile Number:</label>
                  <div className="text-white font-medium">{userDetails?.MobileNumber || "Not provided"}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Edit Profile Form */}
          <div className="lg:col-span-2">
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">Personal Details</h2>
              <EditProfile id={cust_id} data={userDetails} />
            </div>
          </div>
        </div>
        ) : (
          /* Tickets Tab */
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
            {!ticketsData ? (
              <div className="text-center p-12">
                <div className="mb-6">
                  <svg className="w-24 h-24 mx-auto text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">You don't have any tickets</h3>
                <p className="text-slate-400 mb-8">Start exploring events and book your tickets to see them here.</p>
                <Link href="/">
                  <button className="bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] hover:shadow-lg hover:shadow-[#00E1FC]/25 transition-all duration-300 transform hover:scale-105 px-8 py-3 rounded-lg text-white font-semibold">
                    Back to main page
                  </button>
                </Link>
              </div>
            ) : (
              // Combine upcoming and past tickets into a single flat list
              (() => {
                const upcoming = (ticketsData as any)?.UpcomingEventTickets || [];
                const past = (ticketsData as any)?.PastEventTickets || [];
                const promoterBooked = (ticketsData as any)?.PromoterBookedTickets || [];
                const combined = [...upcoming, ...past, ...promoterBooked];

                if (combined.length === 0) {
                  return (
                    <div className="text-center p-12">
                      <div className="mb-6">
                        <svg className="w-24 h-24 mx-auto text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-3">You don't have any tickets</h3>
                      <p className="text-slate-400 mb-8">Start exploring events and book your tickets to see them here.</p>
                      <Link href="/">
                        <button className="bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] hover:shadow-lg hover:shadow-[#00E1FC]/25 transition-all duration-300 transform hover:scale-105 px-8 py-3 rounded-lg text-white font-semibold">
                          Back to main page
                        </button>
                      </Link>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {combined.map((t: any) => (
                      <div key={t.Booking_id} className="bg-slate-800/40 p-4 rounded-lg flex items-start justify-between">
                        <div className="text-left">
                          <div className="text-white font-semibold">{t.EventName}</div>
                          <div className="text-slate-300 text-sm">{t.EventDate} • {t.EventTime}</div>
                          {/* Show venue details as requested */}
                          {(t.EventVenue || t.VenueCity) && (
                            <div className="text-slate-300 text-sm mt-1">{t.EventVenue}{t.EventVenue && t.VenueCity ? ` • ${t.VenueCity}` : t.VenueCity}</div>
                          )}
                          <div className="text-slate-400 text-sm mt-2">Status: <span className="font-medium text-white">{t.Status}</span></div>
                        </div>
                        <div className="flex flex-col items-end gap-3">
                          <Link href={`/rndtckt/${t.Booking_id}`}>
                            <button className="bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] px-4 py-2 rounded-md text-white font-semibold">View Ticket</button>
                          </Link>
                          <div className="text-slate-400 text-sm">Booking: {t.Booking_id}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetails;
