import { useState } from "react";
import "./App.css";
import { getCurrentWeather } from "./services/api";
import type { WeatherData } from "./types/server";

interface locationType {
  id: number;
  name: string;
  lat: string;
  lon: string;
}

const cities = [
  { id: 1, name: "Tehran", lat: "35.7219", lon: "51.3347" },
  { id: 2, name: "ahvaz", lat: "31.3183", lon: "48.6706" },
  { id: 3, name: "yasd", lat: "31.8974", lon: "54.3569" },
];

function App() {

  const [weatherData , setWeatherData] = useState<WeatherData>();


  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    const location:locationType = JSON.parse(value);
    getCurrentWeather({ lat: location.lat, lon: location.lon }).then(result=>{
      setWeatherData(result)
      
    });
  };

  return (
    <>
      <h1>weather app</h1>

      <select onChange={handleChange}>
        {cities.map((item) => (
          <option key={item.id} value={JSON.stringify(item)}>
            {item.name}
          </option>
        ))}
      </select>
    </>
  );
}

export default App;
