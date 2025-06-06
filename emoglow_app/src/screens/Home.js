import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import styles from "./Home.module.css";

// PUBLIC_INTERFACE
/**
 * Home screen for MindMelt AI with animated greeting, gradient background,
 * and prominent button to start mood input. Responsive, beautiful, minimal.
 */
export default function Home() {
  const navigate = useNavigate();

  return (
    <section className={styles.homeSection} tabIndex={-1}>
      <motion.div
        className={styles.homeContainer}
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.25,
            },
          },
        }}
      >
        <motion.h1
          className={styles.homeGreeting}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.9, ease: "easeOut" }}
        >
          Hey there, how are you feeling today?
        </motion.h1>
        <motion.p
          className={styles.homeDescription}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.95, duration: 0.8, ease: "easeOut" }}
        >
          Welcome to MindMelt AI, your mood companion. Let's start your journey.
        </motion.p>
        <motion.button
          className={styles.homeButton}
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 1.25, duration: 0.8, ease: "easeOut" }}
          onClick={() => navigate("/mindmelt/mood-input")}
          aria-label="Start Mood Input"
          type="button"
        >
          Get Started
        </motion.button>
      </motion.div>
      <div className={styles.homeFooter}>
        MindMelt AI &mdash; Feel better, one moment at a time
      </div>
    </section>
  );
}
