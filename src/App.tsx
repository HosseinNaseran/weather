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
  const temp = weatherData?.main.temp ? weatherData.main.temp - 273.15 : undefined;
  return (
    <div className="weather-items-container">
     
     
     {isPersian ? <h1>هواشناسی</h1> : <h1>weather app</h1>}
    
    
      <div className="weather-items">

      <div className="weather-item">

        {isPersian ? <div><h2>فشار هوا   :</h2><span> {weatherData?.main.pressure}</span> </div>:
        <div> <h2>presure :</h2> <span>{weatherData?.main.pressure}</span> </div>}
      </div>
      <div className="weather-item">

        {isPersian ? <div><h2>دمای هوا : </h2> <span>{temp?.toFixed()}°C</span></div>
        : <div><h2> temp : </h2><span>{temp?.toFixed()}°C</span></div>}
      </div>
      <div className="weather-item">

        {isPersian ? <div><h2>سرعت باد :</h2> <span>{weatherData?.wind.speed}</span></div>
        : <div><h2>wind speed :</h2><span>{weatherData?.wind.speed}</span></div>}
      </div>

      </div>

      <div className="weather-buttons">

 {isPersian ?
        <button onClick={() => setIsPersian(false)}>English</button>
        :
        <button onClick={() => setIsPersian(true)}>فارسی</button>
      }

      <select onChange={handleChange}>
        {cities.map((item) => (
          <option key={item.id} value={JSON.stringify(item)}>
            {isPersian ? item.Iname : item.Ename}
          </option>
        ))}
      </select>
    </div>
      </div>
  );
}

export default App;
