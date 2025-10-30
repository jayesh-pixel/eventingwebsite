"use client";

import { Suspense } from "react";
import {
  setMobileNumber,
  setAuthDetails,
  setIsNewCustomer,
  setToken,
  loggedInSucces,
} from "@/store/slices/authSlice";
import {
  generateOPT,
  registerUser,
  validateOtp,
  customer,
} from "@/utils/config";
import axios from "axios";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useMemo, useRef, useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import Loading from "../../components/common/loading/Loading";
import { decryptData, encryptData } from "@/utils/constants";

const SignupContent = () => {
  const passphrase = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "";
  const auth = useSelector((store: any) => store.uSess);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  const number = auth?.vY4 ? decryptData(auth.vY4, passphrase) : "";
  const cust_id = auth?.xA1 ? decryptData(auth.xA1, passphrase) : "";
  const customer_exists = auth?.zX9 ? decryptData(auth.zX9, passphrase) : "";
  const token = auth?.pT5 ? decryptData(auth.pT5, passphrase) : "";
  const isNewCustomer = auth?.nQ2 ? decryptData(auth.nQ2, passphrase) : "";
  const isLoggedIn = auth?.jL3 ? decryptData(auth.jL3, passphrase) : "";

  console.log("Auth state debug:", { 
    raw_auth: auth,
    decrypted: { number, cust_id, customer_exists, token, isNewCustomer, isLoggedIn }
  });

  const [otp, setOtp] = useState(Array(6).fill(""));
  const [mobileNumber, setMobileNumberLocal] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [numberModal, setNumberModal] = useState(false);
  const [details, setDetails] = useState<any>();

  console.log("Signup flow state:", {
    step: !isLoggedIn && !token && !cust_id ? "mobile_input" :
          cust_id && !token && !numberModal ? "otp_input" :
          cust_id && token && (!customer_exists || isNewCustomer) ? "user_details" :
          "unknown",
    cust_id: !!cust_id,
    token: !!token,
    isLoggedIn: !!isLoggedIn
  });

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn && token && cust_id) {
      // Check for redirect URL from query params or sessionStorage
      const finalRedirect = redirectUrl || sessionStorage.getItem('redirectAfterLogin');
      if (finalRedirect) {
        sessionStorage.removeItem('redirectAfterLogin');
        router.push(finalRedirect);
      } else {
        router.push("/");
      }
    }
  }, [isLoggedIn, token, cust_id, router, redirectUrl]);

  //otp generation
  const otpGeneration = async () => {
    toast.dismiss();
    if (!mobileNumber || mobileNumber.length !== 10) {
      return toast.error("Please enter a valid 10-digit number");
    }

    const payload = { MobileNumber: String(mobileNumber) };

    try {
      const response = await axios.post(generateOPT, payload);
      const data = response.data as {
        data: { customer_id: string; customerExists: boolean };
        message: string;
      };
      dispatch(
        setAuthDetails({
          cust_id: encryptData(data.data.customer_id, passphrase),
          customer_exists: encryptData(String(data.data.customerExists), passphrase),
        })
      );

      toast.success(data.message);
      setNumberModal(false);
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
    }
  };

  const changeNumberOtpGeneration = async () => {
    toast.dismiss();
    if (!mobileNumber || mobileNumber.length !== 10) {
      return toast.error("Please enter a valid 10-digit number");
    }

    const payload = { MobileNumber: String(mobileNumber) };

    try {
      const response = await axios.post(generateOPT, payload);
      dispatch(
        setAuthDetails({
          cust_id: encryptData((response.data as { data: { customer_id: string; customerExists: boolean } }).data.customer_id, passphrase),
          customer_exists: encryptData(String((response.data as { data: { customer_id: string; customerExists: boolean } }).data.customerExists), passphrase),
        })
      );

      toast.success((response.data as { message: string }).message);
      setNumberModal(false);
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
    }
  };

  const handleUserDetails = async () => {
    toast.dismiss();
    const payload = {
      customer_id: cust_id,
      CustomerName: formData.name,
      Email: formData.email,
    };

    try {
      const response = await axios.post(registerUser, payload);
      toast.success((response.data as { message: string }).message);
      dispatch(setIsNewCustomer(null));
      fetchCustomerData();
      dispatch(loggedInSucces(encryptData("true", passphrase)));
      
      // Redirect to saved URL or home
      const finalRedirect = redirectUrl || sessionStorage.getItem('redirectAfterLogin');
      if (finalRedirect) {
        sessionStorage.removeItem('redirectAfterLogin');
        router.push(finalRedirect);
      } else {
        router.push("/");
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
    }
  };

  const handleForm = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const { value } = e.target;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < otp.length - 1) {
      inputs.current[index + 1]?.focus();
    } else if (!value && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  useEffect(() => {
    if (cust_id) {
      fetchCustomerData();
    }
  }, [cust_id]);

  const fetchCustomerData = async () => {
    toast.dismiss();
    const payload = { customer_id: cust_id };
    try {
      const response = await axios.post(`${customer.GET_BY_ID}`, payload);
      setDetails((response.data as { data: any }).data);
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
    }
  };

  // otp verification
  const handleOtpVerification = async () => {
    toast.dismiss();
    const stringOtp = otp.join("");

    if (!stringOtp || stringOtp.length !== 6) {
      return toast.error("Please enter a valid OTP");
    }

    const payload = {
      Otp: stringOtp,
      customer_id: cust_id,
    };

    try {
      const response = await axios.post(validateOtp, payload);
      const data = response.data as { data: { token: string }; message: string };
      dispatch(setToken(encryptData(data.data.token, passphrase)));
      toast.success((response.data as { message: string }).message);

      // Fetch customer data to check if user details exist
      const customerPayload = { customer_id: cust_id };
      try {
        const customerResponse = await axios.post(`${customer.GET_BY_ID}`, customerPayload);
        const customerData = (customerResponse.data as { data: any }).data;
        
        if (!customerData?.CustomerName) {
          // New user - needs to fill details
          dispatch(setIsNewCustomer(encryptData(true, passphrase)));
        } else {
          // Existing user - already has details
          dispatch(setIsNewCustomer(encryptData(false, passphrase)));
          dispatch(loggedInSucces(encryptData("true", passphrase)));
          toast.success("Login successful!");
          
          // Redirect to saved URL or home
          const finalRedirect = redirectUrl || sessionStorage.getItem('redirectAfterLogin');
          if (finalRedirect) {
            sessionStorage.removeItem('redirectAfterLogin');
            router.push(finalRedirect);
          } else {
            router.push("/");
          }
        }
      } catch (customerError) {
        // If customer fetch fails, assume new user
        dispatch(setIsNewCustomer(encryptData(true, passphrase)));
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
    }
  };

  const resendOtp = async () => {
    toast.dismiss();
    setOtp(Array(6).fill(""));
    if (!mobileNumber || mobileNumber.length !== 10) {
      return toast.error("Please enter a valid 10-digit number");
    }

    const payload = { MobileNumber: String(mobileNumber) };

    try {
      const response = await axios.post(generateOPT, payload);
      dispatch(
        setAuthDetails({
          cust_id: encryptData((response.data as { data: { customer_id: string; customerExists: boolean } }).data.customer_id, passphrase),
          customer_exists: encryptData(String((response.data as { data: { customer_id: string; customerExists: boolean } }).data.customerExists), passphrase),
        })
      );

      toast.success((response.data as { message: string }).message);
      setNumberModal(false);
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
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-blue-900 to-black">
      <Toaster />
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-xl shadow-lg p-8 flex flex-col items-center relative">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="absolute left-4 top-4 flex items-center gap-1 text-blue-300 hover:text-white transition-colors text-base font-medium"
          aria-label="Back"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back
        </button>
        <Image src="/placeholder-user.jpg" alt="Signup" width={80} height={80} className="rounded-full mb-4 border-4 border-blue-400" />
        <h2 className="text-3xl font-bold text-white mb-2 tracking-wide">Create Account</h2>
        <p className="text-blue-200 mb-6 text-center">Join the Eventing Club and never miss an event!</p>

        {/* initial mobile number section  */}
        {!isLoggedIn && !token && !cust_id && (
          <div className="w-full flex justify-center flex-col">
            <h1 className="text-xl font-bold mb-4 text-white">
              Welcome to eventing club
            </h1>

            <p className="text-base mb-3 text-white">
              Phone number*
            </p>
            <input
              type="text"
              placeholder="+91"
              value={mobileNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                setMobileNumberLocal(value);
                dispatch(setMobileNumber(encryptData(value, passphrase)));
              }}
              className="placeholder:text-slate-400 border w-full border-gray-500 rounded-md py-2 pl-2 outline-none focus:outline-none focus:ring focus:border-gray-50"
            />
            <button
              type="submit"
              onClick={otpGeneration}
              className="whitespace-nowrap capitalize inline-flex items-center mt-3 justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 w-full"
            >
              continue
            </button>
          </div>
        )}

        {cust_id && !token && !numberModal && (
          <div className="w-full">
            <h1 className="text-base mb-2 text-white">
              We had sent you a
            </h1>
            <h2 className="text-base text-white">
              OTP to verify your number
            </h2>
            <div className="mt-4 flex gap-2 justify-center">
              {otp.map((_, index) => (
                <input
                  key={index}
                  value={otp[index]}
                  type="text"
                  className="w-12 h-12 rounded-md border border-gray-400 text-center outline-none focus:outline-gray-300"
                  placeholder="0"
                  ref={(el) => { inputs.current[index] = el; }}
                  onChange={(e) => handleChange(e, index)}
                  maxLength={1}
                />
              ))}
            </div>
            <div className="flex gap-4 mt-6 mb-2 text-white">
              <span className="cursor-pointer underline" onClick={resendOtp}>
                Resend
              </span>
              <span
                className="cursor-pointer underline text-white"
                onClick={() => {
                  setOtp(Array(6).fill(""));
                  setNumberModal(true);
                }}
              >
                Change Number
              </span>
            </div>
            <button
              type="submit"
              onClick={handleOtpVerification}
              className="whitespace-nowrap capitalize inline-flex items-center mt-3 justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 w-full"
            >
              continue
            </button>
          </div>
        )}

        {/* form for new user */}
        {cust_id && token && (!customer_exists || isNewCustomer) && (
          <div className="w-full">
            <p className="text-sm mb-3 text-white">Name*</p>
            <input
              type="text"
              value={formData.name}
              name="name"
              onChange={handleForm}
              placeholder="Enter here"
              className="placeholder:text-slate-400 border w-full border-gray-500 rounded-md py-2 pl-2 outline-none focus:outline-none focus:ring focus:border-gray-50"
            />

            <p className="text-sm mb-3 mt-4 text-white">
              Email*
            </p>
            <input
              type="text"
              value={formData.email}
              name="email"
              onChange={handleForm}
              placeholder="Enter here"
              className="placeholder:text-slate-400 border w-full border-gray-500 rounded-md py-2 pl-2 outline-none focus:outline-none focus:ring focus:border-gray-50"
            />

            <button
              type="submit"
              onClick={handleUserDetails}
              className="whitespace-nowrap capitalize inline-flex items-center mt-3 justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 w-full"
            >
              Continue
            </button>
          </div>
        )}

        {/* change number section */}
        {numberModal && (
          <div className="w-full flex justify-center flex-col">
            <h1 className="text-base font-bold mb-4 text-white">
              Welcome to eventing club
            </h1>

            <p className="text-base mb-3 text-white">
              Phone number*
            </p>
            <input
              type="text"
              placeholder="+91"
              value={mobileNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                setMobileNumberLocal(value);
                dispatch(setMobileNumber(encryptData(value, passphrase)));
              }}
              className="placeholder:text-slate-400 border w-full border-gray-500 rounded-md py-2 pl-2 outline-none focus:outline-none focus:ring focus:border-gray-50"
            />
            <button
              type="submit"
              onClick={changeNumberOtpGeneration}
              className="whitespace-nowrap capitalize inline-flex items-center mt-3 justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 w-full"
            >
              continue
            </button>
          </div>
        )}

        <p className="mt-6 text-blue-200 text-sm">
          Already have an account? <span className="underline cursor-pointer text-blue-400" onClick={() => router.push("/login")}>Login</span>
        </p>
      </div>
    </div>
  );
};

// Main export with Suspense boundary
export default function Signup() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    }>
      <SignupContent />
    </Suspense>
  );
}
