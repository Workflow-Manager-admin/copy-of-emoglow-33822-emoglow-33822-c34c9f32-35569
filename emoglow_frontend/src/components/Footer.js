import React from "react";
// PUBLIC_INTERFACE
export default function Footer() {
  return (
    <footer
      className="w-full mt-10 py-4 px-4 border-t border-slate-200/20 dark:border-slate-800/60
                 bg-gradient-to-br from-white/70 via-blue-50/80 to-cyan-50/50 dark:from-slate-900/90 dark:via-zinc-900/80 dark:to-blue-950/80 
                 text-center text-slate-500 dark:text-slate-400 text-sm font-medium select-none
                 backdrop-blur-[8px] shadow-none transition">
      <span className="inline-block px-2 align-middle spacious font-semibold tracking-wide">
        &copy; {new Date().getFullYear()} <span className="text-cyan-500 font-bold">DevSuite</span>.
        Crafted with <span className="text-orange-400">♥</span> for makers.
      </span>
      <span className="inline-block px-3">
        <a
          href="https://github.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-cyan-500 hover:underline underline-offset-4 transition-all ml-1"
        >
          GitHub
        </a>
        <span className="mx-2 opacity-40">|</span>
        <a
          href="https://twitter.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-orange-400 hover:underline underline-offset-4 transition-all ml-1"
        >
          Twitter
        </a>
      </span>
    </footer>
  );
}
