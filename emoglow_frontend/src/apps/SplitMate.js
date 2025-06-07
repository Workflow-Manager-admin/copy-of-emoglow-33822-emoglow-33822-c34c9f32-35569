import React from "react";
import { motion } from "framer-motion";
// PUBLIC_INTERFACE
export default function SplitMate({ theme }) {
  return (
    <motion.section
      initial={{ opacity: 0, x: -45 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.39 }}
      className="w-full px-4 py-12 flex flex-col items-center min-h-[70vh]"
      style={{
        background: theme === "dark"
          ? "linear-gradient(109deg, #1a3837 89%, #332b12 100%)"
          : "linear-gradient(85deg, #f3fff6 60%, #e1edf8 100%)"
      }}
    >
      <h2 className="font-bold text-2xl md:text-3xl mb-5 text-indigo-600 dark:text-indigo-300">
        SplitMate
      </h2>
      <div className="p-6 rounded-2xl shadow-md bg-white dark:bg-zinc-900/80 w-full max-w-lg">
        <p className="text-base text-zinc-700 dark:text-zinc-200 mb-2">
          Bill splitting & group IOU made effortless. Track, visualize, export, and share. UI improvements coming soon.
        </p>
        <span className="text-xs text-neutral-400 font-mono">[Sub-app UI placeholder]</span>
      </div>
    </motion.section>
  );
}
