import { useState, useEffect } from 'react';

const useWeather = (location = 'Kragerø') => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      setError(null);

      try {
        const apiKey = '44c2349dcaabc656ed2cb246a80f6419';
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&lang=no&appid=${apiKey}`
        );

        if (!response.ok) {
          throw new Error('Kunne ikke hente værdata');
        }

        const data = await response.json();
        console.log(data);
        setWeather({
          location: data.name,
          main: data.weather[0].main,
          feels_like: data.main.feels_like,
          highest: data.main.temp_max,
          lowest: data.main.temp_min,
          description: data.weather[0].description,
          temp: Math.round(data.main.temp),
          windSpeed: data.wind.speed,
          windDir: data.wind.deg,
          icon: `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [location]);

  return { weather, loading, error };
};

export default useWeather;