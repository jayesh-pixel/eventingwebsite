import React from 'react';
import { testimonials } from '@/utils/constants';
import Image from 'next/image';
import { IconButton } from '@material-tailwind/react';

const Testimonials = () => {
  return (
    <section className="h-full w-full overflow-hidden py-12 px-6 md:px-20 font-Atkinson">
      {/* Header */}
      <div className="flex flex-col items-center justify-center mb-8">
        <h2 className="text-white text-3xl md:text-4xl font-bold tracking-wide">
          Testimonials
        </h2>
        <div className="w-20 h-1 bg-blue-400 mt-2" />
      </div>

      {/* Carousel */}
      <div className="relative overflow-hidden">
        {/* Custom single-item carousel logic */}
        {(() => {
          const [activeIndex, setActiveIndex] = React.useState(0);
          const total = testimonials.length;
          const handlePrev = () => setActiveIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
          const handleNext = () => setActiveIndex((prev) => (prev === total - 1 ? 0 : prev + 1));
          const item = testimonials[activeIndex];
          return (
            <div className="relative w-full flex flex-col items-center">
              <div className="flex flex-col items-center justify-center text-center w-full min-h-[300px]">
                <p className="text-slate-200 md:text-lg text-sm mb-4">“{item.text}”</p>
                <div className="flex items-center justify-center mb-2">
                  <div className="p-1 bg-blue-400 rounded-full w-14 h-14 shadow-md">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={50}
                      height={50}
                      className="rounded-full border-2 border-white"
                    />
                  </div>
                </div>
                <p className="font-semibold text-blue-400">{item.name}</p>
                <p className="text-sm text-slate-300">{item.post}</p>
              </div>
              <div className="absolute top-1/2 left-4 -translate-y-1/2">
                <IconButton variant="text" size="lg" onClick={handlePrev} className="bg-white/20">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="black" className="h-6 w-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                </IconButton>
              </div>
              <div className="absolute top-1/2 right-4 -translate-y-1/2">
                <IconButton variant="text" size="lg" onClick={handleNext} className="bg-white/20">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="black" className="h-6 w-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </IconButton>
              </div>
            </div>
          );
        })()}
      </div>
    </section>
  );
};

export default Testimonials;