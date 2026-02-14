import { useState } from "react";
import "./App.css";
import { getCurrentWeather } from "./services/api";
import type { WeatherData } from "./types/server";
import type { LocationType } from "./types/city";
import { cities } from "./data/cities";

function App() {
  const [weatherData, setWeatherData] = useState<WeatherData>();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    const location: LocationType = JSON.parse(value);
    getCurrentWeather({ lat: location.lat, lon: location.lon }).then(
      (result) => {
        setWeatherData(result);
        console.log(result);

      },
    );
  };
  const [isPersian, setIsPersian] = useState(false);

  return (
    <>
      {isPersian ?
        <button onClick={() => setIsPersian(false)}>English</button>
        :
        <button onClick={() => setIsPersian(true)}>فارسی</button>
      }
     {isPersian ? <h1>هواشناسی</h1> : <h1>weather app</h1>}

      {isPersian ?   <h2>فشار هوا : {weatherData?.main.pressure}</h2>:<h2>presure : {weatherData?.main.pressure}</h2>}
      {isPersian ?  <h2>دمای هوا :{weatherData?.main.temp}</h2>:<h2> temp :{weatherData?.main.temp}</h2> }
      {isPersian ? <h2>سرعت باد :{weatherData?.wind.speed}</h2> : <h2>wind speed :{weatherData?.wind.speed}</h2>}

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
