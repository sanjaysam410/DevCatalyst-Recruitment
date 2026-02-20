"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DynamicIslandNavProps {
    sections: { id: string; label: string }[];
}

export default function DynamicIslandNav({ sections }: DynamicIslandNavProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    // Show nav after a short delay on mount
    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 800);
        return () => clearTimeout(timer);
    }, []);

    // Track active section via IntersectionObserver
    useEffect(() => {
        const observers: IntersectionObserver[] = [];

        sections.forEach((section, index) => {
            const el = document.getElementById(section.id);
            if (!el) return;

            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        setActiveIndex(index);
                    }
                },
                { threshold: 0.5 }
            );

            observer.observe(el);
            observers.push(observer);
        });

        return () => observers.forEach((obs) => obs.disconnect());
    }, [sections]);

    const scrollTo = useCallback((id: string) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: "smooth" });
        }
    }, []);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.nav
                    className="fixed top-6 left-1/2 z-50 -translate-x-1/2"
                    initial={{ opacity: 0, y: -30, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -30, scale: 0.8 }}
                    transition={{ duration: 0.5, ease: [0.6, -0.05, 0.01, 0.99] }}
                >
                    <motion.div
                        className="relative flex items-center gap-2 px-4 py-3 rounded-full bg-black/40 backdrop-blur-xl border border-white/15 shadow-[0_0_30px_rgba(255,255,255,0.15),0_0_60px_rgba(255,255,255,0.08),0_4px_20px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)]"
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        animate={{
                            paddingLeft: isHovered ? 20 : 16,
                            paddingRight: isHovered ? 20 : 16,
                        }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                        {/* Glossy top shine */}
                        <div className="absolute inset-x-4 top-[1px] h-[40%] rounded-full bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />

                        {sections.map((section, index) => (
                            <motion.button
                                key={section.id}
                                onClick={() => scrollTo(section.id)}
                                className="relative z-10 px-6 py-2.5 rounded-full text-base font-bold transition-colors duration-200 cursor-pointer"
                                animate={{
                                    color: activeIndex === index ? "#ffffff" : "rgba(255,255,255,0.5)",
                                    paddingLeft: isHovered ? 26 : 24,
                                    paddingRight: isHovered ? 26 : 24,
                                }}
                                whileHover={{ color: "#ffffff" }}
                                transition={{ duration: 0.2 }}
                            >
                                {/* Active indicator pill behind text */}
                                {activeIndex === index && (
                                    <motion.div
                                        className="absolute inset-0 rounded-full bg-white/15 border border-white/10"
                                        layoutId="activeSection"
                                        transition={{
                                            type: "spring",
                                            stiffness: 400,
                                            damping: 30,
                                        }}
                                    />
                                )}
                                <span className="relative z-10">{section.label}</span>
                            </motion.button>
                        ))}
                    </motion.div>
                </motion.nav>
            )}
        </AnimatePresence>
    );
}
