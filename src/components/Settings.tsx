"use client";

interface Time {
  id: number;
  duration: number;
  label: string;
}

interface SettingsProps {
  selectedTime: number | null;
  selectedWordCount: number | null;
  selectedLanguage: string;
  onTimeChange: (duration: number) => void;
  onWordCountChange: (count: number) => void;
  onLanguageChange: (language: string) => void;
  times: Time[];
}

export default function Settings({
  selectedTime,
  selectedWordCount,
  selectedLanguage,
  onTimeChange,
  onWordCountChange,
  onLanguageChange,
  times,
}: SettingsProps) {
  const languages = [
    { code: "en", label: "English", flag: "🇬🇧" },
    { code: "es", label: "Spanish", flag: "🇪🇸" },
    { code: "fr", label: "French", flag: "🇫🇷" },
    { code: "de", label: "German", flag: "🇩🇪" },
    { code: "it", label: "Italian", flag: "🇮🇹" },
  ];

  const wordCounts = [
    { count: 50, label: "50" },
    { count: 100, label: "100" },
    { count: 150, label: "150" },
    { count: 200, label: "200" },
  ];

  return (
    <div className="w-full">
      <div className="flex flex-col gap-8">
        {/* Language Selection */}
        <div className="flex flex-col gap-3 items-center">
          <label className="text-sm text-gray-400 font-medium uppercase tracking-wider">
            🌍 Language
          </label>
          <div className="flex gap-3 flex-wrap justify-center">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => onLanguageChange(lang.code)}
                className={`px-5 py-2.5 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                  selectedLanguage === lang.code
                    ? "bg-yellow-400 text-gray-900 scale-105 shadow-lg"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:scale-105"
                }`}
              >
                <span className="text-xl">{lang.flag}</span>
                <span>{lang.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gray-700"></div>

        {/* Mode Toggle */}
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-3">Choose test mode:</p>
          <div className="flex gap-4 items-center justify-center">
            <span
              className={`font-medium text-lg ${
                selectedTime !== null ? "text-yellow-400" : "text-gray-500"
              }`}
            >
              Time Limit
            </span>
            <span className="text-gray-500 text-sm">or</span>
            <span
              className={`font-medium text-lg ${
                selectedWordCount !== null ? "text-yellow-400" : "text-gray-500"
              }`}
            >
              Word Limit
            </span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-center justify-center">
          {/* Time Selection */}
          <div className="flex flex-col gap-3 items-center">
            <label className="text-sm text-gray-400 font-medium">
              Time (seconds)
            </label>
            <div className="flex gap-3">
              {times.map((time) => (
                <button
                  key={time.id}
                  onClick={() => onTimeChange(time.duration)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                    selectedTime === time.duration
                      ? "bg-yellow-400 text-gray-900 scale-105 shadow-lg"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:scale-105"
                  }`}
                >
                  {time.label}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="hidden lg:block w-px h-20 bg-gray-700"></div>

          {/* Word Count Selection */}
          <div className="flex flex-col gap-3 items-center">
            <label className="text-sm text-gray-400 font-medium">Words</label>
            <div className="flex gap-3">
              {wordCounts.map((wc) => (
                <button
                  key={wc.count}
                  onClick={() => onWordCountChange(wc.count)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                    selectedWordCount === wc.count
                      ? "bg-yellow-400 text-gray-900 scale-105 shadow-lg"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:scale-105"
                  }`}
                >
                  {wc.count}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
