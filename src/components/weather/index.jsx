import React from 'react';
import useWeather from '../../hooks/useWeather';
import WeatherCard from '../weatherCard';

const WeatherWidget = () => {
  const { weather, loading, error } = useWeather('Kragerø');

  if (loading) return <p>Laster værdata...</p>;
  if (error) return <p>Feil: {error}</p>;

  return (
    <WeatherCard weather={weather}/>
  );
};

export default WeatherWidget;