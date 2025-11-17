"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import TypingTest from "@/components/TypingTest";
import Settings from "@/components/Settings";
import Results from "@/components/Results";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/contexts/AuthContext";

interface Time {
  id: number;
  duration: number;
  label: string;
}

export default function HomePage() {
  const { user, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [times, setTimes] = useState<Time[]>([]);
  const [sentences, setSentences] = useState<string[]>([]);
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

  // Load sentences based on selected word count or default to 50
  useEffect(() => {
    const wordCount = selectedWordCount || 50;
    fetch(`/data/${wordCount}words.json`)
      .then((res) => res.json())
      .then((data) => setSentences(data))
      .catch((err) => console.error("Error loading sentences:", err));
  }, [selectedWordCount]);

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
          {user ? (
            <>
              <span className="text-sm text-gray-400">Welcome, {user.name}</span>
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
      <div className="flex-1 flex flex-col items-center justify-center">
        {!showTest && !showResults && (
          <>
            <Settings
              selectedTime={selectedTime}
              selectedWordCount={selectedWordCount}
              onTimeChange={handleTimeChange}
              onWordCountChange={handleWordCountChange}
              times={times}
            />
            <button
              onClick={handleStartTest}
              className="px-8 py-4 bg-yellow-400 text-gray-900 font-bold rounded-lg hover:bg-yellow-500 transition-colors text-xl"
            >
              Start Test
            </button>
          </>
        )}

        {showTest && sentences.length > 0 && (
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
        )}

        {showResults && (
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
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
