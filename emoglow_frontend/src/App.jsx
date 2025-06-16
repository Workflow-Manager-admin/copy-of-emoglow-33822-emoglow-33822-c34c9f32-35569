import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";
import Home from "./components/Home/Home";
import RockPaperScissors from "./components/RockPaperScissors/RockPaperScissors";
import SpaceShooter from "./components/SpaceShooter/SpaceShooter";
import TicTacToe from "./components/TicTacToe/TicTacToe";

const App = () => {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="container">
            <div className="logo">
              <span className="logo-symbol">🎮</span> Goofy Creations
            </div>
          </div>
        </nav>
        <main>
          <div className="container">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/rock-paper-scissors" element={<RockPaperScissors />} />
              <Route path="/space-shooter" element={<SpaceShooter />} />
              <Route path="/tic-tac-toe" element={<TicTacToe />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
};

export default App;
