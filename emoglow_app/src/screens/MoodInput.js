import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

/**
 * MoodInput Screen for MindMelt AI
 * Features:
 *  - Emoji selection grid (single-selection, animated, accessible, responsive)
 *  - Intensity slider (1-10) with numeric feedback
 *  - Optional journal text area that animates into view
 *  - Animated error validation if required fields missing
 *  - On submit: saves mood entry to LocalStorage (for future tracking)
 *  - Responsive, animated, and themed (light/dark) screen
 */

// Mood emoji options: (these may be tuned for product)
const MOOD_EMOJIS = [
  { label: "Joyful", emoji: "😄" },
  { label: "Calm", emoji: "😌" },
  { label: "Loved", emoji: "🥰" },
  { label: "Okay", emoji: "🙂" },
  { label: "Meh", emoji: "😐" },
  { label: "Tired", emoji: "🥱" },
  { label: "Sad", emoji: "😢" },
  { label: "Anxious", emoji: "😰" },
  { label: "Angry", emoji: "😡" },
  { label: "Stressed", emoji: "😣" }
];

const MOOD_STORAGE_KEY = "mindmelt-mood-entries";

function saveMoodEntryToLocalStorage(entry) {
  // Loads, appends, saves - supports tracker/history
  const prev = JSON.parse(localStorage.getItem(MOOD_STORAGE_KEY) || "[]");
  localStorage.setItem(MOOD_STORAGE_KEY, JSON.stringify([...prev, entry]));
}

const gridVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.05 } }
};
const emojiVariants = {
  hidden: { opacity: 0, scale: 0.6, y: 18 },
  visible: i => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { delay: 0.08 * i, type: "spring", stiffness: 200 }
  }),
  selected: { scale: 1.18, transition: { type: "spring", stiffness: 400 } }
};

const formVariants = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { delay: 0.24, duration: 0.4 } }
};

// PUBLIC_INTERFACE
export default function MoodInput() {
  const [selectedMood, setSelectedMood] = useState(null);
  const [intensity, setIntensity] = useState(5);
  const [journal, setJournal] = useState("");
  const [showJournal, setShowJournal] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const journalRef = useRef();

  // Provide basic keyboard navigation for the grid
  function handleEmojiKeydown(e, idx) {
    if (e.key === "ArrowRight") {
      const next = (idx + 1) % MOOD_EMOJIS.length;
      document.getElementById("mood-emoji-" + next).focus();
    } else if (e.key === "ArrowLeft") {
      const prev = (idx - 1 + MOOD_EMOJIS.length) % MOOD_EMOJIS.length;
      document.getElementById("mood-emoji-" + prev).focus();
    } else if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
      e.preventDefault();
      setSelectedMood(idx);
    }
  }

  function handleShowJournal() {
    setShowJournal(true);
    setTimeout(() => {
      if (journalRef.current) journalRef.current.focus();
    }, 200);
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (selectedMood == null || typeof intensity !== "number") {
      setError("Select your mood and how strongly you feel it.");
      return;
    }
    // Save record
    const entry = {
      emoji: MOOD_EMOJIS[selectedMood].emoji,
      mood: MOOD_EMOJIS[selectedMood].label,
      intensity,
      journal: journal.trim(),
      datetime: new Date().toISOString()
    };
    saveMoodEntryToLocalStorage(entry);
    // Animate out and route (for now navigate immediately)
    navigate("/mindmelt/quote");
  }

  return (
    <section
      className={`
        w-full min-h-[calc(100vh-64px)]
        flex flex-col items-center justify-center px-4 pt-6 pb-10 relative
        bg-mood-gradient dark:bg-mood-dark
        transition-all
      `}
      style={{ minHeight: "calc(100vh - 64px)" }}
    >
      <motion.div
        className="flex flex-col items-center justify-center gap-7 w-full max-w-lg mx-auto"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.16 } }
        }}
      >
        {/* Title */}
        <motion.h1
          className="text-2xl md:text-3xl font-bold text-center mb-1 text-white"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
        >
          How are you feeling right now?
        </motion.h1>

        {/* Animated error */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="bg-red-400/90 text-white px-3 py-2 rounded-md font-medium mb-1 w-full text-center shadow"
              initial={{ opacity: 0, y: -18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ type: "spring", bounce: 0.4, duration: 0.4 }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Emoji selection grid */}
        <motion.div
          variants={gridVariants}
          initial="hidden"
          animate="visible"
          className={`
            grid grid-cols-5 sm:grid-cols-5 gap-3 md:gap-4 mb-2 w-full
            place-items-center justify-center max-w-md mx-auto
          `}
          role="radiogroup"
          aria-label="Select mood"
        >
          {MOOD_EMOJIS.map((m, i) => (
            <motion.button
              id={`mood-emoji-${i}`}
              key={m.label}
              type="button"
              className={`rounded-full w-16 h-16 md:w-20 md:h-20 text-3xl md:text-4xl flex flex-col items-center 
                justify-center shadow border-2 outline-none 
                focus:ring-2 focus:ring-accent/60 
                transition-all font-bold
                ${
                  selectedMood === i
                    ? "border-accent scale-[1.16] bg-white/10 shadow-lg"
                    : "border-white/15 hover:scale-110 bg-white/5"
                }
              `}
              tabIndex={0}
              aria-checked={selectedMood === i}
              aria-label={m.label}
              onClick={() => setSelectedMood(i)}
              onKeyDown={e => handleEmojiKeydown(e, i)}
              whileHover={{ scale: selectedMood === i ? 1.18 : 1.09 }}
              whileTap={{ scale: 0.98 }}
              variants={emojiVariants}
              custom={i}
              animate={selectedMood === i ? "selected" : "visible"}
            >
              <span>{m.emoji}</span>
              <span
                className={`text-xs mt-1 font-medium ${
                  selectedMood === i
                    ? "text-accent"
                    : "text-white/60 dark:text-white/40"
                }`}
              >
                {m.label}
              </span>
            </motion.button>
          ))}
        </motion.div>

        {/* Intensity slider */}
        <motion.div
          className="w-full flex flex-col items-center gap-2 mb-1"
          variants={formVariants}
        >
          <label
            htmlFor="intensity-slider"
            className="block text-white/90 font-medium mb-1"
          >
            How strongly do you feel it?
          </label>
          <div className="flex items-center gap-4 w-full">
            <span className="inline-block text-white/70 font-bold">1</span>
            <input
              type="range"
              id="intensity-slider"
              min={1}
              max={10}
              step={1}
              className="flex-1 accent-blue-400 h-3 rounded-lg bg-white/10
                appearance-none transition-all"
              style={{
                background:
                  "linear-gradient(90deg, #66a6ff " +
                  (intensity * 10) +
                  "%, #ece9ff " +
                  (intensity * 10) +
                  "%)"
              }}
              value={intensity}
              onChange={e => setIntensity(Number(e.target.value))}
            />
            <span className="inline-block text-white/70 font-bold">10</span>
          </div>
          <span className="text-accent font-bold text-xl tracking-wider" aria-live="polite">
            {intensity}
          </span>
        </motion.div>

        {/* Show optional journal area trigger */}
        {!showJournal && (
          <motion.button
            className="text-accent underline text-base mt-1 mb-2 focus:outline-none"
            variants={formVariants}
            type="button"
            onClick={handleShowJournal}
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.06 }}
          >
            + Add an optional journal/thoughts
          </motion.button>
        )}

        {/* Animated journal input */}
        <AnimatePresence>
          {showJournal && (
            <motion.div
              className="w-full"
              initial={{ opacity: 0, y: 16, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: 12, height: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              <label htmlFor="journal" className="text-white font-medium">
                What else about your mood today? (optional)
              </label>
              <textarea
                ref={journalRef}
                id="journal"
                rows={3}
                maxLength={400}
                className="mt-2 block w-full p-3 rounded-lg border border-white/15
                  bg-white/5 text-white/90 placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-accent/40 resize-vertical transition"
                placeholder="Type any thoughts, context, or notes here…"
                value={journal}
                onChange={e => setJournal(e.target.value)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit button */}
        <motion.button
          className="btn btn-large bg-accent hover:bg-primary w-full max-w-xs mt-5 text-lg font-semibold py-3 px-7 rounded shadow-xl focus:ring-4 focus:ring-accent/30 select-none transition-all"
          type="submit"
          style={{
            background: "linear-gradient(90deg,#66a6ff 0%, #89f7fe 100%)",
            color: "#fff",
            border: "none"
          }}
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 1.25, duration: 0.7, ease: "easeOut" }}
          onClick={handleSubmit}
          aria-label="Submit Mood"
        >
          Continue
        </motion.button>
      </motion.div>
      {/* Subtle context/footer */}
      <div className="absolute bottom-4 left-0 w-full text-center text-xs text-white/60 select-none pointer-events-none z-0">
        Your check-in is private and stays on this device.
      </div>
    </section>
  );
}
