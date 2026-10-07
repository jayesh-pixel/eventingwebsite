"use client";

import type { ReactNode } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { COMPANY_LEGAL_NAME } from "@/utils/constants";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <AccordionItem value={title} className="rounded-lg border border-slate-800 bg-slate-900/60 px-4">
      <AccordionTrigger className="text-left font-poppins text-base sm:text-lg font-semibold text-white hover:no-underline">
        {title}
      </AccordionTrigger>
      <AccordionContent className="space-y-3 text-sm sm:text-base text-slate-300">
        {children}
      </AccordionContent>
    </AccordionItem>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="list-disc pl-5 space-y-1.5 marker:text-[#00E1FC]">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-Atkinson">
      <div className="max-w-3xl mx-auto px-4 md:px-8 pt-8 pb-16 text-sm sm:text-base leading-relaxed">
        <h1 className="font-poppins text-2xl sm:text-4xl font-bold text-white">Terms &amp; Conditions</h1>
        <div className="w-16 h-1 bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] mt-3 mb-6"></div>

        <p>
          Welcome to {COMPANY_LEGAL_NAME}! These Terms and Conditions (&quot;Terms&quot;) govern your
          use of our website, mobile application, and services (collectively, &quot;Services&quot;).
          By accessing or using our Services, you agree to these Terms. If you do not agree, please
          do not use our Services.
        </p>

        <Accordion type="single" collapsible className="mt-8 space-y-3">
          <Section title="Ticket Purchases and Refunds">
            <h3 className="font-semibold text-white">Purchases</h3>
            <List
              items={[
                "All ticket purchases are subject to availability and event organizer terms.",
                "Prices include applicable taxes and fees unless otherwise stated.",
                "Additional convenience fees may apply and are non-refundable.",
              ]}
            />
            <h3 className="font-semibold text-white pt-2">Refunds and Cancellations</h3>
            <List
              items={[
                "Refunds are processed as per the event organizer’s refund policy.",
                `${COMPANY_LEGAL_NAME} is not liable for event cancellations, postponements, or venue changes. In such cases, you should contact the event organizer for assistance.`,
                "Refunds for eligible cancellations will be processed within 7-10 working days. Convenience fees are non-refundable.",
              ]}
            />
          </Section>

          <Section title="User Conduct">
            <p>You agree not to:</p>
            <List
              items={[
                "Use the Services for unlawful or unauthorized purposes.",
                "Disrupt or interfere with the security or functionality of the Services.",
                "Post or transmit any harmful, offensive, or infringing content.",
                "Use bots or automated systems to purchase tickets or bypass ticket limits.",
              ]}
            />
            <p>We reserve the right to suspend or terminate your account for violations of these Terms.</p>
          </Section>

          <Section title="Liability Disclaimer">
            <p>
              {COMPANY_LEGAL_NAME} provides Services &quot;as is&quot; and makes no warranties,
              express or implied. We are not liable for:
            </p>
            <List
              items={[
                "Event cancellations, postponements, or venue changes.",
                "Losses arising from unauthorized access to your account.",
                "Damages caused by third-party services linked to our platform.",
                "Circumstances beyond our control, including natural disasters, strikes, or other force majeure events.",
              ]}
            />
          </Section>

          <Section title="Contact Us">
            <p>If you have any questions or concerns about these Terms, please contact us at:</p>
            <p>
              Email:{" "}
              <a href="mailto:hello@eventingclub.in" className="text-[#00E1FC] hover:underline">
                hello@eventingclub.in
              </a>
              <br />
              Phone:{" "}
              <a href="tel:+919730589111" className="text-[#00E1FC] hover:underline">
                +91 - 9730589111
              </a>
              <br />
              Address: {COMPANY_LEGAL_NAME}, 334/4, Neelkamal Building, Nazarana Compound, Bhiwandi,
              Maharashtra 421308
            </p>
          </Section>
        </Accordion>

        <p className="mt-8 text-white">
          Thank you for choosing {COMPANY_LEGAL_NAME}. We hope you enjoy our Services!
        </p>
      </div>
    </div>
  );
}
