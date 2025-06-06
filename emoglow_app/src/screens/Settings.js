import React, { useState, useRef } from "react";
import { useTheme } from "../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

/**
 * MindMelt AI Settings page:
 * - Functional theme toggle (global/context)
 * - Daily 9AM reminder toggle (stub, with feedback)
 * - "Clear/Reset Data" button (clears MindMelt LocalStorage, animated)
 * - Dummy email verification (input with regex + simulated feedback)
 * - Responsive, accessible, consistent with theming
 */
// Helper: find "mindmelt-" localStorage keys and remove
function clearMindMeltData() {
  let removed = [];
  Object.keys(localStorage)
    .filter((key) => key.startsWith("mindmelt-"))
    .forEach((key) => {
      localStorage.removeItem(key);
      removed.push(key);
    });
  return removed.length;
}

const EMAIL_REGEX =
  /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

// PUBLIC_INTERFACE
export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const [reminderOn, setReminderOn] = useState(
    localStorage.getItem("mindmelt-reminder-enabled") === "true"
  );
  const [reminderFeedback, setReminderFeedback] = useState("");
  const [isClearing, setIsClearing] = useState(false);
  const [clearSuccess, setClearSuccess] = useState(false);
  const [email, setEmail] = useState(
    localStorage.getItem("mindmelt-email") || ""
  );
  const [emailStatus, setEmailStatus] = useState(""); // "success" | "fail" | ""
  const [emailMsg, setEmailMsg] = useState("");
  const emailInputRef = useRef();

  // Toggle reminder stub: just store in localStorage, give visual feedback
  function handleReminderToggle() {
    const next = !reminderOn;
    setReminderOn(next);
    localStorage.setItem("mindmelt-reminder-enabled", next);
    setReminderFeedback(
      next
        ? "Reminder enabled! (You'll get a prompt at 9AM — demo only)"
        : "Reminder disabled."
    );
    setTimeout(() => {
      setReminderFeedback("");
    }, 2500);
  }

  // Animated clear all MindMelt LocalStorage items
  function handleClear() {
    setIsClearing(true);
    setClearSuccess(false);
    setTimeout(() => {
      clearMindMeltData();
      setIsClearing(false);
      setClearSuccess(true);
      setTimeout(() => setClearSuccess(false), 1900);
    }, 650);
  }

  // Dummy email verifier: regex, then simulate async check
  async function handleEmailVerify(e) {
    e.preventDefault();
    setEmailStatus("");
    setEmailMsg("");
    const trimmed = (email || "").trim();
    if (!trimmed.match(EMAIL_REGEX)) {
      setEmailStatus("fail");
      setEmailMsg("Please enter a valid email address.");
      emailInputRef.current?.focus();
      return;
    }
    setEmailStatus("");
    setEmailMsg("Checking...");
    // Simulate async verification:
    setTimeout(() => {
      // 70% chance of succeed (simulate)
      if (Math.random() < 0.7) {
        setEmailStatus("success");
        setEmailMsg("Email verified! Weekly summary emails enabled (stub).");
        localStorage.setItem("mindmelt-email", trimmed);
      } else {
        setEmailStatus("fail");
        setEmailMsg("Verification failed. Please try again later.");
      }
    }, 1100);
  }

  // Animation: clear/reset button feedback
  const clearBtnVariants = {
    idle: { scale: 1, opacity: 1 },
    clearing: { scale: 0.95, opacity: 0.7 },
    success: { scale: 1.15, opacity: 1, backgroundColor: "#4CAF50" }
  };

  // Layout
  return (
    <section
      // Removed all Tailwind classes, fallback to App.css/inline style for layout and background
      aria-label="Settings"
      style={{
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 16px",
        background: "linear-gradient(135deg,#252850 0%, #232384 100%)",
        transition: "background 1.2s"
      }}
    >
      <motion.div
        className="w-full max-w-xl bg-white/10 dark:bg-black/20 shadow-xl rounded-xl p-5 md:p-8 flex flex-col gap-7 items-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.72, ease: "easeOut" }}
        tabIndex={0}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-center text-white mb-2">
          Settings
        </h1>
        {/* Theme Toggle */}
        <div className="flex flex-col gap-1 w-full">
          <label className="font-medium text-white/90 mb-1" htmlFor="theme-toggle">
            Theme
          </label>
          <button
            id="theme-toggle"
            onClick={toggleTheme}
            className={`
              bg-gray-200 dark:bg-zinc-800 rounded-full px-2 flex items-center h-10 w-[74px]
              transition-colors focus:outline-none border border-gray-300 dark:border-zinc-700
            `}
            style={{ borderRadius: 9999, minWidth: 62 }}
            aria-label={`Switch theme. Currently ${theme}.`}
          >
            <span
              className={`inline-block w-7 h-7 rounded-full transition-all
                shadow border mr-1 flex items-center justify-center
                ${theme === "light" ? "bg-white ring-2 ring-base-light border" : "bg-zinc-700"}
              `}
              aria-checked={theme === "light"}
              aria-label="Light mode"
            >
              <span className="w-3 h-3 inline-block rounded-full bg-yellow-400"></span>
            </span>
            <span
              className={`inline-block w-7 h-7 rounded-full ml-1 transition-all
                ${theme === "dark" ? "border border-blue-800 ring-2 ring-blue-900 bg-zinc-900" : ""}
              `}
              aria-checked={theme === "dark"}
              aria-label="Dark mode"
            >
              <span className="w-3 h-3 inline-block rounded-full bg-zinc-900"></span>
            </span>
          </button>
        </div>

        {/* Daily 9AM Reminder Toggle (stubbed) */}
        <div className="flex flex-col gap-1 w-full">
          <label className="font-medium text-white/90 mb-1" htmlFor="reminder-toggle">
            Daily 9AM Reminder
          </label>
          <div className="flex items-center gap-4">
            <button
              type="button"
              id="reminder-toggle"
              aria-pressed={reminderOn}
              onClick={handleReminderToggle}
              className={`w-14 h-8 rounded-full flex items-center relative
                transition-colors focus:outline-none border border-gray-300 dark:border-zinc-700
                ${reminderOn ? "bg-accent" : "bg-gray-300 dark:bg-zinc-800"}
              `}
              role="switch"
              aria-checked={reminderOn}
              style={{ borderRadius: 9999 }}
            >
              <span
                className={`transition-all w-7 h-7 rounded-full absolute top-0.5
                  ${reminderOn ? "left-7 bg-white shadow" : "left-1 bg-white/95"}
                `}
                style={{
                  left: reminderOn ? "calc(100% - 33px)" : "6px",
                  boxShadow: "0px 1px 8px #0002"
                }}
                aria-hidden="true"
              />
            </button>
            <span
              className="text-white/80 text-base font-medium select-none"
              id="reminder-status"
              aria-live="polite"
            >
              {reminderOn ? "Enabled" : "Disabled"}
            </span>
          </div>
          <AnimatePresence>
            {reminderFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="text-xs text-accent mt-2"
                aria-live="polite"
              >
                {reminderFeedback}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Clear/Reset Data */}
        <div className="flex flex-col gap-1 w-full">
          <label className="font-medium text-white/90 mb-1" htmlFor="clear-btn">
            Clear or Reset Data
          </label>
          <div className="flex items-center gap-3">
            <motion.button
              id="clear-btn"
              type="button"
              onClick={handleClear}
              className={`
                btn btn-large bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-2
                rounded-md shadow focus:outline-none focus:ring-2 focus:ring-red-200
                transition-all
              `}
              variants={clearBtnVariants}
              animate={
                isClearing
                  ? "clearing"
                  : clearSuccess
                  ? "success"
                  : "idle"
              }
              style={{ minWidth: 120 }}
              aria-live="polite"
              aria-busy={isClearing}
              aria-label="Clear MindMelt Local Data"
              disabled={isClearing}
            >
              {isClearing
                ? "Clearing…"
                : clearSuccess
                ? "Reset Done!"
                : "Clear/Reset"}
            </motion.button>
            <AnimatePresence>
              {clearSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, x: 8 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9, x: 8 }}
                  className="text-green-400 font-bold text-sm ml-2"
                  aria-live="polite"
                  role="status"
                >
                  <span aria-hidden="true">✔️</span> Done!
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <p className="text-xs text-white/70 mt-1">
            Erases mood entries, tasks, and reminder settings locally.
          </p>
        </div>

        {/* Dummy Email Verification */}
        <form
          className="flex flex-col gap-2 w-full"
          autoComplete="off"
          onSubmit={handleEmailVerify}
          noValidate
        >
          <label
            htmlFor="email"
            className="font-medium text-white/90 mb-1"
          >
            Weekly Summary Email (Demo)
          </label>
          <div className="flex flex-row items-center gap-2">
            <input
              ref={emailInputRef}
              id="email"
              type="email"
              className={`px-3 py-2 rounded shadow border text-base w-full
                           transition-all focus:outline-none focus:ring-2
                           focus:ring-accent/30
                           bg-white/85 text-black
                           ${emailStatus === "fail" ? "border-red-500" : ""}
                           `}
              placeholder="you@email.com"
              required
              autoComplete="email"
              aria-label="Email address"
              value={email}
              onChange={e => {
                setEmail(e.target.value);
                setEmailStatus("");
                setEmailMsg("");
              }}
              aria-invalid={emailStatus === "fail"}
              aria-describedby="email-feedback"
              maxLength={60}
              disabled={emailStatus === "success"}
            />
            <button
              type="submit"
              className={`
                btn btn-large font-semibold px-4 py-2 rounded focus:outline-none
                bg-accent hover:bg-primary text-white
                transition-all ml-1
                ${emailStatus === "success" ? "bg-green-500 cursor-not-allowed" : ""}
              `}
              disabled={emailStatus === "success"}
              aria-label="Verify email"
            >
              { emailStatus === "success" ? "Verified" : "Verify" }
            </button>
          </div>
          <AnimatePresence>
            {emailMsg && (
              <motion.div
                id="email-feedback"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className={
                  "text-xs font-medium mt-1 " +
                  (emailStatus === "fail"
                    ? "text-red-400"
                    : emailStatus === "success"
                    ? "text-green-400"
                    : "text-accent")
                }
                aria-live="polite"
                role={emailStatus === "fail" ? "alert" : "status"}
              >
                {emailMsg}
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </motion.div>
    </section>
  );
}
