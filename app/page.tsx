"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import devCatalystLogo from "../public/assets/DevCatalyst_logo.png";
import VantaBackground from "./components/VantaBackground";
import DynamicIslandNav from "./components/DynamicIslandNav";

const NAV_SECTIONS = [
  { id: "hero", label: "Home" },
  { id: "about", label: "About" },
  { id: "join", label: "Join Us" },
];

export default function Home() {

  const staggerContainer = {
    initial: {},
    whileInView: {
      transition: {
        staggerChildren: 0.2
      }
    },
    viewport: { once: true, margin: "-100px" }
  };

  return (
    <div className="min-h-screen">
      <DynamicIslandNav sections={NAV_SECTIONS} />

      {/* Hero with media */}
      <section id="hero" className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden text-white">
        {/* Vanta Background */}
        <VantaBackground />
        <motion.div
          className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
        >
          <motion.h1
            className="flex items-center justify-center gap-3 sm:gap-4 text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            <Image
              src={devCatalystLogo}
              alt="DevCatalyst Logo"
              className="h-10 sm:h-14 md:h-16 w-auto"
            />
            <span>DevCatalyst Club</span>
          </motion.h1>
          <motion.h1
            className="text-5xl sm:text-7xl md:text-8xl font-bold text-white mb-6 tracking-tighter"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            Learn. Build. <span className="text-[#3b82f6]">Grow.</span>
          </motion.h1>
          <motion.p
            className="text-lg sm:text-xl text-gray-200 max-w-2xl mx-auto mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            Where developers and creators learn, build, and grow together.
          </motion.p>

        </motion.div>
      </section>

      {/* Video Section */}
      <section id="about" className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 w-full h-full z-0">
          <video
            src="/assets/Induction/DC_Inductn_Intro.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          />
          {/* Glossy overlay layers */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5"></div>
          <div className="absolute inset-0 backdrop-brightness-110 backdrop-saturate-125"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div
            className="bg-black/50 backdrop-blur-md rounded-2xl shadow-[0_0_40px_rgba(244,244,244,0.3),0_0_80px_rgba(244,244,244,0.15)] border border-white/20 p-8 sm:p-12 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            <motion.h2
              className="text-5xl sm:text-5xl font-semibold text-white mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.6, -0.05, 0.01, 0.99] }}
            >
              About DevCatalyst
            </motion.h2>
            <motion.p
              className="text-lg sm:text-1xl text-gray-200 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.6, -0.05, 0.01, 0.99] }}
            >
              DevCatalyst is a vibrant community of developers and creators who learn, build, and grow together.
              We run workshops, hackathons, and collaborative projects across Technical, Social, Content, and
              Outreach tracks — helping you level up your skills, gain hands-on experience, and make a real impact.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* CTA at the bottom */}
      <section id="join" className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Collage.svg Background */}
        <div className="absolute inset-0 w-full h-full z-0">
          <img
            src="/assets/Collage.png"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div
            className="bg-white/10 backdrop-blur-md rounded-2xl shadow-[0_0_40px_rgba(244,244,244,0.3),0_0_80px_rgba(244,244,244,0.15)] border border-white/20 p-8 sm:p-12 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            <motion.h2
              className="text-2xl sm:text-3xl font-semibold text-white mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.6, -0.05, 0.01, 0.99] }}
            >
              Ready to be part of the community?
            </motion.h2>
            <motion.p
              className="text-gray-200 mb-8 max-w-lg mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.6, -0.05, 0.01, 0.99] }}
            >
              Fill out the recruitment form and we&apos;ll get in touch. We can&apos;t wait to meet you.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.6, -0.05, 0.01, 0.99] }}
            >
              <Link
                href="/form"
                className="group relative inline-flex overflow-hidden items-center justify-center gap-2 bg-purple-800 text-white font-semibold px-8 py-4 rounded-md shadow transition-all duration-300 ease-out hover:ring-2 hover:ring-black hover:ring-offset-2"
              >
                <span className="absolute right-0 -mt-12 h-32 w-8 translate-x-12 rotate-12 bg-white opacity-10 transition-all duration-1000 ease-out group-hover:-translate-x-60" />
                <span className="relative z-10 flex items-center gap-2">
                  <Image
                    src={devCatalystLogo}
                    alt="DevCatalyst Logo"
                    className="w-8 h-8 object-contain transition-all duration-300 group-hover:brightness-150 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]"
                  />
                  Join Community
                </span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
