"use client";

import Image from "next/image";
import Link from "next/link";
import { Noto_Serif } from "next/font/google";
import Header from "./components/Header";

const notoSerif = Noto_Serif({ subsets: ["latin"], weight: ["400", "700"] });

export default function Home() {
  return (
    <main
      className={`min-h-screen bg-[#fdfaf6] text-[#3b3a36] ${notoSerif.className}`}
    >
      
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center h-[100vh] text-center px-6 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="/background.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-[#ece5da]/80 to-[#fdfaf6]/95 backdrop-blur-sm z-0" />

        {/* Main Content */}
        <div className="relative z-10 max-w-3xl animate-fadeInUp duration-1000 ease-out">
          <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
            Ενδοκρινολογία & Ορμονική Ευεξία
          </h1>
          <p className="text-lg md:text-xl text-[#3b3a36] mb-10">
            Επιστημονική γνώση και ανθρώπινη προσέγγιση για την υγεία σας. 
            Θυρεοειδής, ορμόνες, μεταβολισμός — με φροντίδα.
          </p>
          <Link
            href="/contact"
            className="inline-block text-[#3b3a36] border border-[#3b3a36] px-6 py-2 rounded-full hover:bg-[#3b3a36] hover:text-white transition"
          >
            Κλείστε Ραντεβού
          </Link>
        </div>

        {/* Scroll Down Indicator */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center animate-bounce text-[#8c7c68]">
          <span className="text-sm tracking-wide mb-1">Scroll</span>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-[#d8d2c8] to-transparent " />

      <section className="py-20 px-6 bg-[#faf7f3]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-4 text-center md:text-left">
            <h2 className="text-4xl font-semibold">Η Ιατρός</h2>
            <p className="text-lg text-[#4a4944]">
              Η Δρ. Κόλλια ειδικεύεται στην ενδοκρινολογία με έμφαση στον θυρεοειδή και τον μεταβολισμό. Συνδυάζει την ιατρική ακρίβεια με προσωπική φροντίδα.
            </p>
            <Link
              href="/about"
              className="inline-block text-[#3b3a36] border border-[#3b3a36] px-5 py-2 rounded-full hover:bg-[#3b3a36] hover:text-white transition"
            >
              Δείτε Περισσότερα
            </Link>
          </div>
          <div className="rounded-3xl overflow-hidden shadow-xl">
            <Image
              src="/doctor.jpg"
              alt="Dr. Maria Kalogeropoulou"
              width={600}
              height={500}
              className="object-cover w-full h-full hover:scale-105 transition-transform duration-700"
            />
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-[#f2eee8]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="rounded-3xl overflow-hidden shadow-xl">
            <Image
              src="/clinic-interior.jpg"
              alt="Clinic Interior"
              width={600}
              height={500}
              className="object-cover w-full h-full hover:scale-105 transition-transform duration-700"
            />
          </div>
          <div className="space-y-4 text-center md:text-left">
            <h2 className="text-4xl font-semibold">Το Ιατρείο</h2>
            <p className="text-lg text-[#4a4944]">
              Ένας φιλόξενος και κομψός χώρος για την υγειονομική φροντίδα σας.
            </p>
            <Link
              href="/iatreio"
              className="inline-block text-[#3b3a36] border border-[#3b3a36] px-5 py-2 rounded-full hover:bg-[#3b3a36] hover:text-white transition"
            >
              Δείτε Περισσότερα
            </Link>
          </div>
        </div>
      </section>

      <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-[#d8d2c8] to-transparent " />

      <section className="py-20 px-6 bg-[#faf7f3]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-6">Ώρες Λειτουργίας Ιατρείου</h2>
          <div className="text-lg text-[#4a4944] leading-relaxed">
            <p>Δευτέρα - Παρασκευή: 09:00 - 14:00 & 17:00 - 20:00</p>
            <p>Σάββατο & Κυριακή: Κλειστά</p>
            <p className="mt-4 text-sm italic">*Κατόπιν ραντεβού</p>
          </div>
        </div>
      </section>

      <section
        id="contact"
        className="relative py-24 px-6 bg-[#3b3a36] text-white text-center overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10">
          <Image src="/cta.jpg" alt="cta image" fill className="object-cover" />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold mb-4">Κλείστε Ραντεβού</h2>
          <p className="text-lg mb-8">
            Κάντε το πρώτο βήμα προς την ισορροπία. Επικοινωνήστε σήμερα.
          </p>
          <Link
            href="/contact"
            className="inline-block text-white border border-white px-6 py-3 rounded-full hover:bg-white hover:text-[#3b3a36] transition"
          >
            Επικοινωνία
          </Link>
        </div>
      </section>
    </main>
  );
}
