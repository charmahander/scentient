"use client";

import { useState, useEffect } from "react";
import { Cloud, Wind, Droplets, Thermometer, Sparkles, ChevronRight, Star } from "lucide-react";
import { useCollection } from "@/hooks/useCollection";
import { useWeather } from "@/hooks/useWeather";
import { DailyRecommendation, WeatherData } from "@/types";
import { NoteTag } from "@/components/shared/NoteTag";
import { MoodPicker } from "@/components/today/MoodPicker";
import { parseJson } from "@/lib/utils";
import Link from "next/link";

function WeatherWidget({ weather }: { weather: WeatherData }) {
  const iconUrl = `https://openweathermap.org/img/wn/${weather.icon}@2x.png`;

  return (
    <div
      className="p-4 rounded-2xl mb-4 flex items-center gap-4"
      style={{
        background: "linear-gradient(135deg, rgba(96,165,250,0.15), rgba(59,130,246,0.05))",
        border: "1px solid rgba(96,165,250,0.2)",
      }}
    >
      <img src={iconUrl} alt={weather.description} className="w-14 h-14" />
      <div className="flex-1">
        <p className="font-semibold">{weather.city}, {weather.country}</p>
        <p className="text-sm capitalize" style={{ color: "var(--foreground-muted)" }}>{weather.description}</p>
        <div className="flex items-center gap-3 mt-1">
          <span className="flex items-center gap-1 text-xs" style={{ color: "var(--foreground-muted)" }}>
            <Thermometer size={11} /> {weather.temp}°F
          </span>
          <span className="flex items-center gap-1 text-xs" style={{ color: "var(--foreground-muted)" }}>
            <Droplets size={11} /> {weather.humidity}%
          </span>
          <span className="flex items-center gap-1 text-xs" style={{ color: "var(--foreground-muted)" }}>
            <Wind size={11} /> {weather.windSpeed}mph
          </span>
        </div>
      </div>
    </div>
  );
}

function RecommendationCard({ rec, rank }: { rec: DailyRecommendation; rank: number }) {
  const { fragrance, score, reasoning, weatherMatch } = rec;
  const accords = parseJson<string[]>(fragrance.accords, []);

  return (
    <div
      className="p-4 rounded-2xl mb-3 relative overflow-hidden"
      style={{
        background: rank === 0
          ? "linear-gradient(135deg, rgba(201,169,110,0.12), rgba(201,169,110,0.04))"
          : "var(--surface-2)",
        border: `1px solid ${rank === 0 ? "rgba(201,169,110,0.3)" : "var(--border)"}`,
      }}
    >
      {rank === 0 && (
        <div
          className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
          style={{ background: "var(--accent)", color: "#09090b" }}
        >
          <Sparkles size={10} /> Top Pick
        </div>
      )}

      <div className="flex items-start gap-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold shrink-0"
          style={{ background: "var(--surface-3)", color: "var(--accent)" }}
        >
          {fragrance.brand[0]}
        </div>
        <div className="flex-1 min-w-0 pr-16">
          <p className="font-bold text-base leading-tight">{fragrance.name}</p>
          <p className="text-sm" style={{ color: "var(--accent)" }}>{fragrance.brand}</p>
          {fragrance.rating && (
            <p className="flex items-center gap-1 text-xs mt-0.5" style={{ color: "#fbbf24" }}>
              <Star size={10} fill="currentColor" /> {fragrance.rating.toFixed(1)}
            </p>
          )}
        </div>
      </div>

      {accords.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {accords.slice(0, 3).map((a) => (
            <NoteTag key={a} name={a} family={a} />
          ))}
        </div>
      )}

      <p className="text-xs mt-2 leading-relaxed" style={{ color: "var(--foreground-muted)" }}>
        {weatherMatch.length > 0
          ? `${weatherMatch[0].charAt(0).toUpperCase() + weatherMatch[0].slice(1)}.`
          : reasoning}
      </p>

      <div className="mt-3 flex items-center gap-2">
        <div className="flex-1 h-1 rounded-full" style={{ background: "var(--surface-3)" }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${score}%`,
              background: rank === 0 ? "var(--accent)" : "var(--foreground-subtle)",
            }}
          />
        </div>
        <span className="text-xs" style={{ color: "var(--foreground-subtle)" }}>{score}% match</span>
      </div>
    </div>
  );
}

export default function TodayPage() {
  const { fragrances } = useCollection();
  const { weather, loading: weatherLoading, coords } = useWeather();
  const [recommendations, setRecommendations] = useState<DailyRecommendation[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  const now = new Date();
  const greeting =
    now.getHours() < 12 ? "Good morning" : now.getHours() < 18 ? "Good afternoon" : "Good evening";
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    const url = coords
      ? `/api/recommendations/daily?lat=${coords.lat}&lon=${coords.lon}`
      : "/api/recommendations/daily";
    setLoadingRecs(true);
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (data.recommendations) setRecommendations(data.recommendations);
      })
      .catch(() => {})
      .finally(() => setLoadingRecs(false));
  }, [coords]);

  const owned = fragrances.filter((f) => f.owned);

  return (
    <div className="px-5 pt-12 pb-4" style={{ background: "var(--background)", minHeight: "100vh" }}>
      {/* Greeting */}
      <div className="mb-6">
        <p className="text-sm font-medium" style={{ color: "var(--accent)" }}>{dateStr}</p>
        <h1 className="text-3xl font-bold tracking-tight leading-tight">
          {greeting},<br />
          <span className="gradient-text">Scentient</span>
        </h1>
        {owned.length > 0 && (
          <p className="text-sm mt-1" style={{ color: "var(--foreground-muted)" }}>
            {owned.length} fragrances in your collection
          </p>
        )}
      </div>

      {/* Weather widget */}
      {weather && <WeatherWidget weather={weather} />}
      {weatherLoading && (
        <div
          className="p-4 rounded-2xl mb-4 flex items-center gap-3"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
        >
          <div
            className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: "var(--foreground-subtle)", borderTopColor: "transparent" }}
          />
          <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>Getting your local weather...</p>
        </div>
      )}
      {!weather && !weatherLoading && (
        <div
          className="p-4 rounded-2xl mb-4 flex items-center gap-3"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
        >
          <Cloud size={20} style={{ color: "var(--foreground-subtle)" }} />
          <div>
            <p className="text-sm font-medium">Weather unavailable</p>
            <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>
              Allow location access for weather-based picks
            </p>
          </div>
        </div>
      )}

      {/* Daily Recommendations */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold">
            {weather ? `Wear Today in ${weather.city}` : "Top Picks Today"}
          </h2>
          <Link href="/collection" className="flex items-center gap-1 text-xs" style={{ color: "var(--accent)" }}>
            Collection <ChevronRight size={12} />
          </Link>
        </div>

        {loadingRecs && (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-24 rounded-2xl animate-pulse"
                style={{ background: "var(--surface-2)" }}
              />
            ))}
          </div>
        )}

        {recommendations.map((rec, i) => (
          <RecommendationCard key={rec.fragrance.id} rec={rec} rank={i} />
        ))}

        {!loadingRecs && recommendations.length === 0 && owned.length === 0 && (
          <div className="text-center py-10" style={{ color: "var(--foreground-muted)" }}>
            <p className="text-sm">Your collection is empty.</p>
            <Link
              href="/collection"
              className="mt-2 inline-block text-sm font-semibold"
              style={{ color: "var(--accent)" }}
            >
              Add your first fragrance →
            </Link>
          </div>
        )}
      </div>

      {/* Mood / on-demand pick */}
      <MoodPicker ownedCount={owned.length} />

      {/* Vibe CTA — inspired by Corner's vibe search */}
      <Link
        href="/chat"
        className="block p-4 rounded-2xl mb-4"
        style={{
          background: "linear-gradient(135deg, rgba(201,169,110,0.12), rgba(201,169,110,0.04))",
          border: "1px solid rgba(201,169,110,0.25)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "var(--accent-glow)" }}
          >
            <Sparkles size={18} style={{ color: "var(--accent)" }} />
          </div>
          <div>
            <p className="font-semibold text-sm">Ask your advisor</p>
            <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>
              &ldquo;What should I wear for a romantic dinner?&rdquo; →
            </p>
          </div>
        </div>
      </Link>

      {/* Top accords */}
      {owned.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold">Your Top Accords</h2>
            <Link href="/explore" className="text-xs" style={{ color: "var(--accent)" }}>
              Full profile →
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {Array.from(
              owned.reduce((acc, f) => {
                parseJson<string[]>(f.accords, []).forEach((a) =>
                  acc.set(a.toLowerCase(), (acc.get(a.toLowerCase()) ?? 0) + 1)
                );
                return acc;
              }, new Map<string, number>())
            )
              .sort((a, b) => b[1] - a[1])
              .slice(0, 6)
              .map(([accord]) => (
                <NoteTag key={accord} name={accord} family={accord} size="md" />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
