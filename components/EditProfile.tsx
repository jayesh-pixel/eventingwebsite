"use client";

import { customer } from "@/utils/config";
import { decryptData } from "@/utils/constants";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useSelector } from "react-redux";

interface EditProfileProps {
  id: string;
  data: any;
}

const EditProfile = ({ id, data }: EditProfileProps) => {
  const passphrase = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "";
  const auth = useSelector((store: any) => store.uSess);
  const isLoggedIn = auth?.jL3 ? decryptData(auth.jL3, passphrase) : false;
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    state: "",
    city: "",
    pincode: "",
  });

  // Load initial data into the form fields (only the ones available)
  useEffect(() => {
    if (data) {
      setFormData({
        name: data.CustomerName || "",
        email: data.Email || "",
        state: data.State || "",
        city: data.City || "",
        pincode: data.Pincode || "",
      });
    }
  }, [data]);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/signup");
      // navigate("/signup"); // Redirect to the signup page if not authenticated
    }
  }, [isLoggedIn, router]);

  // Handle input change for dynamic form update
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    toast.dismiss();
    e.preventDefault();

    // Create payload with only non-empty fields
    const payload: Record<string, any> = {
      customer_id: id,
    };

    if (formData.name && formData.name.length > 2) {
      payload.CustomerName = formData.name;
    } else {
      toast.error("Name must be at least 3 characters long");
      return;
    }

    if (formData.email) payload.Email = formData.email;
    if (formData.state) payload.State = formData.state;
    if (formData.city) payload.City = formData.city;
    if (formData.pincode) payload.Pincode = formData.pincode;

    // console.log("Form Data:", formData);
    // console.log("Payload to be sent:", payload);

    // Call the update API
    try {
      const response = await axios.post(`${customer.UPDATE_CUSTOMER}`, payload);
      toast.success((response.data as { message: string }).message);
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
          toast.error(data.message);
        }
      }
    }
  };

  return (
    <div className="text-white">
      <Toaster />
      
      <div className="space-y-5 sm:space-y-6">
        {/* Full Name */}
        <div>
          <label className="text-sm text-slate-400 block mb-2">Full Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-[#00E1FC] focus:border-transparent transition-all duration-300 outline-none"
          />
        </div>

        {/* Address Section */}
        <div className="border-t border-slate-700 pt-5 sm:pt-6">
          <h3 className="text-lg font-bold text-white mb-4">Address</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pincode */}
            <div>
              <label className="text-sm text-slate-400 block mb-2">Pincode:</label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                placeholder="Enter pincode"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-[#00E1FC] focus:border-transparent transition-all duration-300 outline-none"
              />
            </div>
            
            {/* City */}
            <div>
              <label className="text-sm text-slate-400 block mb-2">City:</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Enter city"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-[#00E1FC] focus:border-transparent transition-all duration-300 outline-none"
              />
            </div>
            
            {/* State */}
            <div className="md:col-span-2">
              <label className="text-sm text-slate-400 block mb-2">State:</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="Enter state"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-[#00E1FC] focus:border-transparent transition-all duration-300 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2 sm:pt-4">
          <button
            type="submit"
            onClick={handleSubmit}
            className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-[#00E1FC]/25 transition-all duration-300 transform hover:scale-105"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
