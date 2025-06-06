import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

/**
 * MindMelt AI - Task Generator Screen
 * - Reads last mood entry from LocalStorage
 * - Displays 1 uplifting, mood-appropriate action (animated card)
 * - Shows 'Done' and 'Show Another' controls, with animations
 * - On Done: saves task to LocalStorage + success microanimation
 * - On Show Another: animated transition to new suggestion
 * - Accessibility, responsiveness, mood-based theming, subtle transitions
 * - Mobile-first, overlays, keyboard nav, visually clear/beautiful
 */

// --- MOOD-ACTION DB (can expand for real product) ----
const ACTIONS_BY_MOOD = {
  Joyful: [
    "Spread your joy: Send a friend a happy message.",
    "Dance to your favorite upbeat song for 1 minute.",
    "Write down 3 things you're grateful for today.",
    "Host a quick, silly family celebration right now."
  ],
  Calm: [
    "Enjoy the calm: Take 5 slow, deep breaths.",
    "Light a candle and listen to peaceful music.",
    "Sketch or doodle something simple.",
    "Step outside and savor the quiet for 2 minutes."
  ],
  Loved: [
    "Return the love: Message someone a genuine compliment.",
    "Give someone a real or virtual hug.",
    "Write yourself a quick love note.",
    "Pay it forward: Hold the door open for someone today."
  ],
  Okay: [
    "UPLIFT: List one thing that went well today (even small).",
    "Sip a glass of water and stretch your neck and shoulders.",
    "Text a friend ‘hi’ or send a meme.",
    "Go outside, look at the sky, and smile for 10 seconds."
  ],
  Meh: [
    "Change your space: Tidy one small area near you.",
    "Move: Stand up and shake your arms for 15 seconds.",
    "Play your favorite upbeat song right now.",
    "List 2 things you like about yourself."
  ],
  Tired: [
    "Recharge: Close your eyes and take a few deep breaths.",
    "Loosen up: Gently roll your shoulders and neck.",
    "Do a quick digital break - no screens for 3 mins.",
    "Drink a glass of water slowly."
  ],
  Sad: [
    "Self-compassion: Write or say something kind to yourself.",
    "Put your hand over your heart and breathe gently.",
    "Reach out to someone just to say hello.",
    "Wrap yourself in a cozy blanket for 5 minutes."
  ],
  Anxious: [
    "Ground yourself: Feel your feet on the ground, notice 3 things you see.",
    "Breathe: Inhale for 4, exhale for 7 seconds. Repeat 3x.",
    "Write out your worry, then crumple the paper.",
    "Play a relaxing sound and close your eyes for 1 minute."
  ],
  Angry: [
    "Blow off steam (safely): Shake your arms/legs.",
    "Imagine your anger as a passing cloud.",
    "Take a break and drink a cool glass of water.",
    "Count backwards slowly from 10 to 1."
  ],
  Stressed: [
    "Release: Tense and relax each muscle group from toes to head.",
    "List 3 things that are within your control right now.",
    "Pause: Do nothing for 1 minute and focus on breathing.",
    "Take a one-minute walk, even in place."
  ]
};

// Mood gradient for theming (matches Quote/Tracker, keys must match mood)
const MOOD_GRADIENTS = {
  Joyful: "linear-gradient(135deg,#f7971e 0%,#ffd200 100%)",
  Calm: "linear-gradient(135deg,#43cea2 0%,#185a9d 100%)",
  Loved: "linear-gradient(135deg,#ffafbd 0%,#ffc3a0 100%)",
  Okay: "linear-gradient(135deg,#9890e3 0%, #b1f4cf 100%)",
  Meh: "linear-gradient(135deg,#dbe6e4 0%,#b3c0c8 100%)",
  Tired: "linear-gradient(135deg,#662d8c 0%,#ed1e79 100%)",
  Sad: "linear-gradient(135deg,#6190e8 0%,#a7bfe8 100%)",
  Anxious: "linear-gradient(135deg,#f7971e 0%,#ffd200 50%,#89f7fe 100%)",
  Angry: "linear-gradient(135deg,#ff5858 0%,#f09819 100%)",
  Stressed: "linear-gradient(135deg,#f85032 0%,#e73827 100%)"
};

// LocalStorage keys
const MOOD_STORAGE_KEY = "mindmelt-mood-entries";
const TASK_COMPLETION_KEY = "mindmelt-task-completions";

/**
 * Returns the latest mood entry object from LocalStorage, or null if none.
 * { mood, emoji, intensity, ... }
 */
function getLastMoodEntry() {
  const arr = JSON.parse(localStorage.getItem(MOOD_STORAGE_KEY) || "[]");
  if (!arr.length) return null;
  return arr[arr.length - 1];
}

/**
 * Save a completed task to LocalStorage for future gamification/history.
 * Stores entries as: [{mood, action, timestamp}, ...]
 */
function saveTaskCompletion({ mood, action }) {
  const prev = JSON.parse(localStorage.getItem(TASK_COMPLETION_KEY) || "[]");
  const record = {
    mood,
    action,
    timestamp: new Date().toISOString()
  };
  localStorage.setItem(TASK_COMPLETION_KEY, JSON.stringify([...prev, record]));
}

// Animate swipe/fade cards
const cardVariants = {
  initial: { scale: 0.97, opacity: 0, y: 32 },
  animate: { scale: 1, opacity: 1, y: 0, transition: { type: "spring", duration: 0.65, bounce: 0.44 }},
  exit: { scale: 0.98, opacity: 0, y: -30, transition: { duration: 0.44 }}
};

// Micro success feedback
const doneVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: [1.2, 1], transition: { type: "spring", duration: 0.5, bounce: 0.6 } }
};

// PUBLIC_INTERFACE
export default function Task() {
  const [lastMood, setLastMood] = useState(null);
  const [taskIdx, setTaskIdx] = useState(0);
  const [shownIndices, setShownIndices] = useState([]); // avoid repeats until all shown
  const [done, setDone] = useState(false); // for triggering success micro-animation
  const [animating, setAnimating] = useState(false);
  const navigate = useNavigate();
  const cardRef = useRef();

  // On mount, load last mood and reset
  useEffect(() => {
    const entry = getLastMoodEntry();
    setLastMood(entry);
    setTaskIdx(0);
    setShownIndices([]);
    setDone(false);
  }, []);

  // Prepare actions for current mood
  const actions =
    lastMood && lastMood.mood && ACTIONS_BY_MOOD[lastMood.mood]
      ? ACTIONS_BY_MOOD[lastMood.mood]
      : [];

  // Find current action index (avoid repeats until all shown)
  useEffect(() => {
    if (!actions.length) return;
    // If shownIndices includes all, reset (but not to the latest one)
    if (shownIndices.length >= actions.length) {
      setShownIndices([]);
    }
  }, [shownIndices, actions]);

  // Generate index for next un-shown action
  function nextActionIdx() {
    if (!actions.length) return 0;
    const indicesAvail = actions.map((_, i) => i).filter(i => !shownIndices.includes(i));
    if (!indicesAvail.length) return 0;
    // Prefer random for variety, otherwise next in order
    return indicesAvail[Math.floor(Math.random() * indicesAvail.length)];
  }

  // Accessibility: focus on card after new action
  useEffect(() => {
    if (cardRef.current) {
      cardRef.current.focus();
    }
  }, [taskIdx]);

  // Handle: Done ✅ button
  function handleDone() {
    setDone(true);
    saveTaskCompletion({ mood: lastMood.mood, action: actions[taskIdx] });
    setTimeout(() => {
      setDone(false);
      handleShowAnother(); // Immediately next; or could stay on checked?
    }, 1100); // Microanim duration
  }

  // Handle: Show Another 🔁 button
  function handleShowAnother() {
    setAnimating(true);
    setTimeout(() => {
      const idx = nextActionIdx();
      setTaskIdx(idx);
      setShownIndices(s => [...s, idx]);
      setAnimating(false);
      setDone(false);
    }, 400); // Card exit animation duration
  }

  // Handler: go to mood check-in if no mood
  function handleMissingMood() {
    navigate("/mindmelt/mood-input");
  }

  // Theming: mood-based background
  const moodGradient =
    lastMood && lastMood.mood && MOOD_GRADIENTS[lastMood.mood]
      ? MOOD_GRADIENTS[lastMood.mood]
      : "var(--base-dark)";

  // Card accent color for accessibility (use accent or mood-specific)
  const accentColor = "var(--accent, #ff9800)";

  // Accessibility: handle key shortcuts (Enter triggers Done, R for another)
  function handleKeyDown(e) {
    if (e.key === "Enter" && !done && !animating) {
      handleDone();
    } else if ((e.key === "r" || e.key === "R") && !done && !animating) {
      handleShowAnother();
    }
  }

  // Responsive heights, card sizes
  const cardMinHeight = "min-h-[200px] sm:min-h-[220px]";
  const cardMaxWidth = "max-w-md w-full";

  // --- Render ---
  if (!lastMood)
    return (
      <section
        className="flex flex-col items-center justify-center min-h-screen"
        style={{ background: "var(--base-dark)" }}
      >
        <motion.h1
          className="text-2xl md:text-3xl font-bold mb-2 text-white"
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7, ease: "easeOut" }}
        >
          No mood data yet
        </motion.h1>
        <p className="opacity-80 mb-6 text-white/80">
          Start by sharing your mood to get mood-boosting tasks.
        </p>
        <button
          className="btn btn-large"
          style={{
            background: "linear-gradient(90deg,#66a6ff 0%, #89f7fe 100%)",
            color: "#fff",
            border: "none"
          }}
          onClick={handleMissingMood}
        >
          Go to Mood Check-In
        </button>
      </section>
    );

  // Show beautiful task card for current mood
  return (
    <section
      className="flex flex-col items-center justify-center w-full min-h-[calc(100vh-64px)] px-2 sm:px-4 py-10 transition-all relative"
      style={{
        background: moodGradient,
        transition: "background 1s"
      }}
      aria-label="Task Generator"
    >
      {/* Animated task suggestion card */}
      <div
        className="w-full max-w-lg mx-auto"
        style={{ minHeight: 360 }}
      >
        <AnimatePresence mode="wait">
          {!animating && (
            <motion.div
              key={`action-card-${taskIdx}-${done}`}
              className={`rounded-xl shadow-2xl p-6 sm:p-8 bg-white/20 dark:bg-black/30 backdrop-blur-xl flex flex-col items-center ${cardMinHeight} ${cardMaxWidth} relative`}
              style={{
                transition: "all 0.34s cubic-bezier(0.33,1,0.68,1)",
                outline: done ? `3px solid ${accentColor}` : "none",
                boxShadow: done
                  ? "0 0 0 6px rgba(255,187,0,0.14)"
                  : "0 8px 32px 0 rgba(0,0,0,0.16)"
              }}
              variants={cardVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              tabIndex={0}
              role="region"
              aria-label={`Mood-based task: ${lastMood.mood}`}
              ref={cardRef}
              onKeyDown={handleKeyDown}
            >
              {/* Mood Header Animated */}
              <motion.div
                className="flex items-center gap-3 mb-2"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.12, duration: 0.57 }}
              >
                <span
                  className="text-3xl md:text-4xl"
                  aria-label={lastMood.mood}
                >
                  {lastMood.emoji}
                </span>
                <span className="text-lg font-bold capitalize text-white/90 tracking-wide">
                  {lastMood.mood}
                </span>
                <span className="text-xs ml-2 px-2 py-0.5 bg-white/40 dark:bg-black/30 rounded text-accent font-bold uppercase tracking-wide">
                  Task
                </span>
              </motion.div>
              {/* Animated Task Text */}
              <motion.p
                className="text-xl sm:text-2xl font-semibold text-center mb-3 select-text text-white"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.21, duration: 0.66, ease: "easeOut" }}
                aria-live="polite"
                style={{
                  textShadow: "0 1px 6px rgba(0,0,0,0.13)",
                  letterSpacing: "-0.01em"
                }}
              >
                {actions[taskIdx]}
              </motion.p>
              {/* Micro success/checkmark animation */}
              <AnimatePresence>
                {done && (
                  <motion.div
                    className="flex flex-col items-center absolute inset-0 justify-center z-30 pointer-events-none"
                    variants={doneVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    role="status"
                    aria-label="Task Completed!"
                  >
                    <span
                      className="text-6xl"
                      style={{ color: accentColor, filter: "drop-shadow(0 1px 8px #fff7)" }}
                    >✅</span>
                    <span
                      className="font-bold text-lg mt-2 text-white"
                      style={{ letterSpacing: 1 }}
                    >
                      Completed!
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
              {/* Card Controls (unless animating) */}
              {!done && !animating && (
                <div className="flex flex-row items-center justify-center gap-4 mt-8 w-full">
                  <motion.button
                    className="btn btn-large w-fit px-7 py-3 font-semibold shadow focus:ring-2 focus:ring-accent/30 select-none"
                    style={{
                      background:
                        "linear-gradient(90deg,#ffda77 0%, #ffd200 100%)",
                      color: "#223",
                      border: "none"
                    }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleDone}
                    aria-label="Mark task as done"
                  >
                    Done <span aria-hidden="true">✅</span>
                  </motion.button>
                  <motion.button
                    className="btn btn-large w-fit px-7 py-3 font-semibold shadow focus:ring-2 focus:ring-blue-400/30 select-none"
                    style={{
                      background:
                        "linear-gradient(90deg,#e0c3fc 0%,#8ec5fc 100%)",
                      color: "#00334e",
                      border: "none"
                    }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleShowAnother}
                    aria-label="Show another uplifting suggestion"
                  >
                    Show Another <span aria-hidden="true">🔁</span>
                  </motion.button>
                </div>
              )}
              {/* Subtle footer for accessibility */}
              <div className="mt-7 w-full text-center text-xs text-white/80 opacity-80 select-none pointer-events-none mb-0">
                Press <kbd className="px-1 py-0.5 bg-white/30 rounded mx-1">Enter</kbd> to complete, <kbd className="px-1 py-0.5 bg-white/30 rounded mx-1">R</kbd> for another.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* Optionally, subtle decorative overlays */}
      <div className="absolute inset-0 pointer-events-none z-[-1]" aria-hidden="true"></div>
      {/* Back to tracker link */}
      <motion.div
        className="absolute bottom-4 left-0 w-full text-center text-xs text-white/70 select-none"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.29, duration: 0.6 }}
      >
        <button
          className="underline hover:text-accent transition px-2 py-1 bg-transparent"
          style={{ background: "none" }}
          tabIndex={0}
          onClick={() => navigate("/mindmelt/tracker")}
        >
          View Mood Tracker
        </button>
      </motion.div>
    </section>
  );
}
