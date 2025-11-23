"use client";
import React from "react";
import Testimonials from "../../components/testimonials/Testimonials";
import Faq from "../../components/faq/Faq";
import Benefits from "@/components/benefits/Benefits";
import Cta from "@/components/cta-btn/Cta";
import OrgForm from "@/components/organizerForm/OrgForm";
import HeroForListWithUs from "@/components/hero/HeroForListWithUs";
import HowItWorks from "@/components/how it works/HowItWorks";

const ListWithUs = () => {
  return (
    <div className="space-y-8 pb-10">
      <HeroForListWithUs />
      <HowItWorks />
      <Benefits />
      <div className="py-8">
        <Cta />
      </div>
      <Testimonials />
      <Faq />
      <OrgForm />
    </div>
  );
};

export default ListWithUs;
