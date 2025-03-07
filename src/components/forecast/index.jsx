import React from 'react';
import useForecast from '../../hooks/useWeatherForecast';
import './forecast.module.scss';

const ForecastWidget = () => {
  
  const { forecast, loading, error } = useForecast(58.8691, 9.4145);

  if (loading) return <p>Laster værmelding...</p>;
  if (error) return <p>Feil: {error}</p>;

  return (
    <div className="forecast-widget">
      <h3>5-dagers værmelding</h3>
      <div className="forecast-grid">
        {forecast.slice(0, 15).map((item, index) => (
          <div key={index} className="forecast-item">
            <p>{new Date(item.dateTime).toLocaleString()}</p>
            <img src={item.icon} alt={item.description} />
            <p>{item.temp}°C</p>
            <p>{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ForecastWidget;
