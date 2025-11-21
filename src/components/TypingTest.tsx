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
  const [isPaused, setIsPaused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastTypingTimeRef = useRef<number>(Date.now());
  const textDisplayRef = useRef<HTMLDivElement>(null);
  const currentCharRef = useRef<HTMLSpanElement>(null);

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

    if (isActive && timeLeft > 0 && !isPaused) {
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
  }, [isActive, timeLeft, isPaused]);

  // AFK detection - pause after 5 seconds of inactivity
  useEffect(() => {
    let afkCheckInterval: NodeJS.Timeout | null = null;

    if (isActive && !isFinished) {
      afkCheckInterval = setInterval(() => {
        const timeSinceLastTyping = Date.now() - lastTypingTimeRef.current;
        if (timeSinceLastTyping >= 5000 && !isPaused) {
          setIsPaused(true);
        }
      }, 1000);
    }

    return () => {
      if (afkCheckInterval) clearInterval(afkCheckInterval);
    };
  }, [isActive, isFinished, isPaused]);

  // Trigger results when finished
  useEffect(() => {
    if (isFinished) {
      calculateResults();
    }
  }, [isFinished, calculateResults]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Update last typing time and resume if paused
    lastTypingTimeRef.current = Date.now();
    if (isPaused) {
      setIsPaused(false);
    }

    // Start timer on first keypress
    if (!isActive && !isFinished) {
      setIsActive(true);
    }

    setUserInput(value);

    // Auto-scroll to keep cursor in view
    if (currentCharRef.current && textDisplayRef.current) {
      const charElement = currentCharRef.current;
      const container = textDisplayRef.current;
      const charRect = charElement.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      
      // Check if current character is near the bottom (last line visible)
      const isNearBottom = charRect.bottom > containerRect.bottom - 60;
      
      if (isNearBottom) {
        // Scroll by one line height (approximately 3rem = 48px for text-2xl with leading-relaxed)
        container.scrollTop += 48;
      }
    }

    // Check if user completed the text
    if (value.length >= text.length) {
      setIsActive(false);
      setIsFinished(true);
    }
  };

  const handleResume = () => {
    setIsPaused(false);
    lastTypingTimeRef.current = Date.now();
    inputRef.current?.focus();
  };

  const handleRestart = () => {
    setUserInput("");
    setTimeLeft(duration);
    setIsActive(false);
    setIsFinished(false);
    setIsPaused(false);
    lastTypingTimeRef.current = Date.now();
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
          {isPaused && (
            <div className="mt-3 text-orange-400 font-semibold animate-pulse">
              ⏸️ Paused - Start typing to resume
            </div>
          )}
        </div>
      )}

      {/* AFK Pause Warning for word mode */}
      {mode === "words" && isPaused && (
        <div className="mb-6 text-center">
          <div className="text-orange-400 font-semibold animate-pulse text-xl">
            ⏸️ Paused - Start typing to resume
          </div>
        </div>
      )}

      {/* Text Display */}
      <div 
        ref={textDisplayRef}
        className="bg-gray-900 rounded-lg p-8 mb-6 h-60 overflow-hidden text-2xl leading-relaxed wrap-break-word border border-gray-700"
        style={{ lineHeight: '3rem' }}
      >
        {text.split("").map((char, index) => (
          <span 
            key={index}
            ref={index === userInput.length ? currentCharRef : null}
          >
            {index === userInput.length && isActive && (
              <span className="text-yellow-400 animate-pulse">|</span>
            )}
            <span className={getCharacterColor(index)}>
              {char}
            </span>
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
        className={`w-full p-5 text-xl bg-gray-700 text-white rounded-lg border-2 ${
          isPaused ? 'border-orange-400' : 'border-gray-600'
        } focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
        placeholder={isPaused ? "Click here or start typing to resume..." : "Start typing here..."}
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
