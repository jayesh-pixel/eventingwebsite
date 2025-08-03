"use client";

import { customer } from "@/utils/config";
import { decryptData } from "@/utils/constants";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useSelector } from "react-redux";
import { IoIosLogOut } from "react-icons/io";

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
    <div className="text-black bg-gray-50 md:p-6 p-4 rounded-lg shadow-md font-Atkinson">
      <Toaster />
      {/* Account Details */}
      <div className="flex flex-col gap-4">
        <div className="w-full border-b pb-4 mb-4">
          <h1 className="md:text-2xl text-xl font-semibold capitalize text-gray-800 mb-4">
            Account Details
          </h1>
          <div className="flex flex-col md:flex-row gap-6 w-full">
            {/* Email Address */}
            <div className="flex flex-col gap-2 w-full md:w-auto">
              <label className="text-gray-700 font-medium">
                Email Address:
              </label>
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter here"
                className="placeholder:text-gray-400 border w-full md:w-96 py-2 px-4 rounded-md outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
            {/* Mobile Number */}
            <div className="flex flex-col gap-2 w-full md:w-auto">
              <label className="text-gray-700 font-medium">
                Mobile Number:
              </label>
              <input
                type="text"
                name="number"
                value={data ? data.MobileNumber : ""}
                readOnly
                placeholder="Enter here"
                className="placeholder:text-gray-400 border w-full md:w-96 py-2 px-4 rounded-md bg-gray-200 text-gray-600 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Personal Details */}
        <div className="w-full border-b pb-4 mb-4">
          <h1 className="md:text-2xl text-xl font-semibold capitalize text-gray-800 mb-4">
            Personal Details
          </h1>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 w-full">
              <label className="text-gray-700 font-medium">Full Name:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter here"
                className="placeholder:text-gray-400 border w-full md:w-96 py-2 px-4 rounded-md outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="w-full">
          <h1 className="md:text-2xl text-xl font-semibold capitalize text-gray-800 mb-4">
            Address
          </h1>
          <div className="flex flex-col md:flex-row flex-wrap gap-6">
            {/* Pincode */}
            <div className="flex flex-col gap-2 w-full md:w-auto">
              <label className="text-gray-700 font-medium">Pincode:</label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                placeholder="Enter here"
                className="placeholder:text-gray-400 border w-full py-2 px-4 rounded-md outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
            {/* City */}
            <div className="flex flex-col gap-2 w-full md:w-auto">
              <label className="text-gray-700 font-medium">City:</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Enter here"
                className="placeholder:text-gray-400 border w-full py-2 px-4 rounded-md outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
            {/* State */}
            <div className="flex flex-col gap-2 w-full md:w-auto">
              <label className="text-gray-700 font-medium">State:</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="Enter here"
                className="placeholder:text-gray-400 border w-full py-2 px-4 rounded-md outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex mt-6">
        <button
          type="submit"
          onClick={handleSubmit}
          className="ml-auto px-6 py-3 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default EditProfile;
