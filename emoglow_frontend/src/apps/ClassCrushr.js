import React from "react";
import { motion } from "framer-motion";
// PUBLIC_INTERFACE
export default function ClassCrushr({ theme }) {
  return (
    <motion.section
      initial={{ opacity: 0, x: 45 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full px-4 py-12 flex flex-col items-center min-h-[70vh]"
      style={{
        background: theme === "dark"
          ? "linear-gradient(99deg, #28275a 70%, #362807 100%)"
          : "linear-gradient(92deg, #f2f6fa 80%, #ffe4e4 100%)"
      }}
    >
      <h2 className="font-bold text-2xl md:text-3xl mb-5 text-orange-600 dark:text-orange-300">
        ClassCrushr
      </h2>
      <div className="p-6 rounded-2xl shadow-md bg-white dark:bg-zinc-900/70 w-full max-w-lg">
        <p className="text-base text-zinc-700 dark:text-zinc-100 mb-2">
          Your study/schedule optimizer companion. Find, crush, and schedule classes efficiently. Sub-app UI to follow!
        </p>
        <span className="text-xs text-neutral-400 font-mono">[Detailed UI coming soon]</span>
      </div>
    </motion.section>
  );
}
