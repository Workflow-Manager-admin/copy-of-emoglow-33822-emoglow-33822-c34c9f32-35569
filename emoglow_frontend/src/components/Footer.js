import React from "react";
// PUBLIC_INTERFACE
export default function Footer() {
  return (
    <footer className="w-full mt-8 py-4 border-t border-slate-800 bg-gradient-to-tr from-slate-900/80 via-zinc-900/70 to-indigo-800/60 text-center text-slate-400 text-sm font-medium select-none">
      <span className="inline-block px-2 align-middle">
        &copy; {new Date().getFullYear()} DevSuite. Crafted with <span className="text-pink-400">♥</span> for pros.
      </span>
      <span className="inline-block px-3">
        <a
          href="https://github.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-cyan-300 transition underline underline-offset-2 ml-1"
        >
          GitHub
        </a>
        <span className="mx-1 opacity-50">|</span>
        <a
          href="https://twitter.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-cyan-400 transition underline underline-offset-2 ml-1"
        >
          Twitter
        </a>
      </span>
    </footer>
  );
}
