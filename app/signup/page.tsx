"use client";

import { Suspense } from "react";
import {
  setMobileNumber,
  setAuthDetails,
  setIsNewCustomer,
  setToken,
  loggedInSucces,
  resetState,
} from "@/store/slices/authSlice";
import {
  generateOPT,
  registerUser,
  validateOtp,
  customer,
} from "@/utils/config";
import axios from "axios";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useRef, useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { decryptData, encryptData } from "@/utils/constants";

// Step constants matching backend 3-step verification
const STEP_PHONE = 1;
const STEP_OTP = 2;
const STEP_DETAILS = 3;

const AuthContent = () => {
  const passphrase = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "";
  const auth = useSelector((store: any) => store.uSess);
  const dispatch = useDispatch();
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");

  // Local state
  const [step, setStep] = useState(STEP_PHONE);
  const [mobileNumber, setMobileNumberLocal] = useState("");
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Current working customer_id (from API response)
  const [customerId, setCustomerId] = useState("");
  const [customerExists, setCustomerExists] = useState(false);

  // Read persisted auth state for redirect check
  const persisted_cust_id = auth?.xA1 ? decryptData(auth.xA1, passphrase) : "";
  const persisted_token = auth?.pT5 ? decryptData(auth.pT5, passphrase) : "";
  const persisted_isLoggedIn = auth?.jL3 ? decryptData(auth.jL3, passphrase) : "";

  // OTP countdown timer
  useEffect(() => {
    if (otpTimer > 0) {
      timerRef.current = setTimeout(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [otpTimer]);

  // Redirect if already logged in
  useEffect(() => {
    if (persisted_isLoggedIn && persisted_token && persisted_cust_id) {
      const finalRedirect = redirectUrl || sessionStorage.getItem("redirectAfterLogin");
      if (finalRedirect) {
        sessionStorage.removeItem("redirectAfterLogin");
        router.push(finalRedirect);
      } else {
        router.push("/");
      }
    } else if (persisted_cust_id && !persisted_token && !persisted_isLoggedIn) {
      const hasJustGeneratedOtp = sessionStorage.getItem("otpGenerated");
      if (!hasJustGeneratedOtp) {
        dispatch(resetState());
        setMobileNumberLocal("");
      }
    }
  }, [persisted_isLoggedIn, persisted_token, persisted_cust_id, router, redirectUrl, dispatch]);

  // ─── Step 1: Generate OTP ───────────────────────────────────────────────────
  const handleGenerateOtp = useCallback(async () => {
    toast.dismiss();
    if (!mobileNumber || mobileNumber.length !== 10) {
      return toast.error("Please enter a valid 10-digit mobile number");
    }
    setIsSubmitting(true);

    try {
      sessionStorage.setItem("otpGenerated", "true");
      const response = await axios.post(generateOPT, { MobileNumber: String(mobileNumber) });
      const data = response.data as {
        data: { customer_id: string; customerExists: boolean };
        message: string;
      };

      setCustomerId(data.data.customer_id);
      setCustomerExists(data.data.customerExists);

      dispatch(
        setAuthDetails({
          cust_id: encryptData(data.data.customer_id, passphrase),
          customer_exists: encryptData(String(data.data.customerExists), passphrase),
        })
      );
      dispatch(setMobileNumber(encryptData(mobileNumber, passphrase)));

      toast.success(data.message);
      setStep(STEP_OTP);
      setOtpTimer(60);
      setTimeout(() => sessionStorage.removeItem("otpGenerated"), 1000);
    } catch (error: any) {
      handleApiError(error);
    } finally {
      setIsSubmitting(false);
    }
  }, [mobileNumber, dispatch, passphrase]);

  // ─── Step 2: Verify OTP ─────────────────────────────────────────────────────
  const handleVerifyOtp = useCallback(async () => {
    toast.dismiss();
    const stringOtp = otp.join("");
    if (!stringOtp || stringOtp.length !== 6) {
      return toast.error("Please enter the 6-digit OTP");
    }
    setIsSubmitting(true);

    try {
      const response = await axios.post(validateOtp, {
        Otp: stringOtp,
        customer_id: customerId,
      });
      const data = response.data as { data: { token: string }; message: string };

      dispatch(setToken(encryptData(data.data.token, passphrase)));
      toast.success(data.message);

      // Check if customer already has profile details
      try {
        const customerResponse = await axios.post(customer.GET_BY_ID, {
          customer_id: customerId,
        });
        const customerData = (customerResponse.data as { data: any }).data;

        if (!customerData?.CustomerName) {
          // New user — needs profile details (Step 3)
          dispatch(setIsNewCustomer(encryptData(true, passphrase)));
          setStep(STEP_DETAILS);
        } else {
          // Existing user — log them in directly
          dispatch(setIsNewCustomer(encryptData(false, passphrase)));
          dispatch(loggedInSucces(encryptData("true", passphrase)));
          toast.success("Welcome back!");
          const finalRedirect = redirectUrl || sessionStorage.getItem("redirectAfterLogin");
          if (finalRedirect) {
            sessionStorage.removeItem("redirectAfterLogin");
            router.push(finalRedirect);
          } else {
            router.push("/");
          }
        }
      } catch {
        dispatch(setIsNewCustomer(encryptData(true, passphrase)));
        setStep(STEP_DETAILS);
      }
    } catch (error: any) {
      handleApiError(error);
    } finally {
      setIsSubmitting(false);
    }
  }, [otp, customerId, dispatch, passphrase, redirectUrl, router]);

  // ─── Step 3: Submit Profile Details ──────────────────────────────────────────
  const handleUserDetails = useCallback(async () => {
    toast.dismiss();
    if (!formData.name.trim()) {
      return toast.error("Please enter your name");
    }
    if (!formData.email.trim()) {
      return toast.error("Please enter your email");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      return toast.error("Please enter a valid email address");
    }
    setIsSubmitting(true);

    try {
      await axios.post(registerUser, {
        customer_id: customerId,
        CustomerName: formData.name.trim(),
        Email: formData.email.trim().toLowerCase(),
      });
      toast.success("Profile created successfully!");
      dispatch(setIsNewCustomer(null));
      dispatch(loggedInSucces(encryptData("true", passphrase)));

      const finalRedirect = redirectUrl || sessionStorage.getItem("redirectAfterLogin");
      if (finalRedirect) {
        sessionStorage.removeItem("redirectAfterLogin");
        router.push(finalRedirect);
      } else {
        router.push("/");
      }
    } catch (error: any) {
      handleApiError(error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, customerId, dispatch, passphrase, redirectUrl, router]);

  // ─── Resend OTP ──────────────────────────────────────────────────────────────
  const handleResendOtp = useCallback(async () => {
    toast.dismiss();
    setOtp(Array(6).fill(""));
    if (!mobileNumber || mobileNumber.length !== 10) {
      return toast.error("Phone number not found. Please go back and re-enter.");
    }
    setIsSubmitting(true);

    try {
      const response = await axios.post(generateOPT, { MobileNumber: String(mobileNumber) });
      const data = response.data as {
        data: { customer_id: string; customerExists: boolean };
        message: string;
      };

      setCustomerId(data.data.customer_id);
      setCustomerExists(data.data.customerExists);
      dispatch(
        setAuthDetails({
          cust_id: encryptData(data.data.customer_id, passphrase),
          customer_exists: encryptData(String(data.data.customerExists), passphrase),
        })
      );

      toast.success("OTP resent successfully!");
      setOtpTimer(60);
    } catch (error: any) {
      handleApiError(error);
    } finally {
      setIsSubmitting(false);
    }
  }, [mobileNumber, dispatch, passphrase]);

  // ─── Error handler ──────────────────────────────────────────────────────────
  const handleApiError = (error: any) => {
    if (error?.response) {
      const { status, data } = error.response;
      if ([400, 401, 403, 404, 409, 500].includes(status)) {
        toast.error(data?.message || "Something went wrong. Please try again.");
      }
    } else {
      toast.error("Network error. Please check your connection.");
    }
  };

  // ─── OTP input handlers ────────────────────────────────────────────────────
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const { value } = e.target;
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < otp.length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pastedData.length > 0) {
      const newOtp = [...Array(6).fill("")];
      pastedData.split("").forEach((digit, i) => {
        newOtp[i] = digit;
      });
      setOtp(newOtp);
      const nextEmpty = pastedData.length < 6 ? pastedData.length : 5;
      inputs.current[nextEmpty]?.focus();
    }
  };

  // ─── Step labels ────────────────────────────────────────────────────────────
  const steps = [
    { number: 1, label: "Phone" },
    { number: 2, label: "Verify" },
    { number: 3, label: "Profile" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-[#0a0f1e] to-slate-950 px-4 py-8">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#1e293b",
            color: "#fff",
            border: "1px solid #334155",
          },
        }}
      />

      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden">
          {/* Header gradient */}
          <div className="bg-gradient-to-r from-[#00E1FC]/10 to-[#0F33D1]/10 px-5 pt-6 pb-5 sm:px-8 sm:pt-8 sm:pb-6">
            {/* Back button */}
            <button
              onClick={() => {
                if (step > STEP_PHONE) {
                  setStep(STEP_PHONE);
                  setOtp(Array(6).fill(""));
                } else {
                  router.back();
                }
              }}
              className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors text-sm font-medium py-1 mb-3 sm:mb-4"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              {step > STEP_PHONE ? "Back to phone" : "Back"}
            </button>

            {/* Logo / Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-[#00E1FC] to-[#0F33D1] rounded-full flex items-center justify-center shadow-lg shadow-[#00E1FC]/20">
                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-white text-center tracking-wide">
              {step === STEP_PHONE && "Welcome to Eventing Club"}
              {step === STEP_OTP && "Verify Your Number"}
              {step === STEP_DETAILS && "Complete Your Profile"}
            </h1>
            <p className="text-slate-400 text-center mt-1 text-sm">
              {step === STEP_PHONE && "Enter your phone number to get started"}
              {step === STEP_OTP && `We sent a 6-digit code to +91 ${mobileNumber}`}
              {step === STEP_DETAILS && "Tell us a bit about yourself"}
            </p>
          </div>

          {/* Step indicator */}
          <div className="px-5 sm:px-8 py-4 border-b border-slate-800/50">
            <div className="flex items-center justify-between">
              {steps.map((s, idx) => (
                <React.Fragment key={s.number}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                        step > s.number
                          ? "bg-green-500 text-white"
                          : step === s.number
                          ? "bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] text-white shadow-lg shadow-[#00E1FC]/30"
                          : "bg-slate-800 text-slate-500"
                      }`}
                    >
                      {step > s.number ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      ) : (
                        s.number
                      )}
                    </div>
                    <span className={`text-xs mt-1 ${step >= s.number ? "text-slate-300" : "text-slate-600"}`}>
                      {s.label}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 rounded transition-colors duration-300 ${
                      step > s.number ? "bg-green-500" : "bg-slate-800"
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Step content */}
          <div className="px-5 sm:px-8 py-6">
            {/* ─── Step 1: Phone Number ─────────────────────────────────────── */}
            {step === STEP_PHONE && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Mobile Number
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-400 text-sm font-medium shrink-0">
                      +91
                    </div>
                    <input
                      type="tel"
                      inputMode="numeric"
                      placeholder="Enter 10-digit number"
                      value={mobileNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                        setMobileNumberLocal(value);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && mobileNumber.length === 10) {
                          handleGenerateOtp();
                        }
                      }}
                      className="flex-1 min-w-0 bg-slate-800/50 border border-slate-700 rounded-lg py-2.5 px-4 text-base text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-[#00E1FC] focus:border-transparent transition-all duration-300"
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  onClick={handleGenerateOtp}
                  disabled={isSubmitting || mobileNumber.length !== 10}
                  className="w-full bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] hover:shadow-lg hover:shadow-[#00E1FC]/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] py-3 rounded-xl text-white font-semibold text-base"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Sending OTP...
                    </span>
                  ) : (
                    "Get OTP"
                  )}
                </button>

                <p className="text-xs text-slate-500 text-center mt-4">
                  By continuing, you agree to our{" "}
                  <Link href="/terms-and-conditions" className="underline hover:text-slate-300">
                    Terms &amp; Conditions
                  </Link>
                </p>
              </div>
            )}

            {/* ─── Step 2: OTP Verification ──────────────────────────────────── */}
            {step === STEP_OTP && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Enter 6-digit OTP
                  </label>
                  <div className="flex gap-1.5 sm:gap-2 justify-center" onPaste={handleOtpPaste}>
                    {otp.map((_, index) => (
                      <input
                        key={index}
                        value={otp[index]}
                        type="text"
                        inputMode="numeric"
                        className="w-10 h-12 sm:w-12 sm:h-14 rounded-lg border border-slate-700 bg-slate-800/50 text-white text-center text-lg font-bold outline-none focus:ring-2 focus:ring-[#00E1FC] focus:border-transparent transition-all duration-200"
                        placeholder="·"
                        ref={(el) => {
                          inputs.current[index] = el;
                        }}
                        onChange={(e) => handleOtpChange(e, index)}
                        onKeyDown={(e) => handleOtpKeyDown(e, index)}
                        maxLength={1}
                      />
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleVerifyOtp}
                  disabled={isSubmitting || otp.join("").length !== 6}
                  className="w-full bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] hover:shadow-lg hover:shadow-[#00E1FC]/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] py-3 rounded-xl text-white font-semibold text-base"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Verifying...
                    </span>
                  ) : (
                    "Verify OTP"
                  )}
                </button>

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={handleResendOtp}
                    disabled={otpTimer > 0 || isSubmitting}
                    className="text-sm py-2 text-[#00E1FC] hover:text-[#00E1FC]/80 disabled:text-slate-600 disabled:cursor-not-allowed transition-colors"
                  >
                    {otpTimer > 0 ? `Resend in ${otpTimer}s` : "Resend OTP"}
                  </button>
                  <button
                    onClick={() => {
                      setStep(STEP_PHONE);
                      setOtp(Array(6).fill(""));
                      dispatch(resetState());
                      setMobileNumberLocal("");
                    }}
                    className="text-sm py-2 text-slate-400 hover:text-white transition-colors underline"
                  >
                    Change Number
                  </button>
                </div>
              </div>
            )}

            {/* ─── Step 3: Profile Details ───────────────────────────────────── */}
            {step === STEP_DETAILS && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    name="name"
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        (document.querySelector('[name="email"]') as HTMLInputElement)?.focus();
                      }
                    }}
                    placeholder="Enter your full name"
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2.5 px-4 text-base text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-[#00E1FC] focus:border-transparent transition-all duration-300"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    name="email"
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && formData.name.trim() && formData.email.trim()) {
                        handleUserDetails();
                      }
                    }}
                    placeholder="you@example.com"
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2.5 px-4 text-base text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-[#00E1FC] focus:border-transparent transition-all duration-300"
                  />
                </div>

                <button
                  onClick={handleUserDetails}
                  disabled={isSubmitting || !formData.name.trim() || !formData.email.trim()}
                  className="w-full bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] hover:shadow-lg hover:shadow-[#00E1FC]/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] py-3 rounded-xl text-white font-semibold text-base"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    "Complete Registration"
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-xs mt-6">
          Secure authentication powered by Eventing Club
        </p>
      </div>
    </div>
  );
};

// Main export with Suspense boundary
export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-[#0a0f1e] to-slate-950">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] rounded-full blur-lg opacity-30 animate-pulse"></div>
              <svg className="relative h-12 w-12 animate-spin text-[#00E1FC] mx-auto" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
            <p className="text-slate-400 text-lg">Loading...</p>
          </div>
        </div>
      }
    >
      <AuthContent />
    </Suspense>
  );
}
