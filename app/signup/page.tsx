"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

const Signup = () => {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: mobile, 2: otp, 3: details
  const [loading, setLoading] = useState(false);
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const inputs = React.useRef<(HTMLInputElement | null)[]>([]);

  // Step 1: Mobile number submit
  const handleMobileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.dismiss();
    if (!mobile || mobile.length !== 10) {
      return toast.error("Please enter a valid 10-digit mobile number");
    }
    setLoading(true);
    // Simulate OTP send
    setTimeout(() => {
      setLoading(false);
      toast.success("OTP sent to your mobile number");
      setStep(2);
    }, 1000);
  };

  // Step 2: OTP verify
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const val = e.target.value;
    if (/^[0-9]?$/.test(val)) {
      const newOtp = [...otp];
      newOtp[idx] = val;
      setOtp(newOtp);
      if (val && idx < otp.length - 1) {
        inputs.current[idx + 1]?.focus();
      } else if (!val && idx > 0) {
        inputs.current[idx - 1]?.focus();
      }
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.dismiss();
    const stringOtp = otp.join("");
    if (stringOtp.length !== 6) {
      return toast.error("Please enter a valid 6-digit OTP");
    }
    setLoading(true);
    // Simulate OTP verification
    setTimeout(() => {
      setLoading(false);
      toast.success("OTP verified!");
      setStep(3);
    }, 1000);
  };

  // Step 3: Details submit
  const handleForm = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.dismiss();
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      return toast.error("Please fill all fields");
    }
    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match");
    }
    setLoading(true);
    // Simulate signup API call
    setTimeout(() => {
      setLoading(false);
      toast.success("Signup successful!");
      router.push("/");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-blue-900 to-black">
      <Toaster />
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-xl shadow-lg p-8 flex flex-col items-center">
        <Image src="/placeholder-user.jpg" alt="Signup" width={80} height={80} className="rounded-full mb-4 border-4 border-blue-400" />
        <h2 className="text-3xl font-bold text-white mb-2 tracking-wide">Create Account</h2>
        <p className="text-blue-200 mb-6 text-center">Join the Eventing Club and never miss an event!</p>

        {/* Step 1: Mobile number */}
        {step === 1 && (
          <form className="w-full flex flex-col gap-4" onSubmit={handleMobileSubmit}>
            <input
              type="text"
              name="mobile"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="Mobile Number"
              className="px-4 py-2 rounded-md bg-white/20 text-white placeholder:text-blue-200 border border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 mt-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white font-semibold text-lg shadow-md transition duration-200"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        )}

        {/* Step 2: OTP */}
        {step === 2 && (
          <form className="w-full flex flex-col gap-4" onSubmit={handleOtpSubmit}>
            <div className="flex gap-2 justify-center mb-2">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  type="text"
                  value={digit}
                  onChange={(e) => handleOtpChange(e, idx)}
                  maxLength={1}
                  ref={(el) => (inputs.current[idx] = el)}
                  className="w-10 h-12 text-center text-lg rounded-md border border-blue-400 bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="0"
                />
              ))}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 mt-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white font-semibold text-lg shadow-md transition duration-200"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
            <p className="mt-2 text-blue-200 text-sm text-center">
              Didn't receive OTP? <span className="underline cursor-pointer text-blue-400" onClick={() => { setOtp(["", "", "", "", "", ""]); setStep(1); }}>Resend</span>
            </p>
          </form>
        )}

        {/* Step 3: Details */}
        {step === 3 && (
          <form className="w-full flex flex-col gap-4" onSubmit={handleSignup}>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleForm}
              placeholder="Full Name"
              className="px-4 py-2 rounded-md bg-white/20 text-white placeholder:text-blue-200 border border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleForm}
              placeholder="Email Address"
              className="px-4 py-2 rounded-md bg-white/20 text-white placeholder:text-blue-200 border border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleForm}
              placeholder="Password"
              className="px-4 py-2 rounded-md bg-white/20 text-white placeholder:text-blue-200 border border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleForm}
              placeholder="Confirm Password"
              className="px-4 py-2 rounded-md bg-white/20 text-white placeholder:text-blue-200 border border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 mt-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white font-semibold text-lg shadow-md transition duration-200"
            >
              {loading ? "Signing up..." : "Sign Up"}
            </button>
          </form>
        )}

        <p className="mt-6 text-blue-200 text-sm">
          Already have an account? <span className="underline cursor-pointer text-blue-400" onClick={() => router.push("/login")}>Login</span>
        </p>
      </div>
    </div>
  );
};

export default Signup;
