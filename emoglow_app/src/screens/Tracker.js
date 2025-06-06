import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Requirements for the screen:
// 1) Parse mood entries from LocalStorage
// 2) Render animated, responsive mood chart (Recharts) with Weekly/Monthly toggle & color-coded mood dots
// 3) Download CSV of tracked moods
// 4) Clear History button (removes mood logs/animates chart)
// 5) Fully responsive/mobile layout, Framer Motion/Tailwind animations

// === DYNAMIC IMPORT: recharts ===
// We load recharts lazily (dynamic import on mount) to avoid impacting baseline bundle size.
const lazyRecharts = () => import("recharts");

// Moods and color map (should match mood input)
const MOOD_COLORS = {
  Joyful: "#FFD600",      // bright yellow
  Calm: "#43cea2",        // teal
  Loved: "#ffafbd",       // soft pink
  Okay: "#7986cb",        // soft blue
  Meh: "#b3c0c8",         // muted
  Tired: "#9966cc",       // purple
  Sad: "#3a72c2",         // blue
  Anxious: "#77e4fe",     // light blue
  Angry: "#FF5858",       // red
  Stressed: "#FF9800"     // orange
};

const MOOD_STORAGE_KEY = "mindmelt-mood-entries";

// Returns a color for a mood
function getMoodColor(mood) {
  return MOOD_COLORS[mood] || "#aaa";
}

// Helper: Parse LocalStorage mood entries safely
function loadMoodEntries() {
  try {
    const arr = JSON.parse(localStorage.getItem(MOOD_STORAGE_KEY) || "[]");
    if (!Array.isArray(arr)) return [];
    return arr;
  } catch {
    return [];
  }
}

// Helper: Get date label for chart (short "Wed" or "Mar 8")
function shortDateLabel(dateStr, type = "weekly") {
  const d = new Date(dateStr);
  if (type === "weekly") return d.toLocaleDateString(undefined, { weekday: "short" });
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// Helper: Get start of today in local time (midnight)
function startOfToday() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

// PUBLIC_INTERFACE
export default function Tracker() {
  // Chart library refs/lazy load
  const [Recharts, setRecharts] = useState(null);
  // Mood entries raw
  const [entries, setEntries] = useState([]);
  // Filter: "week" or "month"
  const [view, setView] = useState("week");
  // Animate in chart on tab/view toggle
  const [chartKey, setChartKey] = useState(0);
  // Block for enabling smooth animation when clearing
  const [isClearing, setIsClearing] = useState(false);
  // For animation/export: reference to chart area
  const chartRef = useRef();

  // --- Load Recharts dynamically only on client ---
  useEffect(() => {
    let mounted = true;
    lazyRecharts().then(mod => {
      if (mounted) setRecharts(mod);
    });
    // Load initial entries
    setEntries(loadMoodEntries());
    return () => { mounted = false; };
  }, []);

  // --- Handles clear all mood entries with animation ---
  function handleClearHistory() {
    setIsClearing(true);
    setTimeout(() => {
      localStorage.removeItem(MOOD_STORAGE_KEY);
      setEntries([]);
      setIsClearing(false);
      setChartKey(prev => prev + 1); // trigger new chart/remount
    }, 650); // matches animation duration
  }

  // --- Handles download mood entries as CSV ---
  function handleDownloadCSV() {
    const csvRows = [
      ["Date", "Mood", "Emoji", "Intensity", "Journal"].join(",")
    ];
    // Sort by date ascending for user friendliness
    const sorted = [...entries].sort((a, b) => (a.timestamp || "").localeCompare(b.timestamp || ""));
    for (const e of sorted) {
      const date = e.timestamp ? new Date(e.timestamp).toLocaleString() : "";
      const mood = e.mood || "";
      const emoji = e.emoji || "";
      const intensity = e.intensity == null ? "" : e.intensity;
      const journal = (e.journal || "").replace(/"/g,'""'); // escape for csv
      csvRows.push([date, mood, emoji, intensity, `"${journal}"`].join(","));
    }
    const csv = csvRows.join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "MindMelt_Mood_History.csv";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 10);
  }

  // --- Derive data for chart: last 7 days or month, aggregate if needed ---
  function getChartData() {
    // Ensure we process at most 31 days for month (could extend)
    const now = startOfToday();
    const numDays = view === "week" ? 7 : 31;

    // Build days: { dateStr, display, ... }
    const chunks = [];
    for (let i = numDays - 1; i >= 0; --i) {
      const dt = new Date(now);
      dt.setDate(now.getDate() - i);
      chunks.push({
        date: dt.toISOString().slice(0, 10), // "2024-05-02"
        label: shortDateLabel(dt, view),
      });
    }

    // Assign mood entry to each date
    const data = chunks.map(chunk => {
      const dayEntries = entries.filter(e => e.timestamp && e.timestamp.startsWith(chunk.date));
      if (!dayEntries.length) return { ...chunk, mood: null, emoji: null, intensity: null, color: "#d1d5db" };

      // Pick the latest entry for this day
      const latest = dayEntries[dayEntries.length - 1];
      return {
        ...chunk,
        mood: latest.mood,
        emoji: latest.emoji,
        intensity: latest.intensity,
        color: getMoodColor(latest.mood),
        time: latest.timestamp ? new Date(latest.timestamp).toLocaleTimeString() : ''
      };
    });
    return data;
  }

  // --- Animate to new chart when changing time filter ---
  function handleViewToggle(next) {
    setView(next);
    setChartKey(prev => prev + 1);
  }

  // --- Responsive layout cutoffs ---
  const isMobile = window.innerWidth < 700;

  // Mood dots for chart legend
  const moodOptions = Object.keys(MOOD_COLORS);

  // === RENDER ===

  // Show loading while recharts is loading
  if (!Recharts) return (
    <section className="flex flex-col items-center justify-center min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xl font-semibold text-white/80"
      >
        Loading Mood Tracker...
      </motion.div>
    </section>
  );
  const { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Dot, Legend } = Recharts;

  // Compose graph data and get present state
  const chartData = getChartData();
  const hasAnyData = entries.length > 0;
  const latestEntry = entries.length > 0 ? entries[entries.length - 1] : null;

  // Animate out chart on clearing
  const chartVariants = {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
    exit: { opacity: 0, y: -30, transition: { duration: 0.55, ease: "easeIn" } }
  };

  // PUBLIC_INTERFACE
  return (
    <section
      className="
        min-h-[calc(100vh-74px)] w-full pb-8 pt-4
        flex flex-col items-center justify-start
        bg-mood-gradient dark:bg-mood-dark
      "
      style={{
        minHeight: "calc(100vh - 64px)",
        transition: "background 1s"
      }}
      aria-label="Mood Tracker"
    >
      {/* Title Animated */}
      <motion.h1
        className="text-2xl md:text-4xl font-bold text-center mb-1 mt-4 md:mt-8 text-white"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.8, ease: "easeOut" }}
      >
        Mood Tracker
      </motion.h1>

      <motion.p
        className="description text-base md:text-lg opacity-75 text-center mb-2 text-white/80"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.6, ease: "easeOut" }}
      >
        Visualize your journey and spot trends in your emotional wellbeing.
      </motion.p>

      {/* Controls: toggle + export + clear */}
      <motion.div
        className="flex flex-row gap-3 sm:gap-5 items-center justify-center mt-6 mb-4 w-full max-w-lg flex-wrap"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.48, duration: 0.65 }}
      >
        {/* View Toggle */}
        <div className="flex rounded-full bg-white/10 border border-white/20 overflow-hidden shadow divide-x divide-white/20 flex-shrink-0">
          <button
            className={`px-5 py-2 text-sm font-medium transition-all ${view === "week" ? "bg-white/90 text-blue-700 shadow" : "bg-transparent text-white/80 hover:bg-white/30"} focus:outline-none`}
            onClick={() => handleViewToggle("week")}
            aria-label="View last 7 days"
          >Weekly</button>
          <button
            className={`px-5 py-2 text-sm font-medium transition-all ${view === "month" ? "bg-white/90 text-blue-700 shadow" : "bg-transparent text-white/80 hover:bg-white/30"} focus:outline-none`}
            onClick={() => handleViewToggle("month")}
            aria-label="View last 31 days"
          >Monthly</button>
        </div>
        {/* Download CSV */}
        <button
          className="btn btn-sm bg-white/20 text-white/90 px-4 py-2 rounded border border-white/15 ml-2 hover:bg-white/50 hover:text-blue-800 transition-all font-medium focus:outline-none"
          style={{ minWidth: 100 }}
          onClick={handleDownloadCSV}
          disabled={!hasAnyData}
          aria-label="Download mood history as CSV"
        >
          Download CSV
        </button>
        {/* Clear History */}
        <button
          className="btn btn-sm bg-red-400/80 hover:bg-red-600 text-white px-4 py-2 font-bold rounded shadow ml-2 transition-all border-2 border-red-300/50"
          onClick={handleClearHistory}
          disabled={!hasAnyData}
          aria-label="Clear mood history"
          style={{
            opacity: entries.length > 0 ? 1 : 0.45,
            pointerEvents: entries.length > 0 ? "auto" : "none"
          }}
        >
          Clear History
        </button>
      </motion.div>

      {/* Chart Section */}
      <div className="w-full max-w-2xl bg-black/10 dark:bg-white/5 rounded-xl p-2 md:p-4 mt-2 shadow-2xl backdrop-blur-md relative transition-all"
        ref={chartRef}
        style={{
          minHeight: isMobile ? 250 : 360,
          height: isMobile ? 310 : 420
        }}
      >
        <AnimatePresence mode="wait">
          {/* Mood Chart, animate in/out */}
          {!isClearing && hasAnyData && (
            <motion.div
              key={`chart-${view}-${chartKey}`}
              variants={chartVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full h-full"
            >
              <ResponsiveContainer width="100%" height="98%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 2" vertical={false} stroke="#fff3" />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "#fff", fontWeight: 600, fontSize: isMobile ? 12 : 16, opacity:0.94 }}
                    axisLine={{ stroke: "#ffffff60" }}
                    tickLine={false}
                  />
                  <YAxis
                    dataKey="intensity"
                    type="number"
                    domain={[1, 10]}
                    tickCount={6}
                    tick={{ fill: "#fff", fontWeight: 500, fontSize: isMobile ? 11 : 14, opacity:0.86 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.[0]) return null;
                      const d = payload[0].payload;
                      if (!d.mood) {
                        return (
                          <div className="rounded bg-white/80 px-3 py-2 shadow text-black">
                            <div className="font-bold">No data</div>
                            <div>{d.label}</div>
                          </div>
                        );
                      }
                      return (
                        <div className="rounded bg-white/95 px-3 py-2 shadow text-black min-w-[130px]">
                          <div className="uppercase text-xs font-semibold tracking-wider mb-1" style={{color: d.color}}>
                            {d.mood} <span role="img" aria-label={d.mood}>{d.emoji}</span>
                          </div>
                          <div className="text-sm font-bold">
                            Intensity: <span className="font-mono">{d.intensity}</span>
                          </div>
                          {d.time && (
                            <div className="text-xs mt-1 opacity-60">
                              {d.time}
                            </div>
                          )}
                        </div>
                      );
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="intensity"
                    stroke="#00ffff"
                    strokeWidth={3}
                    dot={({ cx, cy, payload, ...rest }) => payload.mood
                      ? (
                        <motion.circle
                          cx={cx} cy={cy} r={isMobile ? 8 : 11}
                          fill={payload.color}
                          stroke="#fff"
                          strokeWidth="2.5"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.35, ease: "backOut" }}
                          key={payload.date}
                          style={{ filter: "drop-shadow(0 2px 4px #0003)" }}
                        />
                      )
                      : (
                        <circle cx={cx} cy={cy} r={isMobile ? 4 : 6} fill="#e5e7eb" opacity="0.6" />
                      )
                    }
                    activeDot={{
                      r: isMobile ? 15 : 18,
                      stroke: "#ffd600",
                      fill: "#08f",
                      strokeWidth: 3,
                      style: { filter: "drop-shadow(0 0 4px #ffd60088)" }
                    }}
                    isAnimationActive={true}
                  />
                </LineChart>
              </ResponsiveContainer>
              {/* Legend (display mood colors) */}
              <div className="flex flex-wrap gap-2 mt-3 mx-2">
                {moodOptions.map(mood => (
                  <span key={mood}
                        className="flex items-center gap-1 text-xs md:text-sm mb-1 px-2 py-1 rounded-full"
                        style={{
                          background: MOOD_COLORS[mood]+"22",
                          color: MOOD_COLORS[mood],
                          border: "1.5px solid "+MOOD_COLORS[mood]+"70"
                        }}
                  >
                    <span className="w-3 h-3 rounded-full inline-block mr-1" style={{background: MOOD_COLORS[mood]}} />
                    {mood}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
          {/* Blank State / Animated Out */}
          {(!hasAnyData || isClearing) && (
            <motion.div
              key="empty-chart"
              className="flex flex-col items-center justify-center w-full h-full min-h-[180px] py-8"
              initial={{ opacity: 0, y: 25, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -24, scale: 0.98 }}
              transition={{ duration: 0.53 }}
            >
              {/* Moodful empty state */}
              <span className="text-5xl mb-2 select-none pointer-events-none">🪄</span>
              <span className="text-lg font-semibold text-white/80 mb-1">No mood data to show</span>
              <span className="text-base text-white/60 mb-2 text-center">Start tracking your moods to see trends here!</span>
            </motion.div>
          )}
        </AnimatePresence>
        {/* (Optional) Subtle footer for privacy */}
        <div className="w-full px-2 mt-4 text-center text-xs text-white/65 pointer-events-none select-none z-0">
          Your mood check-ins are private and live only on this device.
        </div>
      </div>
    </section>
  );
}
