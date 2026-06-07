import { useState, useCallback } from "react";
import "./App.css";
import { getCurrentWeather } from "./services/api";
import type { WeatherData } from "./types/server";
import Select from "react-select";
import { searchCity } from "./services/geocoding";
import type { GeocodingResult } from "./services/geocoding";

interface CityOption {
  value: string;
  label: string;
}

function App() {
  const [weatherData, setWeatherData] = useState<WeatherData>();
  const [isPersian, setIsPersian] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<CityOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCity, setSelectedCity] = useState<CityOption | null>(null);
  const [typingTimeout, setTypingTimeout] = useState<number | null>(null); 

  // جستجو با دبه‌ونس
  const handleSearch = useCallback(async (value: string) => {
    if (!value || value.length < 2) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    const cities = await searchCity(value);
    
    const options = cities.map((city: GeocodingResult) => ({
      value: JSON.stringify({
        lat: city.lat,
        lon: city.lon,
        name: city.name,
        iname: city.local_names?.fa || city.name,
      }),
      label: isPersian 
        ? (city.local_names?.fa || city.name) 
        : city.name,
    }));
    
    setSearchResults(options);
    setIsSearching(false);
  }, [isPersian]);

  const onInputChange = (value: string) => {
    if (typingTimeout) clearTimeout(typingTimeout);
    const timeout = setTimeout(() => handleSearch(value), 500);
    setTypingTimeout(timeout);
  };

  const handleCityChange = async (selected: CityOption | null) => {
    if (!selected) {
      setWeatherData(undefined);
      setSelectedCity(null);
      return;
    }
    
    const location = JSON.parse(selected.value);
    setIsLoading(true);
    setSelectedCity(selected);
    
    try {
      const result = await getCurrentWeather({ 
        lat: location.lat, 
        lon: location.lon 
      });
      setWeatherData(result);
      console.log(result);
    } catch (error) {
      console.error("خطا در دریافت آب و هوا:", error);
      alert(isPersian ? "خطا در دریافت اطلاعات" : "Error fetching weather");
    } finally {
      setIsLoading(false);
    }
  };

  const temp = weatherData?.main?.temp 
    ? (weatherData.main.temp - 273.15).toFixed(1) 
    : undefined;

  return (
    <div className="container">
      {weatherData && <span className="shape"></span>}
      
      <div className="weather-items-container">
        {isPersian ? <h1>هواشناسی</h1> : <h1>weather app</h1>}

        {isLoading && <div className="loading">{isPersian ? "در حال بارگذاری..." : "Loading..."}</div>}

        {weatherData && !isLoading && (
          <>
            <div className="weather-items">
              <div className="weather-item">
                {isPersian ? (
                  <div>
                    <h2>فشار هوا :</h2>
                    <span>{weatherData?.main?.pressure} hPa</span>
                  </div>
                ) : (
                  <div>
                    <h2>pressure :</h2>
                    <span>{weatherData?.main?.pressure} hPa</span>
                  </div>
                )}
              </div>
              <div className="weather-item">
                {isPersian ? (
                  <div>
                    <h2>دمای هوا :</h2>
                    <span>{temp}°C</span>
                  </div>
                ) : (
                  <div>
                    <h2>temp :</h2>
                    <span>{temp}°C</span>
                  </div>
                )}
              </div>
              <div className="weather-item">
                {isPersian ? (
                  <div>
                    <h2>سرعت باد :</h2>
                    <span>{weatherData?.wind?.speed} m/s</span>
                  </div>
                ) : (
                  <div>
                    <h2>wind speed :</h2>
                    <span>{weatherData?.wind?.speed} m/s</span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        <div className="weather-buttons">
          {isPersian ? (
            <button onClick={() => setIsPersian(false)}>English</button>
          ) : (
            <button onClick={() => setIsPersian(true)}>فارسی</button>
          )}

          <Select
            options={searchResults}
            onInputChange={onInputChange}
            onChange={handleCityChange}
            value={selectedCity}
            isLoading={isSearching}
            isSearchable
            isClearable
            menuPlacement="top"
            maxMenuHeight={150}
            placeholder={isPersian ? "نام شهر را بنویسید..." : "Type city name..."}
            noOptionsMessage={({ inputValue }) => 
              !inputValue ? (isPersian ? "تایپ کنید..." : "Start typing...") :
              isPersian ? "شهری یافت نشد" : "No city found"
            }
            classNamePrefix="custom-select"
            className="city-select"
          />
        </div>
      </div>
    </div>
  );
}

export default App;