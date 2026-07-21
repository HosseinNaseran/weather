import { useState, useCallback, useRef, useEffect } from "react";
import "./App.css";
import Item from "./components/item.jsx"
import { getCurrentWeather } from "./services/api";
import type { WeatherData } from "./types/server";
import { searchCity } from "./services/geocoding";
import type { GeocodingResult } from "./services/geocoding";
import searchIcon from './Assets/images/search.svg'
import presureIcon from './Assets/images/presure.svg'
import tempIcon from './Assets/images/temp.svg'
import windIcon from './Assets/images/wind.svg'
import humidityIcon from './Assets/images/humidity.svg'
import sunriseIcon from './Assets/images/sunrise.svg'
import sunsetIcon from './Assets/images/sunset.svg'
import { useLanguage } from "./languages/languagesContext";
import { getWeatherIcon } from './components/weatherIcon';


interface CityOption {
  value: string;
  label: string;
}

function App() {
  const [weatherData, setWeatherData] = useState<WeatherData>();
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCity, setSelectedCity] = useState<CityOption | null>(null);

  const [searchInput, setSearchInput] = useState('');
  const [suggestions, setSuggestions] = useState<CityOption[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [typingTimeout, setTypingTimeout] = useState<number | null>(null);
  const searchWrapperRef = useRef<HTMLDivElement>(null);

  const { t, language, setLanguage } = useLanguage();


  const handleSearch = useCallback(async (value: string) => {
    if (!value || value.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);
    try {
      const cities = await searchCity(value);
      const options = cities.map((city: GeocodingResult) => ({
        value: JSON.stringify({
          lat: city.lat,
          lon: city.lon,
          name: city.name,
        }),
        label: city.name,
      }));
      setSuggestions(options.slice(0, 10));
      setShowSuggestions(options.length > 0);
    } catch (error) {
      console.error("Error searching:", error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    setSelectedIndex(-1);

    if (typingTimeout) clearTimeout(typingTimeout);
    const timeout = setTimeout(() => handleSearch(value), 500);
    setTypingTimeout(timeout);
  };

  const handleSelectSuggestion = async (selected: CityOption) => {
    setSearchInput(selected.label);
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedIndex(-1);

    const location = JSON.parse(selected.value);
    setIsLoading(true);
    setSelectedCity(selected);

    try {
      const result = await getCurrentWeather({
        lat: location.lat,
        lon: location.lon
      });
      setWeatherData(result);
    } catch (error) {
      console.error("Error fetching weather:", error);
      alert(t('error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSelectSuggestion(suggestions[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const highlightMatch = (text: string, query: string) => {
    if (!query || !text) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ?
        <strong key={index} style={{ color: '#38bdf8' }}>{part}</strong> :
        part
    );
  };

  const temp = weatherData?.main?.temp
    ? (weatherData.main.temp - 273.15).toFixed(1)
    : undefined;

  const calculateAirQuality = () => {
    if (!weatherData) return { value: 0, label: 'N/A' };

    const pressure = weatherData.main?.pressure || 1013;
    const humidity = weatherData.main?.humidity || 50;
    const tempValue = parseFloat(temp || '20');

    const pressureFactor = Math.min(100, Math.abs(pressure - 1013) * 0.3);
    const humidityFactor = humidity >= 40 && humidity <= 60 ? 0 :
      Math.min(100, Math.abs(humidity - 50) * 1.5);
    const tempFactor = tempValue >= 15 && tempValue <= 25 ? 0 :
      Math.min(100, Math.abs(tempValue - 20) * 4);

    let aqi = Math.round((pressureFactor + humidityFactor + tempFactor) / 3);
    aqi = Math.min(100, Math.max(0, aqi));

    let label;
    if (aqi <= 20) {
      label = t("excellent");
    } else if (aqi <= 40) {
      label = t("good");
    } else if (aqi <= 60) {
      label = t("moderate");
    } else if (aqi <= 80) {
      label = t("poor");
    } else {
      label = t("hazardous");
    }

    return { value: aqi, label };
  };

  const airQuality = calculateAirQuality();

  const formatNumber = (num: number | string) => {
    if (language !== 'fa') return num;
    const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
    return String(num).replace(/\d/g, (digit) => persianDigits[parseInt(digit)]);
  };

  return (
    <>
      <div className="container max-w-5xl px-6 py-8 mx-auto overflow-hidden">
        <div className="absolute rounded-full blur-3xl opacity-20 w-150 h-150 max-w-full -top-50 -left-25 bg-[radial-gradient(circle,rgba(0,212,255,1),transparent_70%)]"></div>
        <div className="absolute rounded-full blur-3xl opacity-20 w-87.5 h-87.5 max-w-full top-[90%] sm:top-[40%] sm:left-[40%] left-[10%] bg-[radial-gradient(circle,rgb(153,0,255),transparent_50%)]"></div>

        <header className="flex items-center w-full justify-between p-10 flex-col sm:flex-row gap-4">
          <h3 className="text-2xl font-semibold">
            {selectedCity ? selectedCity.label : t('cityName')}
          </h3>

          <div className="relative flex-1 min-w-70 max-w-sm group" ref={searchWrapperRef}>
            <div className="flex items-center gap-2 rounded-2xl px-4 py-3 bg-slate-900 backdrop-blur-xl border-gray-600 border">
              {isSearching ? (
                <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <img src={searchIcon} alt="search" className="w-5 h-5" />
              )}

              <input
                className="outline-none flex-1 bg-transparent text-sm font-medium tracking-wide"
                type="search"
                placeholder={t('searchPlaceholder')}
                value={searchInput}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  if (searchInput.trim() && suggestions.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                style={{
                  WebkitAppearance: 'none',
                  appearance: 'none'
                }}
              />
            </div>

            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute top-full left-0 right-0 mt-2 bg-slate-900 backdrop-blur-xl border border-gray-700 rounded-2xl overflow-hidden shadow-2xl z-50 max-h-60 overflow-y-auto">
                {suggestions.map((city, index) => (
                  <li
                    key={index}
                    onClick={() => handleSelectSuggestion(city)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`px-4 py-3 cursor-pointer transition-all duration-150 text-sm font-medium ${index === selectedIndex
                      ? 'bg-cyan-500/20 text-cyan-400'
                      : 'hover:bg-slate-800/50 text-gray-300'
                      } ${index < suggestions.length - 1 ? 'border-b border-gray-800' : ''}`}
                  >
                    {highlightMatch(city.label, searchInput)}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button className="bg-slate-600 px-4 py-2 rounded-2xl cursor-pointer active:bg-slate-800" onClick={() => setLanguage(language === 'en' ? 'fa' : 'en')}>
            {language === 'en' ? 'فارسی' : 'English'}
          </button>
        </header>

        <main>
          <div id="mainTop" className="bg-[linear-gradient(135deg,rgba(0,212,255,0.08),rgba(124,58,237,0.05))] rounded-3xl p-8 mb-6 relative overflow-hidden shadow-2xl transition-all border border-sky-950">
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_0%_0%,rgba(0,212,255,0.1),transparent_50%)]"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10">
              <div className="flex gap-10">
                <div>
                    {weatherData?.weather?.[0]?.icon && (
                    <img
                      src={getWeatherIcon(weatherData.weather[0].icon)}
                      alt={weatherData.weather[0].description}
                      className="w-24 h-24"
                    />
                  )}
                </div>
                <div>

                
               
                  <h1 className="font-bold text-8xl bg-linear-to-b from-white to-indigo-300 bg-clip-text text-transparent">
                    {temp ? formatNumber(temp) : '--'}
                  </h1>
                  <p className="text-cyan-400 text-xl font-medium text-shadow-cyan-400 [text-shadow:0_0_20px]">
                    {isLoading ? (
                      t('loading')
                    ) : (
                      weatherData?.weather?.[0]?.description
                        ? (language === 'fa'
                          ? t(weatherData.weather[0].description) || weatherData.weather[0].description
                          : weatherData.weather[0].description)
                        : '--'
                    )}
                  </p>
                </div>
              </div>
              <div>
                <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <Item
                    label={t("temp")}
                    image={tempIcon}
                    value={temp ? `${formatNumber(temp)}°` : '--'}
                  />
                  <Item
                    label={t("humidity")}
                    image={humidityIcon}
                    value={weatherData?.main?.humidity ? `${formatNumber(weatherData.main.humidity)}%` : '--'}
                  />
                  <Item
                    label={t("wind")}
                    image={windIcon}
                    value={weatherData?.wind?.speed ? `${formatNumber(weatherData.wind.speed)} m/s` : '--'}
                  />
                  <Item
                    label={t("pressure")}
                    image={presureIcon}
                    value={weatherData?.main?.pressure ? `${formatNumber(weatherData.main.pressure)} hPa` : '--'}
                  />
                  <Item
                    label={t("sunrise")}
                    image={sunriseIcon}
                    value={weatherData?.sys?.sunrise ?
                      new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString(
                        language === 'fa' ? 'fa-IR' : 'en-US',
                        { hour: '2-digit', minute: '2-digit' }
                      ) : '--'
                    }
                  />
                  <Item
                    label={t("sunset")}
                    image={sunsetIcon}
                    value={weatherData?.sys?.sunset ?
                      new Date(weatherData.sys.sunset * 1000).toLocaleTimeString(
                        language === 'fa' ? 'fa-IR' : 'en-US',
                        { hour: '2-digit', minute: '2-digit' }
                      ) : '--'
                    }
                  />
                </ul>
              </div>
            </div>
          </div>

          <div id="mainBottom" className="grid grid-cols-1 gap-6 mt-6">
            <div id="mainBottomLeft" className="rounded-3xl p-8 backdrop:blur-md bg-slate-900 border-1 border-gray-800">
              <p className="text-xs font-semibold mb-6">
                {t("airQuality")}
              </p>
              <div className="flex items-end gap-4 mb-5">
                <span className="text-6xl font-bold leading-none tracking-tighter text-emerald-400 [text-shadow:0_0px_20px_rgba(52,211,153,0.3)]">
                  {formatNumber(airQuality.value)}
                </span>
                <span className="text-xl font-medium mb-1.5 text-emerald-400">
                  {airQuality.label}
                </span>
              </div>

              <div className="relative h-2.5 rounded-full bg-slate-700 overflow-hidden mb-3">
                <div
                  className="absolute h-full rounded-full bg-[linear-gradient(90deg,rgb(52,211,153),rgb(251,191,36))] transition-all duration-700 ease-out"
                  style={{
                    width: `${airQuality.value}%`
                  }}
                ></div>
              </div>

              <div className="flex justify-between text-xs font-medium text-slate-500">
                <span>0 {t("excellent")}</span>
                <span>50 {t("moderate")}</span>
                <span>100 {t("hazardous")}</span>
              </div>
            </div>
          </div>
        </main>

        <footer className="mt-8 text-center">
          <p className="text-slate-500 text-sm">
            {t("footer")}
            <a className="text-emerald-400 [text-shadow:0_0_20px] hover:text-emerald-300 transition-colors ml-1" href="https://hosseinnaseran.github.io/Hossein">
              {t("joinUs")}
            </a>
          </p>
        </footer>
      </div>
    </>
  );
}

export default App;