"use client";
import React, { useState } from "react";
import { services } from "@/utils/constants";
import Modal from "../../components/common/custom modal/Modal";
import { benefits } from "@/utils/constants";
import { BsQuestionCircleFill } from "react-icons/bs";

type ModalProps = {
  serviceId: number | null;
  setIsServiceModalOpen: (open: boolean) => void;
  setServiceId: (id: number | null) => void;
};

const AboutUs = () => {
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [serviceId, setServiceId] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden font-Atkinson">
      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-8 pb-12">
        {isServiceModalOpen && (
          <Modal
            serviceId={serviceId}
            setIsServiceModalOpen={setIsServiceModalOpen}
            setServiceId={setServiceId}
          />
        )}
        {/* Mission Section */}
        <section className="flex flex-col md:flex-row items-center md:gap-14 gap-8 mb-12">
          <div className="flex-1 flex flex-col gap-6 items-center justify-center text-center">
            <h2 className="md:text-4xl text-2xl font-bold text-white tracking-wide font-poppins mb-2">Our Mission</h2>
            <div className="w-20 h-1 mx-auto bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] mb-4"></div>
            <p className="md:text-lg text-slate-300 leading-relaxed">
              Eventing Club is dedicated to revolutionizing the event management industry by providing innovative solutions that simplify the process of organizing and attending events, ensuring memorable experiences for all involved.
            </p>
          </div>
        </section>
        {/* Services Section */}
        <section className="mb-12">
          <h2 className="md:text-4xl text-2xl font-bold text-white text-center font-poppins mb-2">Our Services</h2>
          <div className="w-20 h-1 mx-auto bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] mb-4"></div>
          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8 md:gap-10 mt-8">
            {services.map((service, index) => (
              <div
                onClick={() => {
                  setIsServiceModalOpen(true);
                  setServiceId(service.id);
                }}
                key={index}
                className="bg-gradient-to-br from-blue-900 to-indigo-700 text-white rounded-lg shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2"
              >
                <div className="hover:border-none border rounded-md border-gray-500 h-52 flex flex-col items-center justify-center gap-6">
                  <div>{service.icon}</div>
                  <p className="text-center md:text-lg font-semibold">{service.heading}</p>
                  <div>
                    <BsQuestionCircleFill
                      size={25}
                      onClick={() => {
                        setIsServiceModalOpen(true);
                        setServiceId(service.id);
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
        {/* Benefits Section */}
        <section className="mb-12">
          <h2 className="md:text-4xl text-2xl font-bold text-white text-center font-poppins mb-2">Benefits</h2>
          <div className="w-20 h-1 mx-auto bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] mb-4"></div>
          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8 md:gap-10 text-center mt-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="p-2">
                <div className="flex flex-col text-center gap-6 justify-center items-center">
                  <div className="bg-gradient-to-br from-blue-900 to-indigo-700 shadow-lg p-5 rounded-full hover:scale-110 transition-all delay-75">
                    <div className="text-white">{benefit.icon}</div>
                  </div>
                  <p className="font-bold text-xl text-white">{benefit.heading}</p>
                  <p className="text-sm text-slate-300">{benefit.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        {/* CTA section */}
        {/* <div className="mb-12">
          <Cta />
        </div> */}
      </div>
    </div>
  );
};

export default AboutUs;
