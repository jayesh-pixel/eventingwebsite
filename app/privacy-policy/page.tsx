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

function List({ items }: { items: ReactNode[] }) {
  return (
    <ul className="list-disc pl-5 space-y-1.5 marker:text-[#00E1FC]">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

const Label = ({ children }: { children: ReactNode }) => (
  <span className="font-semibold text-white">{children}</span>
);

const EmailLink = () => (
  <a href="mailto:hello@eventingclub.in" className="text-[#00E1FC] hover:underline">
    hello@eventingclub.in
  </a>
);

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-Atkinson">
      <div className="max-w-3xl mx-auto px-4 md:px-8 pt-8 pb-16 text-sm sm:text-base leading-relaxed">
        <h1 className="font-poppins text-2xl sm:text-4xl font-bold text-white">Privacy Policy</h1>
        <div className="w-16 h-1 bg-gradient-to-r from-[#00E1FC] to-[#0F33D1] mt-3 mb-6"></div>

        <p className="font-semibold text-white">Effective and last updated on Dec 12, 2024</p>
        <p className="mt-3">
          {COMPANY_LEGAL_NAME} (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to
          protecting your privacy. This Privacy Policy outlines how we collect, use, disclose, and
          safeguard your information when you visit our website, mobile application, or engage with
          our services. By using our services, you agree to the terms outlined in this Privacy Policy.
        </p>

        <Accordion type="single" collapsible className="mt-8 space-y-3">
          <Section title="Information We Collect">
            <p>We may collect the following personal information when you interact with our platform:</p>
            <List
              items={[
                "Name",
                "Email address",
                "Phone number",
                "Billing address",
                "Payment information (processed securely through third-party payment gateways)",
                "Government-issued identification for specific events (where required)",
              ]}
            />
            <p>We may also collect non-personal information such as:</p>
            <List
              items={[
                "Browser type and version",
                "Device type and operating system",
                "IP address",
                "Pages viewed and time spent on the site",
              ]}
            />
          </Section>

          <Section title="How We Collect Information">
            <List
              items={[
                <>
                  <Label>Directly from you:</Label> When you register, purchase tickets, or interact
                  with our customer support.
                </>,
                <>
                  <Label>Automatically:</Label> Through cookies, log files, and other tracking
                  technologies.
                </>,
                <>
                  <Label>Third-party integrations:</Label> If you use social login features (e.g.,
                  Google or Facebook).
                </>,
              ]}
            />
          </Section>

          <Section title="How We Use Your Information">
            <p>We use your information to:</p>
            <List
              items={[
                "Process your ticket bookings and deliver related services.",
                "Send confirmation emails, event updates, and promotional offers.",
                "Improve user experience through analytics and feedback.",
                "Detect and prevent fraudulent activities.",
                "Comply with legal obligations and resolve disputes.",
              ]}
            />
          </Section>

          <Section title="Cookies">
            <p>We use cookies and similar technologies to:</p>
            <List
              items={[
                "Recognize your preferences and provide a personalized experience.",
                "Analyze website traffic and improve our platform.",
                "Serve targeted advertisements.",
              ]}
            />
            <p>
              You can control cookies through your browser settings. However, disabling cookies may
              limit certain functionalities of our platform.
            </p>
          </Section>

          <Section title="Sharing Your Information">
            <p>
              We do not sell your personal information. However, we may share your data in the
              following circumstances:
            </p>
            <List
              items={[
                <>
                  <Label>With event organizers:</Label> To facilitate your ticket purchase and event
                  access.
                </>,
                <>
                  <Label>With service providers:</Label> Such as payment gateways, email marketing
                  platforms, and IT support.
                </>,
                <>
                  <Label>With legal authorities:</Label> When required to comply with laws or protect
                  our legal rights.
                </>,
                <>
                  <Label>With advertisers:</Label> For non-identifiable behavioral data to deliver
                  targeted ads.
                </>,
              ]}
            />
          </Section>

          <Section title="Data Retention">
            <p>
              We retain your information for as long as necessary to fulfill the purposes outlined in
              this policy or as required by law. If you request account deletion, your account and
              data will be permanently removed, except for information retained to comply with legal
              obligations (e.g., transaction records).
            </p>
          </Section>

          <Section title="Your Rights">
            <p>You have the right to:</p>
            <List
              items={[
                "Access and update your personal information.",
                <>Opt-out of promotional emails by clicking the &quot;unsubscribe&quot; link.</>,
                <>
                  Request account deletion by contacting us at <EmailLink />
                </>,
              ]}
            />
          </Section>

          <Section title="Data Security">
            <p>We implement robust security measures to protect your information, including:</p>
            <List
              items={[
                "Encryption of sensitive data during transmission.",
                "Secure servers and firewalls.",
                "Regular audits and security updates.",
              ]}
            />
            <p>
              However, no method of transmission or storage is 100% secure. Please notify us
              immediately if you suspect unauthorized access to your account.
            </p>
          </Section>

          <Section title="Third-Party Links">
            <p>
              Our platform may contain links to third-party websites. We are not responsible for the
              privacy practices or content of these external sites. Please review their privacy
              policies before sharing your data.
            </p>
          </Section>

          <Section title="Advertising">
            <p>
              We may display advertisements through third-party ad networks. These networks may use
              non-identifiable information about your visits to serve targeted ads. You can opt-out of
              interest-based ads via your browser or device settings.
            </p>
          </Section>

          <Section title="Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. Changes will be posted on this
              page, and your continued use of our services constitutes acceptance of these updates.
            </p>
          </Section>

          <Section title="Contact Us">
            <p>If you have any questions or concerns about this Privacy Policy, please contact us at:</p>
            <p>
              Email: <EmailLink />
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
          Thank you for trusting {COMPANY_LEGAL_NAME}. We value your privacy and are committed to
          ensuring your data is secure.
        </p>
      </div>
    </div>
  );
}
