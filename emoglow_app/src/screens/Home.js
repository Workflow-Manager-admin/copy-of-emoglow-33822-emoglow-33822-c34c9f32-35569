import React from "react";
// PUBLIC_INTERFACE
export default function Home() {
  return (
    <section className="w-full flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-primary to-accent transition-all">
      <h1 className="text-4xl font-bold mb-3">MindMelt Home</h1>
      <p className="opacity-80">Welcome to MindMelt AI. Get started by checking in.</p>
    </section>
  );
}
