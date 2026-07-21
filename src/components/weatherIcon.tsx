import clearDay from '../Assets/icons/clear-day.png';
import clearNight from '../Assets/icons/clear night.png';
import partlyCloudyDay from '../assets/icons/partly_cloudy_day.png';
import partlyCloudyNight from '../assets/icons/partly_cloudy_night.png';
import cloudy from '../Assets/icons/cloudy.png';
import rain from '../Assets/icons/rain.png';
import storm from '../Assets/icons/cloud_lightning.png';
import snow from '../Assets/icons/snow.png';
import fog from '../Assets/icons/fog.png';
import showerRain from "../Assets/icon/heavy_rain.png"



const iconMap: Record<string, string> = {
  '01d': clearDay,
  '01n': clearNight,
  '02d': partlyCloudyDay,
  '02n': partlyCloudyNight,
  '03d': cloudy,
  '03n': cloudy,
  '04d': cloudy,
  '04n': cloudy,
  '09d': showerRain,
  '09n': showerRain,
  '10d': rain,
  '10n': rain,
  '11d': storm,
  '11n': storm,
  '13d': snow,
  '13n': snow,
  '50d': fog,
  '50n': fog,
};

export const getWeatherIcon = (iconCode: string) => {
  return iconMap[iconCode] || clearDay;
};