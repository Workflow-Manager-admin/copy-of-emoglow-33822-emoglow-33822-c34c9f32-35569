import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// PUBLIC_INTERFACE
/**
 * Home screen for MindMelt AI with animated greeting, gradient background,
 * and prominent button to start mood input. Responsive, beautiful, minimal.
 */
export default function Home() {
  const navigate = useNavigate();

  return (
    <section
      // Removed Tailwind classes, using inline and App.css for layout and backgrounds
      style={{
        minHeight: "calc(100vh - 64px)", // minus navbar height
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 16px",
        position: "relative",
        background: "linear-gradient(135deg,#252850 0%, #232384 100%)",
        transition: "background 1.2s"
      }}
    >
      {/* Centered animated container */}
      <motion.div
        // Equivalent layout with CSS/inline styles
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 32,
          width: '100%'
        }}
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.25,
            },
          },
        }}
      >
        {/* GREETING */}
        <motion.h1
          className="text-2xl md:text-4xl font-bold text-center text-white"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.9, ease: "easeOut" }}
        >
          Hey there, how are you feeling today?
        </motion.h1>

        {/* Description/Subtitle (optional) */}
        <motion.p
          className="description text-base md:text-lg opacity-75 text-center mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.95, duration: 0.8, ease: "easeOut" }}
        >
          Welcome to MindMelt AI, your mood companion. Let's start your journey.
        </motion.p>

        {/* "Get Started" Button */}
        <motion.button
          className="
            btn btn-large
            mt-6
            text-lg md:text-xl font-semibold
            px-8 py-3
            rounded-md
            shadow-lg
            focus:outline-none focus:ring-4 focus:ring-accent/20
            bg-accent
            hover:bg-primary
            transition-all
            select-none
            "
          style={{
            background: "linear-gradient(90deg,#66a6ff 0%, #89f7fe 100%)",
            color: "#fff",
            border: "none",
          }}
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 1.25, duration: 0.8, ease: "easeOut" }}
          onClick={() => navigate("/mindmelt/mood-input")}
          aria-label="Start Mood Input"
        >
          Get Started
        </motion.button>
      </motion.div>
      {/* Position credit/footer (optional) */}
      <div className="absolute bottom-4 left-0 w-full text-center text-xs text-white/60 select-none pointer-events-none">
        MindMelt AI &mdash; Feel better, one moment at a time
      </div>
    </section>
  );
}
