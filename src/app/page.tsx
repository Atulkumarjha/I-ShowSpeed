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

interface Time {
  id: number;
  duration: number;
  label: string;
}

export default function HomePage() {
  const { user, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [times, setTimes] = useState<Time[]>([]);
  const [sentences, setSentences] = useState<string[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en");
  const [selectedTime, setSelectedTime] = useState<number | null>(15);
  const [selectedWordCount, setSelectedWordCount] = useState<number | null>(
    null
  );
  const [showTest, setShowTest] = useState(false);
  const [showResults, setShowResults] = useState(false);
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
  };

  return (
    <div className="min-h-screen flex flex-col p-4">
      {/* Header */}
      <div className="flex items-center justify-between mt-10 mb-8 max-w-6xl w-full mx-auto">
        <Link href="/">
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

        {/* Auth Section */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowLeaderboard(!showLeaderboard)}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors text-sm font-medium"
          >
            {showLeaderboard ? "Hide Leaderboard" : "🏆 Leaderboard"}
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

      {/* Leaderboard Section */}
      {showLeaderboard && (
        <div className="mb-8 max-w-6xl w-full mx-auto">
          <Leaderboard />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        {!showTest && !showResults && !showLeaderboard && (
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
