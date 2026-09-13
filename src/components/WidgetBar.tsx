import { Cloud, CloudLightning, CloudRain, Moon, Sun } from "lucide-react";

type PrayerTimes = { Fajr: string; Dhuhr: string; Asr: string; Maghrib: string; Isha: string };
type Weather = { temp: number; condition: string; icon: "sun" | "cloud" | "rain" | "lightning" };

async function getWidgetData(): Promise<{ prayer: PrayerTimes | null; weather: Weather | null }> {
  try {
    const [prayerResponse, weatherResponse] = await Promise.all([
      fetch("https://api.aladhan.com/v1/timingsByCity?city=Gunung%20Putri&country=Indonesia&method=11", { next: { revalidate: 3600 } }),
      fetch("https://api.open-meteo.com/v1/forecast?latitude=-6.469&longitude=106.989&current_weather=true", { next: { revalidate: 900 } }),
    ]);
    const prayerJson = prayerResponse.ok ? await prayerResponse.json() as { data: { timings: PrayerTimes } } : null;
    const weatherJson = weatherResponse.ok ? await weatherResponse.json() as { current_weather: { temperature: number; weathercode: number } } : null;
    const code = weatherJson?.current_weather.weathercode ?? 0;
    const weather: Weather | null = weatherJson ? code >= 95 ? { temp: weatherJson.current_weather.temperature, condition: "Badai petir", icon: "lightning" } : code >= 51 ? { temp: weatherJson.current_weather.temperature, condition: "Hujan", icon: "rain" } : code >= 1 ? { temp: weatherJson.current_weather.temperature, condition: "Berawan", icon: "cloud" } : { temp: weatherJson.current_weather.temperature, condition: "Cerah", icon: "sun" } : null;
    return { prayer: prayerJson?.data.timings ?? null, weather };
  } catch {
    return { prayer: null, weather: null };
  }
}

function WeatherIcon({ icon }: { icon: Weather["icon"] }) {
  if (icon === "cloud") return <Cloud aria-hidden="true" className="size-4" />;
  if (icon === "rain") return <CloudRain aria-hidden="true" className="size-4" />;
  if (icon === "lightning") return <CloudLightning aria-hidden="true" className="size-4" />;
  return <Sun aria-hidden="true" className="size-4" />;
}

export default async function WidgetBar() {
  const { prayer, weather } = await getWidgetData();
  if (!prayer && !weather) return null;
  return <aside aria-label="Informasi harian" className="border-t border-emerald-900 bg-emerald-950 px-5 py-4 text-xs text-emerald-100"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 sm:flex-row">{prayer ? <p className="flex flex-wrap items-center gap-x-3 gap-y-1"><Moon aria-hidden="true" className="size-4 text-emerald-300" /><strong>Jadwal salat</strong><span>Subuh {prayer.Fajr}</span><span>Dzuhur {prayer.Dhuhr}</span><span>Ashar {prayer.Asr}</span><span>Maghrib {prayer.Maghrib}</span><span>Isya {prayer.Isha}</span></p> : null}{weather ? <p className="flex items-center gap-2"><WeatherIcon icon={weather.icon} /><strong>{weather.condition}</strong><span>{weather.temp}°C</span></p> : null}</div></aside>;
}
