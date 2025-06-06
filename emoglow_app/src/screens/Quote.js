import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

// QUOTES DB - can be expanded; keep tailored, avoid repeats
const QUOTES = {
  Joyful: [
    {
      quote: "Joy is the simplest form of gratitude.",
      author: "Karl Barth",
      tag: "joyful"
    },
    {
      quote: "Let your joy be in your journey, not in some distant goal.",
      author: "Tim Cook",
      tag: "joyful"
    }
  ],
  Calm: [
    {
      quote: "Within you, there is a stillness and a sanctuary to which you can retreat at any time.",
      author: "Hermann Hesse",
      tag: "calm"
    },
    {
      quote: "Peace comes from within. Do not seek it without.",
      author: "Buddha",
      tag: "calm"
    }
  ],
  Loved: [
    {
      quote: "You yourself, as much as anybody in the entire universe, deserve your love and affection.",
      author: "Buddha",
      tag: "loved"
    },
    {
      quote: "To love and be loved is to feel the sun from both sides.",
      author: "David Viscott",
      tag: "loved"
    }
  ],
  Okay: [
    {
      quote: "Even on days you feel just 'okay', you’re doing better than you think.",
      author: "Unknown",
      tag: "okay"
    },
    {
      quote: "Be gentle with yourself. You’re doing the best you can.",
      author: "Unknown",
      tag: "okay"
    }
  ],
  Meh: [
    {
      quote: "It’s okay not to be okay all the time.",
      author: "Unknown",
      tag: "meh"
    },
    {
      quote: "Some days you just have to create your own sunshine.",
      author: "Sam Sundquist",
      tag: "meh"
    }
  ],
  Tired: [
    {
      quote: "Rest if you must, but don’t quit.",
      author: "John Greenleaf Whittier",
      tag: "tired"
    },
    {
      quote: "Sometimes the most productive thing you can do is rest.",
      author: "Mark Black",
      tag: "tired"
    }
  ],
  Sad: [
    {
      quote: "Stars can’t shine without darkness.",
      author: "D.H. Sidebottom",
      tag: "sad"
    },
    {
      quote: "The wound is the place where the light enters you.",
      author: "Rumi",
      tag: "sad"
    }
  ],
  Anxious: [
    {
      quote: "You don't have to control your thoughts. You just have to stop letting them control you.",
      author: "Dan Millman",
      tag: "anxious"
    },
    {
      quote: "This too shall pass. Breathe, and let things unfold.",
      author: "Unknown",
      tag: "anxious"
    }
  ],
  Angry: [
    {
      quote: "For every minute you remain angry, you give up sixty seconds of peace of mind.",
      author: "Ralph Waldo Emerson",
      tag: "angry"
    },
    {
      quote: "Speak when you are angry and you will make the best speech you will ever regret.",
      author: "Ambrose Bierce",
      tag: "angry"
    }
  ],
  Stressed: [
    {
      quote: "Keep breathing. You’re stronger than you think.",
      author: "Unknown",
      tag: "stressed"
    },
    {
      quote: "Almost everything will work again if you unplug it for a few minutes — including you.",
      author: "Anne Lamott",
      tag: "stressed"
    }
  ]
};

// Optional mood-based calming/motivational videos for anxious/stressed moods
const MOOD_VIDEOS = {
  Anxious: [
    {
      type: "youtube",
      embedId: "4pLUleLdwY4", // Headspace mini meditation
      label: "Mini Meditation - Headspace"
    },
    {
      type: "youtube",
      embedId: "ZToicYcHIOU", // 5-min Calm guided
      label: "5-Minute Breathing"
    }
  ],
  Stressed: [
    {
      type: "youtube",
      embedId: "inpok4MKVLM", // 5-min Stress Relief breathing
      label: "Stress Relief"
    }
  ]
};

// Mood-to-gradient map (override background for current mood)
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

const MOOD_STORAGE_KEY = "mindmelt-mood-entries";

// Typing animation reveals one char at a time with delay
function useTypingReveal(text, speed = 24) {
  const [revealed, setRevealed] = useState("");
  useEffect(() => {
    if (!text) return setRevealed("");
    let i = 0, mounted = true;
    setRevealed("");
    function step() {
      if (!mounted) return;
      if (i <= text.length) {
        setRevealed(text.slice(0, i));
        i++;
        setTimeout(step, i === text.length ? 0 : speed + Math.random() * 20);
      }
    }
    step();
    return () => { mounted = false; };
  }, [text]);
  return revealed;
}

// Get the last mood entry from LocalStorage
function getLastMoodEntry() {
  const arr = JSON.parse(localStorage.getItem(MOOD_STORAGE_KEY) || "[]");
  if (arr.length === 0) return null;
  return arr[arr.length - 1];
}

// PUBLIC_INTERFACE
export default function Quote() {
  const [currentQuote, setCurrentQuote] = useState(null);
  const [revealedQuote, setRevealedQuote] = useState("");
  const [lastMood, setLastMood] = useState(null);
  const [quoteHistory, setQuoteHistory] = useState([]);
  const [showVideo, setShowVideo] = useState(false);
  const [videoIdx, setVideoIdx] = useState(0);
  const navigate = useNavigate();

  // On mount, fetch the latest mood data and random quote for that mood
  useEffect(() => {
    const entry = getLastMoodEntry();
    setLastMood(entry);
    if (!entry) return;
    // Pick random quote for mood
    const byMood = QUOTES[entry.mood] || [];
    if (!byMood.length) {
      setCurrentQuote(null);
      return;
    }
    // Random but not torn from previous (first entry)
    const idx = Math.floor(Math.random() * byMood.length);
    setQuoteHistory([idx]);
    setCurrentQuote({ ...byMood[idx], idx });
    setShowVideo(false); // default: not showing video
  }, []);

  // Animate typing effect (Framer Motion for fade-in too)
  const displayedQuote = useTypingReveal(currentQuote?.quote, 26);

  // Handler: "Give Me Another"
  function handleAnotherQuote() {
    if (!lastMood) return;
    const byMood = QUOTES[lastMood.mood] || [];
    // Filter out used indices; reset if all used
    let available = byMood.map((_, i) => i).filter(i => !quoteHistory.includes(i));
    if (available.length === 0) {
      // All used, reset except last one to avoid repeat
      available = byMood.map((_, i) => i).filter(i => i !== currentQuote?.idx);
      setQuoteHistory([]);
    }
    const newIdx = available[Math.floor(Math.random() * available.length)];
    setQuoteHistory(h => [...h, newIdx]);
    setCurrentQuote({ ...byMood[newIdx], idx: newIdx });
    setShowVideo(false);
  }

  // Handler: show video (if mood allows)
  function handleShowVideo() {
    setShowVideo(true);
    setVideoIdx(Math.floor(Math.random() * (MOOD_VIDEOS[lastMood.mood]?.length || 1)));
  }

  // Handler: cycle next video if more than one
  function handleNextVideo() {
    setVideoIdx(v => ((v+1) % (MOOD_VIDEOS[lastMood.mood]?.length || 1)));
  }

  // Handler: go to tracker
  function handleNext() {
    navigate("/mindmelt/tracker");
  }

  // Gradient background for current mood
  const moodGradient = lastMood?.mood && MOOD_GRADIENTS[lastMood.mood];

  // Responsive content container min-height
  const contentMinHeight = "min-h-[56vh] sm:min-h-[40vh]";

  // Gracefully handle loading/no mood
  if (!lastMood)
    return (
      <section
        className={`flex flex-col items-center justify-center min-h-screen`}
        style={{background: "var(--base-dark)"}}
      >
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-white">No mood data yet</h1>
        <p className="opacity-80 mb-6 text-white/80">Start by sharing how you feel.</p>
        <button
          className="btn btn-large"
          style={{
            background:
              "linear-gradient(90deg,#66a6ff 0%, #89f7fe 100%)",
            color: "#fff",
            border: "none"
          }}
          onClick={() => navigate("/mindmelt/mood-input")}
        >
          Go to Mood Check-In
        </button>
      </section>
    );

  return (
    <section
      // Remove all Tailwind classes. Use App.css/inline styles for layout/background.
      style={{
        minHeight: "calc(100vh - 64px)",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        background: moodGradient || "var(--base-dark)",
        transition: "background 1s",
        padding: "32px 12px"
      }}
    >
      {/* Inner container, card-style, animate fade+up in */}
      <motion.div
        className={`w-full max-w-xl mx-auto rounded-xl bg-white/10 dark:bg-black/20 p-6 sm:p-10 shadow-2xl flex flex-col items-center ${contentMinHeight} gap-6`}
        initial={{ opacity: 0, y: 36 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{backdropFilter: "blur(8px)"}}
      >
        {/* Mood header */}
        <motion.div
          key={lastMood.mood}
          className="flex items-center gap-3 mb-1"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.7, ease: "easeOut" }}
        >
          <span
            className="text-3xl md:text-4xl"
            aria-label={lastMood.mood}
          >{lastMood.emoji}</span>
          <span className="text-lg font-medium capitalize text-white/90 tracking-wide">
            {lastMood.mood}
          </span>
          <span className="text-xs ml-2 px-2 py-0.5 bg-white/30 dark:bg-black/20 rounded text-accent font-bold uppercase tracking-wide">
            {currentQuote?.tag || ""}
          </span>
        </motion.div>
        {/* Quote content */}
        <div className="flex flex-col items-center w-full">
          {currentQuote && (
            <AnimatePresence mode="wait">
              <motion.p
                key={currentQuote.quote}
                className="text-2xl sm:text-3xl font-semibold text-center mb-2 text-white"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={{
                  duration: 0.8,
                  ease: "easeOut"
                }}
                style={{minHeight: "3rem", letterSpacing:"-0.01em"}}
              >
                {/* Framer fade-in; Typing effect from custom hook */}
                <span>
                  {displayedQuote}
                  {/* Blinking cursor */}
                  <motion.span
                    animate={{
                      opacity: [0.1, 1, 0.1],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.2,
                    }}
                    className="inline-block w-3"
                  >
                    {displayedQuote.length < currentQuote.quote.length ? "|" : " "}
                  </motion.span>
                </span>
              </motion.p>
              <motion.div
                key={"author"}
                className="text-base text-white/70 font-medium mb-3 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{
                  delay: 0.40,
                  duration: 0.65,
                }}
              >
                — {currentQuote.author}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
        {/* [Anxious/Stressed] show video option, animated */}
        {["Anxious","Stressed"].includes(lastMood.mood) && (
          <div className="w-full flex flex-col gap-3 items-center">
            {/* Animated video embed */}
            <AnimatePresence mode="wait">
              {showVideo ? (
                <motion.div
                  key="video"
                  className="w-full flex flex-col gap-2 items-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.7 }}
                >
                  <div className="relative w-full h-0" style={{paddingBottom: "56.2%"}}>
                    {/* Responsive Youtube player */}
                    <iframe
                      title={MOOD_VIDEOS[lastMood.mood][videoIdx].label}
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${MOOD_VIDEOS[lastMood.mood][videoIdx].embedId}?rel=0&autoplay=1&modestbranding=1`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute left-0 top-0 w-full h-full rounded-lg shadow-xl"
                    ></iframe>
                  </div>
                  {MOOD_VIDEOS[lastMood.mood].length > 1 && (
                    <button
                      className="mt-1 text-xs underline text-accent"
                      onClick={handleNextVideo}
                      style={{background:"none"}}
                    >
                      Next Video
                    </button>
                  )}
                  <button
                    className="mt-2 btn btn-sm"
                    style={{
                      background: "rgba(30,30,30,0.91)",
                      color:"#ffde73"
                    }}
                    onClick={() => setShowVideo(false)}
                  >
                    Back to Quote
                  </button>
                </motion.div>
              ) : (
                <motion.button
                  key="showvideo"
                  className="btn btn-large text-lg px-5 py-2 mt-2"
                  style={{
                    background:"linear-gradient(90deg,#e0c3fc 0%,#8ec5fc 100%)",
                    color:"#00334e",
                    border:"none"
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.55 }}
                  onClick={handleShowVideo}
                  aria-label="See a calming video"
                >
                  Need a calming video?
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-row gap-4 w-full justify-center mt-2">
          <button
            className="btn btn-large w-fit px-5 py-2"
            style={{
              background: "linear-gradient(90deg,#66a6ff 0%, #89f7fe 100%)",
              color: "#fff",
              border: "none"
            }}
            onClick={handleAnotherQuote}
            aria-label="Give me another quote"
          >
            Give Me Another
          </button>
          <button
            className="btn btn-large w-fit px-5 py-2"
            style={{
              background: "linear-gradient(90deg,#f7971e 0%, #ffefb1 100%)",
              color: "#222",
              border: "none"
            }}
            onClick={handleNext}
            aria-label="Go to mood tracker"
          >
            Next
          </button>
        </div>
        {/* Mood info / context */}
        <div className="text-xs text-white/70 font-medium mt-6 mb-0 opacity-70 text-center select-none pointer-events-none w-full">
          Your journey is private and designed just for you.
        </div>
      </motion.div>
      {/* (Optional) Decor/gradient overlays */}
      <div className="absolute inset-0 pointer-events-none z-[-1]"></div>
    </section>
  );
}
