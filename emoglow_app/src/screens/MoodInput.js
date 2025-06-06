import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./MoodInput.module.css";

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

// PUBLIC_INTERFACE
function saveMoodEntryToLocalStorage(entry) {
  /** Saves mood entry to LocalStorage, appending to the array of entries. */
  const prev = JSON.parse(localStorage.getItem(MOOD_STORAGE_KEY) || "[]");
  localStorage.setItem(MOOD_STORAGE_KEY, JSON.stringify([...prev, entry]));
}

// Animation Variants
const gridVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.08 } }
};
const emojiVariants = {
  hidden: { opacity: 0, scale: 0.7, y: 18 },
  visible: i => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { delay: 0.07 * i, type: "spring", stiffness: 260, damping: 18 }
  }),
  selected: { scale: 1.22, rotate: [-4, 3, 0], transition: { type: "spring", stiffness: 420, damping: 12 } }
};
const formVariants = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { delay: 0.18, duration: 0.42 } }
};

/**
 * Accessible, animated, responsive Mood Input page for MindMelt AI.
 * Emoji grid (single selectable), animated gradient intensity slider, optional journal.
 * Enforces mood & intensity (required); journal optional. Validation, screenreader labels, keyboard nav, smooth transitions.
 * On Submit, saves (mood, emoji, intensity, journal, timestamp) to LocalStorage and transitions to /mindmelt/quote.
 */
// PUBLIC_INTERFACE
export default function MoodInput() {
  const [selectedMood, setSelectedMood] = useState(null); // Index of mood
  const [intensity, setIntensity] = useState(5);
  const [journal, setJournal] = useState("");
  const [showJournal, setShowJournal] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const journalRef = useRef();

  // Keyboard accessible emoji grid: left/right to move, Enter/Space to select
  function handleEmojiKeydown(e, idx) {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      const next = (idx + 1) % MOOD_EMOJIS.length;
      document.getElementById(`mood-emoji-${next}`)?.focus();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      const prev = (idx - 1 + MOOD_EMOJIS.length) % MOOD_EMOJIS.length;
      document.getElementById(`mood-emoji-${prev}`)?.focus();
    } else if (
      e.key === "Enter" ||
      e.key === " " ||
      e.key === "Spacebar"
    ) {
      e.preventDefault();
      setSelectedMood(idx);
    }
  }

  // Show/animate journal field with focus
  function handleShowJournal() {
    setShowJournal(true);
    setTimeout(() => {
      if (journalRef.current) journalRef.current.focus();
    }, 200);
  }

  // Submit: mood & intensity required, journal optional
  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (selectedMood == null) {
      setError("Please select a mood.");
      return;
    }
    if (typeof intensity !== "number" || intensity < 1 || intensity > 10) {
      setError("Please select an intensity (1-10).");
      return;
    }
    const entry = {
      emoji: MOOD_EMOJIS[selectedMood].emoji,
      mood: MOOD_EMOJIS[selectedMood].label,
      intensity,
      journal: journal.trim() || undefined,
      timestamp: new Date().toISOString()
    };
    saveMoodEntryToLocalStorage(entry);
    // Animated: can add slide-out/fade effect if needed, but instant for now
    navigate("/mindmelt/quote");
  }

  return (
    <section
      className={styles.moodInputSection}
      aria-labelledby="moodinput-title"
    >
      <motion.form
        className={styles.moodForm}
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.18 } }
        }}
        autoComplete="off"
        onSubmit={handleSubmit}
        noValidate
      >
        {/* Title */}
        <motion.h1
          id="moodinput-title"
          className={styles.moodTitle}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.66, ease: "easeOut" }}
        >
          How are you feeling right now?
        </motion.h1>

        {/* Animated error */}
        <AnimatePresence>
          {error && (
            <motion.div
              className={styles.moodError}
              initial={{ opacity: 0, y: -22 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: "spring", bounce: 0.4, duration: 0.45 }}
              aria-live="polite"
              role="alert"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Emoji Mood Grid */}
        <motion.div
          variants={gridVariants}
          initial="hidden"
          animate="visible"
          className="
            grid grid-cols-5 gap-3 md:gap-4 mb-3 w-full
            place-items-center justify-center max-w-md mx-auto focus:outline-none
          "
          role="radiogroup"
          aria-label="Mood selection"
        >
          {MOOD_EMOJIS.map((m, i) => (
            <motion.button
              id={`mood-emoji-${i}`}
              key={m.label}
              className={`
                rounded-full w-14 h-14 md:w-16 md:h-16 text-2xl md:text-3xl flex flex-col items-center
                justify-center shadow border-2 outline-none transition-all font-bold
                focus:ring-2 focus:ring-accent/70 z-10 select-none
                ${
                  selectedMood === i
                    ? "border-accent scale-[1.15] bg-white/10 shadow-xl"
                    : "border-white/15 hover:scale-110 bg-white/5 opacity-85"
                }
              `}
              tabIndex={0}
              aria-checked={selectedMood === i}
              aria-label={m.label}
              type="button"
              onClick={() => setSelectedMood(i)}
              onKeyDown={e => handleEmojiKeydown(e, i)}
              whileHover={{ scale: selectedMood === i ? 1.23 : 1.08, rotate: selectedMood === i ? 5 : 0 }}
              whileTap={{ scale: 0.97 }}
              variants={emojiVariants}
              custom={i}
              animate={selectedMood === i ? "selected" : "visible"}
            >
              <span aria-hidden="true">{m.emoji}</span>
              <span
                className={`text-xs mt-1 font-medium ${
                  selectedMood === i
                    ? "text-accent"
                    : "text-white/65 dark:text-white/50"
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
            How strongly do you feel it? <span className="sr-only">(required, 1-10)</span>
          </label>
          <div className="flex items-center gap-4 w-full">
            <span className="inline-block text-white/70 font-bold">1</span>
            <input
              type="range"
              id="intensity-slider"
              min={1}
              max={10}
              step={1}
              className="
                flex-1 accent-blue-400 h-3 rounded-lg bg-white/10
                appearance-none transition-all outline-none
                focus:outline-none focus:ring-2 focus:ring-accent/60
              "
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
              aria-valuenow={intensity}
              aria-valuemin={1}
              aria-valuemax={10}
              aria-label="Mood intensity"
              required
            />
            <span className="inline-block text-white/70 font-bold">10</span>
          </div>
          <span
            className="text-accent font-bold text-xl tracking-wider"
            aria-live="polite"
          >
            {intensity}
          </span>
        </motion.div>

        {/* Show optional journal area trigger */}
        <AnimatePresence>
          {!showJournal && (
            <motion.button
              className="text-accent underline text-base mt-1 mb-2 focus:outline-none"
              variants={formVariants}
              type="button"
              onClick={handleShowJournal}
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.06 }}
              aria-label="Add an optional journal/thoughts"
            >
              + Add an optional journal/thoughts
            </motion.button>
          )}
        </AnimatePresence>

        {/* Animated journal input */}
        <AnimatePresence>
          {showJournal && (
            <motion.div
              className="w-full"
              initial={{ opacity: 0, y: 16, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: 12, height: 0 }}
              transition={{ type: "spring", duration: 0.54 }}
            >
              <label htmlFor="journal" className="text-white font-medium">
                What else about your mood today? (optional)
              </label>
              <textarea
                ref={journalRef}
                id="journal"
                rows={3}
                maxLength={400}
                className="
                  mt-2 block w-full p-3 rounded-lg border border-white/15
                  bg-white/5 text-white/90 placeholder:text-white/50
                  focus:outline-none focus:ring-2 focus:ring-accent/40
                  resize-vertical transition
                "
                placeholder="Type any thoughts, context, or notes here…"
                value={journal}
                onChange={e => setJournal(e.target.value)}
                aria-label="Mood journal or thoughts (optional)"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit button */}
        <motion.button
          className="
            btn btn-large bg-accent hover:bg-primary
            w-full max-w-xs mt-6 text-lg font-semibold py-3 px-7 rounded shadow-xl
            focus:ring-4 focus:ring-accent/30 select-none transition-all
          "
          type="submit"
          style={{
            background: "linear-gradient(90deg,#66a6ff 0%, #89f7fe 100%)",
            color: "#fff",
            border: "none"
          }}
          initial={{ opacity: 0, y: 28, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 1.20, duration: 0.68, ease: "easeOut" }}
          aria-label="Submit Mood"
        >
          Continue
        </motion.button>
      </motion.form>
      {/* Visually subtle context/footer */}
      <div className="absolute bottom-4 left-0 w-full text-center text-xs text-white/65 pointer-events-none select-none z-0">
        Your check-in is private and stays on this device.
      </div>
    </section>
  );
}
