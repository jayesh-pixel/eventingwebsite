"use client";
import React from "react";
import { services } from "@/utils/constants";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { CiCircleCheck } from "react-icons/ci";

type ModalProps = {
  serviceId: number | null;
  setIsServiceModalOpen: (open: boolean) => void;
  setServiceId: (id: number | null) => void;
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
        className="fixed inset-0 z-50 flex justify-center items-center p-4 sm:p-0"
      >
        <div className="relative sm:p-4 w-full max-w-2xl max-h-full">
          <div className="relative bg-white rounded-lg shadow dark:bg-gray-700 text-center p-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-end items-end cursor-pointer ">
              <IoIosCloseCircleOutline
                size={25}
                className="h-8 w-8 sm:h-[25px] sm:w-[25px]"
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
                  <p className="text-lg sm:text-xl">{selectedService.heading}</p>
                  <ul className="mb-6 ">
                    {selectedService.text
                      ?.split(".")
                      ?.filter(Boolean)
                      ?.map((text, index) => (
                        <div className="flex gap-3 sm:gap-4 mb-4 items-center" key={index}>
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
