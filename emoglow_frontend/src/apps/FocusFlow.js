import React from "react";
import { motion } from "framer-motion";
// PUBLIC_INTERFACE
export default function FocusFlow({ theme }) {
  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.41 }}
      className="w-full px-4 py-12 flex flex-col items-center min-h-[70vh]"
      style={{
        background: theme === "dark"
          ? "linear-gradient(98deg, #23253e 87%, #195158 100%)"
          : "linear-gradient(85deg, #e4ebfa 70%, #cffeef 100%)"
      }}
    >
      <h2 className="font-bold text-2xl md:text-3xl mb-5 text-green-700 dark:text-green-200">
        FocusFlow
      </h2>
      <div className="p-6 rounded-2xl shadow-md bg-white dark:bg-zinc-900/85 w-full max-w-lg">
        <p className="text-base text-zinc-700 dark:text-zinc-200 mb-2">
          Task focus, sprints, workflow & productivity mastery – unify your sessions! (Detailed UI soon)
        </p>
        <span className="text-xs text-neutral-400 font-mono">[Coming soon]</span>
      </div>
    </motion.section>
  );
}
