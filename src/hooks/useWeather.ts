"use client";

import { useState, useEffect } from "react";
import { WeatherData } from "@/types";

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      },
      () => setLoading(false),
      { timeout: 8000 }
    );
  }, []);

  useEffect(() => {
    if (!coords) return;
    fetch(`/api/weather?lat=${coords.lat}&lon=${coords.lon}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setWeather(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [coords]);

  return { weather, loading, coords };
}
