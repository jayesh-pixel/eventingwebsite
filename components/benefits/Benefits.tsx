import React from "react";
import { features } from "@/utils/constants";
const Benefits = () => {
  return (
    <>
      <div className="md:py-12 py-6 md:px-20 px-6">
        <div className="">
          <p className="capitalize md:text-3xl text-2xl text-center font-bold text-white tracking-wide">
            features
          </p>
        </div>
        <div className="w-20 h-1 mx-auto bg-blue-400 mt-2"></div>
        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-4 sm:gap-10 md:gap-12 text-center mt-6 sm:mt-10">
          {features.map((benefit, index) => (
            <div key={index} className="p-0 sm:p-2">
              <div className="flex flex-col text-center gap-4 sm:gap-6 justify-center items-center bg-slate-900 rounded-xl py-6 px-4 md:px-0">
                <div className="bg-gradient-to-br from-blue-900 to-indigo-700 shadow-lg p-5 rounded-full hover:scale-110 transition-all delay-75">
                  <div className="text-blue-400">{benefit.icon}</div>
                </div>
                <p className="font-bold text-lg sm:text-xl font-poppins text-white">
                  {benefit.heading}
                </p>
                <p className="text-sm font-Atkinson text-slate-300">{benefit.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Benefits;
