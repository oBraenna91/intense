import { useState, useEffect } from 'react';

const useForecast = (latitude, longitude) => {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchForecast = async () => {
      setLoading(true);
      setError(null);

      try {
        const apiKey = '44c2349dcaabc656ed2cb246a80f6419';
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&lang=no&appid=${apiKey}`
        );

        if (!response.ok) {
          throw new Error('Kunne ikke hente værmelding');
        }

        const data = await response.json();

        // Tilpass dataene til det du trenger
        const formattedData = data.list.map((item) => ({
          dateTime: item.dt_txt, 
          temp: Math.round(item.main.temp), 
          description: item.weather[0].description, 
          icon: `http://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`,
        }));

        setForecast(formattedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchForecast();
  }, [latitude, longitude]);

  return { forecast, loading, error };
};

export default useForecast;
