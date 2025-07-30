"use client";
import React from "react";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import Testimonials from "../../components/testimonials/Testimonials";
import Faq from "../../components/faq/Faq";
import Benefits from "@/components/benefits/Benefits";
import Cta from "@/components/cta-btn/Cta";
import OrgForm from "@/components/organizerForm/OrgForm";
import HeroForListWithUs from "@/components/hero/HeroForListWithUs";
import HowItWorks from "@/components/how it works/HowItWorks";

const ListWithUs = () => {
  return (
    <>
      <Navigation />
      <main className="bg-slate-950 min-h-screen w-full">
          <HeroForListWithUs />
          <HowItWorks />
          <Benefits />
          <div className="md:py-14 py-10">
            <Cta />
          </div>
          <Testimonials />
          <Faq />
          <OrgForm />
      </main>
      <Footer />
    </>
  );
};

export default ListWithUs;
