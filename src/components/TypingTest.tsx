"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface TypingTestProps {
  sentences: string[];
  duration: number;
  onComplete: (
    wpm: number,
    accuracy: number,
    correctChars: number,
    incorrectChars: number
  ) => void;
  onReset: () => void;
  mode: "time" | "words";
  limit: number;
}

export default function TypingTest({
  sentences,
  duration,
  onComplete,
  onReset,
  mode,
  limit,
}: TypingTestProps) {
  // Generate random text from sentences using useState with initial value
  const [text] = useState(() => {
    const shuffled = [...sentences].sort(() => 0.5 - Math.random());
    return shuffled.join(" ");
  });

  const [userInput, setUserInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const calculateResults = useCallback(() => {
    const typedChars = userInput.length;
    const correctChars = userInput
      .split("")
      .filter((char, index) => char === text[index]).length;
    const incorrectChars = typedChars - correctChars;
    const accuracy = typedChars > 0 ? (correctChars / typedChars) * 100 : 0;
    const timeElapsed = (duration - timeLeft) / 60; // in minutes
    const wordsTyped = typedChars / 5; // Standard: 5 chars = 1 word
    const wpm = timeElapsed > 0 ? Math.round(wordsTyped / timeElapsed) : 0;

    onComplete(wpm, accuracy, correctChars, incorrectChars);
  }, [userInput, text, duration, timeLeft, onComplete]);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            setIsActive(false);
            setIsFinished(true);
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  // Trigger results when finished
  useEffect(() => {
    if (isFinished) {
      calculateResults();
    }
  }, [isFinished, calculateResults]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Start timer on first keypress
    if (!isActive && !isFinished) {
      setIsActive(true);
    }

    setUserInput(value);

    // Check if user completed the text
    if (value.length >= text.length) {
      setIsActive(false);
      setIsFinished(true);
    }
  };

  const handleRestart = () => {
    setUserInput("");
    setTimeLeft(duration);
    setIsActive(false);
    setIsFinished(false);
    onReset();
    inputRef.current?.focus();
  };

  const getCharacterColor = (index: number) => {
    if (index >= userInput.length) return "text-gray-500";
    if (userInput[index] === text[index]) return "text-green-400";
    return "text-red-400";
  };

  return (
    <div className="w-full p-6 bg-gray-800 rounded-lg shadow-xl">
      {/* Mode Display */}
      <div className="mb-6 text-center">
        <div className="text-sm text-gray-400 mb-2 uppercase tracking-wider">
          Test Mode
        </div>
        <div className="text-xl font-semibold text-yellow-400">
          {mode === "time" ? `${limit} seconds` : `${limit} words`}
        </div>
      </div>

      {/* Timer Display - Only show for time-based tests */}
      {mode === "time" && (
        <div className="mb-6 text-center">
          <div
            className={`text-6xl font-bold transition-colors ${
              timeLeft <= 10 ? "text-red-400" : "text-yellow-400"
            }`}
          >
            {timeLeft}s
          </div>
        </div>
      )}

      {/* Text Display */}
      <div className="bg-gray-900 rounded-lg p-8 mb-6 min-h-[250px] max-h-[400px] overflow-y-auto text-2xl leading-relaxed wrap-break-word border border-gray-700">
        {text.split("").map((char, index) => (
          <span key={index} className={getCharacterColor(index)}>
            {char}
          </span>
        ))}
      </div>

      {/* Input Field */}
      <input
        ref={inputRef}
        type="text"
        value={userInput}
        onChange={handleInputChange}
        disabled={isFinished}
        className="w-full p-5 text-xl bg-gray-700 text-white rounded-lg border-2 border-gray-600 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        placeholder="Start typing here..."
        autoFocus
      />

      {/* Restart Button */}
      <div className="mt-6 text-center">
        <button
          onClick={handleRestart}
          className="px-8 py-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-all hover:scale-105"
        >
          ↻ Restart Test
        </button>
      </div>
    </div>
  );
}
