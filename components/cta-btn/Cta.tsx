import React from "react";

const Cta = () => {
  return (
    <>
      <div className=" flex items-center justify-center font-Atkinson px-4 sm:px-6 md:px-0">
        <div
          className="py-8 sm:py-10 px-6 flex md:flex-row gap-4 md:gap-0 flex-col justify-between items-center w-full md:w-auto bg-slate-900 rounded-xl"
          style={{
            boxShadow: "rgba(0, 0, 0, 0.18) 0px 4px 12px",
          }}
        >
          <p className="font-bold md:text-xl md:w-[80%] w-full text-slate-200 text-center md:text-left">
            Join Eventing Club today and experience the difference in event
            management and ticketing.
          </p>
          <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-md transition hover:from-blue-700 hover:to-indigo-700">
            <a href="#form">Join now</a>
          </button>
        </div>
      </div>
    </>
  );
};

export default Cta;
