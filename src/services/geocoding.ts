// src/services/geocoding.ts
import axios from "axios";

const APIKey = "c6f036809400e39a383c8654b49b6448";

export interface GeocodingResult {
  name: string;
  local_names?: {
    fa?: string;
    [key: string]: string | undefined;
  };
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

export async function searchCity(query: string): Promise<GeocodingResult[]> {
  if (!query || query.length < 2) return [];
  
  const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${APIKey}`;
  
  try {
    const response = await axios.get(url);
    // فقط شهرهای ایران
    const iranianCities = response.data.filter((city: GeocodingResult) => city.country === "IR");
    return iranianCities;
  } catch (error) {
    console.error("خطا در جستجوی شهر:", error);
    return [];
  }
}