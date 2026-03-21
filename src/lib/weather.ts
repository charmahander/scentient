import { WeatherData } from "@/types";

export async function getWeather(lat: number, lon: number): Promise<WeatherData | null> {
  const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    const data = await res.json();

    return {
      temp: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      description: data.weather[0].description,
      main: data.weather[0].main,
      windSpeed: Math.round(data.wind.speed),
      city: data.name,
      country: data.sys.country,
      icon: data.weather[0].icon,
    };
  } catch {
    return null;
  }
}
