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
import Navigation from "@/components/navigation-new";

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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <Navigation />
        <div className="flex items-center justify-center h-screen">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <Toaster />
      <Navigation />
      
      <div className="pt-20 px-4 md:px-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              User Profile
            </h1>
            <p className="text-blue-200">
              Welcome back, {userDetails?.CustomerName || "User"}!
            </p>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            <IoIosLogOut size={20} />
            Logout
          </button>
        </div>

        {/* User Info Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {userDetails?.CustomerName?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white">
                {userDetails?.CustomerName || "User"}
              </h2>
              <p className="text-blue-200">{userDetails?.Email || "No email provided"}</p>
              <p className="text-blue-200">{userDetails?.MobileNumber || "No phone provided"}</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="text-blue-200">
              <span className="font-medium">Customer ID:</span>
              <p className="text-white">{cust_id}</p>
            </div>
            <div className="text-blue-200">
              <span className="font-medium">City:</span>
              <p className="text-white">{userDetails?.City || "Not provided"}</p>
            </div>
            <div className="text-blue-200">
              <span className="font-medium">State:</span>
              <p className="text-white">{userDetails?.State || "Not provided"}</p>
            </div>
          </div>
        </div>

        {/* Edit Profile Section */}
        <div className="bg-white rounded-xl shadow-lg">
          <EditProfile id={cust_id} data={userDetails} />
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
