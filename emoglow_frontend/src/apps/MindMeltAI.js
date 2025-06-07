import React from "react";
import { motion } from "framer-motion";
// PUBLIC_INTERFACE
export default function MindMeltAI({ theme }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.48 }}
      className="w-full px-4 py-12 flex flex-col items-center min-h-[70vh]"
      style={{
        background: theme === "dark"
          ? "linear-gradient(110deg, #181933 70%, #202020 100%)"
          : "linear-gradient(99deg, #e3f2fd 80%, #ffe7bc 100%)"
      }}
    >
      <h2 className="font-bold text-2xl md:text-3xl mb-5 text-cyan-600 dark:text-cyan-300">
        MindMelt AI
      </h2>
      <div className="p-6 rounded-2xl shadow-md bg-white dark:bg-zinc-900/75 w-full max-w-lg">
        <p className="text-base text-slate-700 dark:text-slate-100 mb-2">
          Emotionally intelligent mood companion. Guides mood check-ins, offers personalized quotes, visualizes mood trends, and more.
        </p>
        <span className="text-xs text-neutral-400 font-mono">[Core UI coming soon]</span>
      </div>
    </motion.section>
  );
}
