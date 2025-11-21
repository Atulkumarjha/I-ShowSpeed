"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import TypingTest from "@/components/TypingTest";
import Settings from "@/components/Settings";
import Results from "@/components/Results";
import AuthModal from "@/components/AuthModal";
import Leaderboard from "@/components/Leaderboard";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

interface Time {
  id: number;
  duration: number;
  label: string;
}

export default function HomePage() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [times, setTimes] = useState<Time[]>([]);
  const [sentences, setSentences] = useState<string[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en");
  const [selectedTime, setSelectedTime] = useState<number | null>(15);
  const [selectedWordCount, setSelectedWordCount] = useState<number | null>(
    null
  );
  const [showTest, setShowTest] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showLeaderboardView, setShowLeaderboardView] = useState(false);
  const [results, setResults] = useState({
    wpm: 0,
    accuracy: 0,
    correctChars: 0,
    incorrectChars: 0,
  });

  // Load times from JSON
  useEffect(() => {
    fetch("/data/times.json")
      .then((res) => res.json())
      .then((data) => {
        setTimes(data);
        if (data.length > 0) {
          setSelectedTime(data[0].duration);
        }
      })
      .catch((err) => console.error("Error loading times:", err));
  }, []);

  // Load sentences based on selected word count and language
  useEffect(() => {
    const wordCount = selectedWordCount || 50;
    fetch(`/data/${selectedLanguage}/${wordCount}words.json`)
      .then((res) => res.json())
      .then((data) => setSentences(data))
      .catch((err) => console.error("Error loading sentences:", err));
  }, [selectedWordCount, selectedLanguage]);

  // Handle time selection (deselects word count)
  const handleTimeChange = (duration: number) => {
    setSelectedTime(duration);
    setSelectedWordCount(null);
  };

  // Handle word count selection (deselects time)
  const handleWordCountChange = (count: number) => {
    setSelectedWordCount(count);
    setSelectedTime(null);
  };

  // Handle language change
  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
  };

  const handleStartTest = () => {
    setShowTest(true);
    setShowResults(false);
  };

  const handleTestComplete = (
    wpm: number,
    accuracy: number,
    correctChars: number,
    incorrectChars: number
  ) => {
    setResults({ wpm, accuracy, correctChars, incorrectChars });
    setShowResults(true);
    setShowTest(false);
  };

  const handleRestart = () => {
    setShowTest(false);
    setShowResults(false);
    setShowLeaderboardView(false);
  };

  const handleShowLeaderboard = () => {
    setShowTest(false);
    setShowResults(false);
    setShowLeaderboardView(true);
  };

  return (
    <div className="min-h-screen flex flex-col p-4" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mt-10 mb-8 max-w-6xl w-full mx-auto">
        <Link href="/" onClick={handleRestart} className="cursor-pointer">
          <h1 className="text-3xl font-normal flex flex-col">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>you can&apos;t see, If</span>
              <Image
                src="/assets/keyboard.png"
                width={30}
                height={30}
                alt="Logo"
              />
            </div>
            <span className="font-bold text-yellow-400">I-showspeed</span>
          </h1>
        </Link>

        {/* Navigation and Auth Section */}
        <div className="flex items-center gap-4">
          {/* Leaderboard Navigation Button */}
          <button
            onClick={handleShowLeaderboard}
            className="px-4 py-2 bg-yellow-400 text-black font-semibold rounded hover:bg-yellow-500 transition-colors text-sm"
          >
            🏆 Leaderboard
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors text-xl"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          {user ? (
            <>
              <span className="text-sm text-gray-400">
                Welcome, {user.name}
              </span>
              <button
                onClick={logout}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors text-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-4 py-2 bg-yellow-400 text-black font-semibold rounded hover:bg-yellow-500 transition-colors text-sm"
            >
              Login / Sign Up
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        {/* Dedicated Leaderboard View */}
        {showLeaderboardView && (
          <div className="w-full max-w-6xl mx-auto">
            <div className="mb-6 text-center">
              <h2 className="text-4xl font-bold text-yellow-400 mb-2">🏆 Global Leaderboard</h2>
              <p className="text-gray-400">See how you rank against the best typists worldwide</p>
            </div>
            <Leaderboard />
          </div>
        )}

        {!showTest && !showResults && !showLeaderboardView && (
          <div className="w-full max-w-4xl mx-auto">
            <Settings
              selectedTime={selectedTime}
              selectedWordCount={selectedWordCount}
              selectedLanguage={selectedLanguage}
              onTimeChange={handleTimeChange}
              onWordCountChange={handleWordCountChange}
              onLanguageChange={handleLanguageChange}
              times={times}
            />
            <div className="flex justify-center mt-8">
              <button
                onClick={handleStartTest}
                className="px-8 py-4 bg-yellow-400 text-gray-900 font-bold rounded-lg hover:bg-yellow-500 transition-colors text-xl"
              >
                Start Test
              </button>
            </div>
          </div>
        )}

        {showTest && sentences.length > 0 && (
          <div className="w-full max-w-4xl mx-auto">
            <TypingTest
              sentences={sentences}
              duration={selectedTime || 999999}
              onComplete={handleTestComplete}
              onReset={handleRestart}
              mode={selectedTime !== null ? "time" : "words"}
              limit={
                selectedTime !== null ? selectedTime : selectedWordCount || 50
              }
            />
          </div>
        )}

        {showResults && (
          <div className="w-full max-w-4xl mx-auto">
            <Results
              wpm={results.wpm}
              accuracy={results.accuracy}
              correctChars={results.correctChars}
              incorrectChars={results.incorrectChars}
              onRestart={handleRestart}
              mode={selectedTime !== null ? "time" : "words"}
              limit={
                selectedTime !== null ? selectedTime : selectedWordCount || 50
              }
            />
            
            {/* Leaderboard Section - Always visible after results */}
            <div className="mt-8">
              <Leaderboard />
            </div>
          </div>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}
