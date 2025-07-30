"use client";
import React from "react";
import { services } from "@/utils/constants";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { CiCircleCheck } from "react-icons/ci";

type ModalProps = {
  serviceId: string | number | null;
  setIsServiceModalOpen: (open: boolean) => void;
  setServiceId: (id: string | number | null) => void;
};

const Modal: React.FC<ModalProps> = ({ serviceId, setIsServiceModalOpen, setServiceId }) => {
  const selectedService = services.find((service) => service.id === serviceId);

  return (
    <div>
      <div
        className="fixed inset-0 bg-black opacity-50 z-40"
        aria-hidden="true"
      ></div>

      <div
        id="static-modal"
        data-modal-backdrop="static"
        tabIndex={-1}
        aria-hidden="true"
        className="fixed inset-0 z-50 flex justify-center items-center"
      >
        <div className="relative p-4 w-full max-w-2xl">
          <div className="relative bg-white rounded-lg shadow dark:bg-gray-700 text-center p-4">
            <div className="flex justify-end items-end cursor-pointer ">
              <IoIosCloseCircleOutline
                size={25}
                onClick={() => {
                  setIsServiceModalOpen(false);
                  setServiceId(null);
                }}
              />
            </div>
            <div className="flex flex-col justify-center items-center gap-6">
              {selectedService ? (
                <>
                  <div>{selectedService.icon}</div>
                  <p className="text-xl">{selectedService.heading}</p>
                  <ul className="mb-6 ">
                    {selectedService.text
                      ?.split(".")
                      ?.filter(Boolean)
                      ?.map((text, index) => (
                        <div className="flex gap-4 mb-4 items-center" key={index}>
                          <CiCircleCheck size={20} className="flex-shrink-0" />
                          <li className="text-left">{text}</li>
                        </div>
                      ))}
                  </ul>
                </>
              ) : (
                <p className="text-xl text-red-500">Service not found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
