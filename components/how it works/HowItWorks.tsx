"use client";
import React from "react";
import Image from "next/image";

const HowItWorks = () => {
  return (
    <div className="md:py-12 py-6 md:px-20 px-6 font-Atkinson">
      <div>
        <div className="md:grid grid-cols-2 md:gap-y-6 h-full w-full md:px-6 flex flex-col gap-10 ">
          {/* text  */}
          <div className="">
            <div className="flex flex-col gap-4 justify-center w-full h-full">
              <p className="text-slate-200 text-sm ">01</p>
              <h2 className="font-bold md:text-4xl text-xl capitalize font-poppins text-white">
                Register as an Organizer
              </h2>
              <p className="text-slate-300 text-sm leading-7 font-semibold">
                Sign up and provide essential details about your event and
                organization. Access a powerful dashboard and ticketing tools
                with ease.
              </p>
            </div>
          </div>

          {/* image */}
          <div className="w-full h-full flex justify-center">
            <Image src={"/Signup.jpg"} height={260} width={260} alt="Signup" />
          </div>

          {/* image */}
          <div className="w-full h-full flex justify-center">
            <Image src={"/create-event.jpg"} height={260} width={260} alt="Create Event" />
          </div>

          {/* text  */}
          <div className="">
            <div className="flex flex-col gap-4 justify-center w-full h-full">
              <p className="text-slate-200 text-sm">02</p>
              <h2 className="font-bold md:text-4xl text-xl font-poppins capitalize text-white">
                Create Your Event Listing
              </h2>
              <p className="text-slate-300 text-sm leading-7 font-semibold">
                Add all relevant details such as location, date, ticket
                categories, pricing, and any specific requirements. Our team is
                available to assist you at every step.
              </p>
            </div>
          </div>

          {/* text  */}
          <div className="">
            <div className="flex flex-col gap-4 justify-center w-full h-full">
              <p className="text-slate-200 text-sm">03</p>
              <h2 className="font-bold md:text-4xl text-xl capitalize font-poppins text-white">
                Promote & Sell Tickets Online and Offline
              </h2>
              <p className="text-slate-300 text-sm leading-7 font-semibold">
                Our platform supports both online bookings and an offline portal
                tailored for promoters. Even with exclusive online partnerships,
                our offline solution is flexible, efficient, and cost-effective.
              </p>
            </div>
          </div>

          {/* image */}
          <div className="w-full h-full flex justify-center">
            <Image src={"/promote.jpg"} height={260} width={260} alt="Promote" />
          </div>

          {/* image */}
          <div className="w-full h-full flex justify-center">
            <Image src={"/analytics.jpg"} height={260} width={260} alt="Analytics" />
          </div>

          {/* text  */}
          <div className="">
            <div className="flex flex-col gap-4 justify-center w-full h-full">
              <p className="text-slate-200 text-sm">04</p>
              <h2 className="font-bold md:text-4xl text-xl capitalize font-poppins text-white">
                Manage Check-Ins with Real-Time Tracking
              </h2>
              <p className="text-slate-300 text-sm leading-7 font-semibold">
                Utilize our inbuilt scanner app for hassle-free, one-step ticket
                scanning and real-time tracking. No expertise required—just scan
                and track!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
