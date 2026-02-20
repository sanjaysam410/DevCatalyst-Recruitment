"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import devCatalystLogo from "../public/assets/DevCatalyst_logo.png";
import VantaBackground from "./components/VantaBackground";

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
      {/* Hero with media */}
      <section className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden text-white">
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

      {/* Description sections */}
      <section className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden py-16">
        {/* Video Background moved here */}
        <div className="absolute inset-0 w-full h-full z-0">
          <video
            src="/assets/Induction/DC_Inductn_Intro.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
          <motion.h2
            className="text-3xl font-semibold text-white mb-8 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            About DevCatalyst
          </motion.h2>

          <motion.div
            className="space-y-12"
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div
              className="bg-white rounded-xl border border-gray-200 border-t-4 border-t-[#673ab7] shadow-sm p-6 sm:p-8"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-xl font-medium text-[#673ab7] mb-3">What we do</h3>
              <p className="text-[#5f6368] leading-relaxed">
                DevCatalyst is a community of passionate developers and creators. We run workshops,
                hackathons, and projects to help you level up your skills, collaborate with peers,
                and build things that matter.
              </p>
            </motion.div>

            <motion.div
              className="bg-white rounded-xl border border-gray-200 border-t-4 border-t-[#673ab7] shadow-sm p-6 sm:p-8"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-xl font-medium text-[#673ab7] mb-3">Who it&apos;s for</h3>
              <p className="text-[#5f6368] leading-relaxed">
                Whether you&apos;re into coding, design, content, or outreach — there&apos;s a place for you.
                We have tracks for Technical, Social, Content, and Outreach. Join to learn, contribute,
                and be part of something bigger.
              </p>
            </motion.div>

            <motion.div
              className="bg-white rounded-xl border border-gray-200 border-t-4 border-t-[#673ab7] shadow-sm p-6 sm:p-8"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-xl font-medium text-[#673ab7] mb-3">Why join</h3>
              <p className="text-[#5f6368] leading-relaxed">
                Get hands-on experience, mentorship, and a network of like-minded people. We focus on
                real projects and events so you can grow while having fun and making an impact.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA at the bottom */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 pb-24">
        <motion.div
          className="bg-white rounded-2xl shadow-sm border border-gray-200 border-t-4 border-t-[#673ab7] p-8 sm:p-12 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }}
        >
          <motion.h2
            className="text-2xl sm:text-3xl font-semibold text-[#202124] mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            Ready to be part of the community?
          </motion.h2>
          <motion.p
            className="text-[#5f6368] mb-8 max-w-lg mx-auto"
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
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href="/form"
              className="inline-block bg-[#673ab7] text-white font-semibold px-8 py-4 rounded-lg shadow-md hover:bg-[#5e35b1] transition-colors"
            >
              Join Community
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
