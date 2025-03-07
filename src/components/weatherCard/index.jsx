import React from 'react';
import WeatherAnimation from '../weatherAnimations';
import styles from './styles.module.scss';
import Arrow from '../../visuals/icons/down-arrow.png';
import Image from 'react-bootstrap/Image';

const WeatherCard = ({ weather }) => {
  const { main, description, temp, feels_like, highest, lowest, windDir } = weather;

  const capitalizeFirstLetter = (text) => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  const backgroundStyle = {
    Clear: 'linear-gradient(135deg, #6dd5ed, #fff)', // Solskinn
    Clouds: 'linear-gradient(135deg, #757f9a, #d7dde8)', // Skyer
    Rain: 'linear-gradient(135deg, #3a7bd5, #00d2ff)', // Regn
    Snow: 'linear-gradient(135deg, #83a4d4, #b6fbff)', // Snø
    Drizzle: 'linear-gradient(135deg, #89f7fe, #66a6ff)', // Yr
    Thunderstorm: 'linear-gradient(135deg, #373b44, #4286f4)', // Torden
    Default: 'linear-gradient(135deg, #6dd5ed, #fff)', // Standard bakgrunn
  };

  const gradient = backgroundStyle[main] || backgroundStyle['Default'];

  return (
    <div className={`${styles.weatherCard} col-10 d-flex flex-column text-center rounded-5 p-3 shadow`} style={{ background: gradient }}>
      <div className="col-12">
        <WeatherAnimation weatherType={main} />
      </div>
      <div className={styles.subDiv}>
        <WindDirection windDir={windDir} />
        <div className={styles.header}>{capitalizeFirstLetter(description)}</div>
        <div className={styles.header}>{Math.round(temp)}°C</div>
        <div className={styles.sub}>Føles som: {Math.round(feels_like)}°C</div>
        <div className={styles.sub}>H : {Math.round(highest)}°C / L : {Math.round(lowest)}°C</div>
      </div>
    </div>
  );
};

export default WeatherCard;

const getWindDirection = (degree) => {
    const directions = [
      'N', 'NØ', 'Ø', 'SØ', 'S', 'SV', 'V', 'NV', 'N',
    ];
    const index = Math.round(degree / 45) % 8;
    return directions[index];
  };
  
  const WindDirection = ({ windDir }) => {
    const direction = getWindDirection(windDir);
  
    return (
        <div style={{ textAlign: 'center' }}>
          <div
            className={styles['arrow-outer']}
            style={{
              '--wind-direction': `${windDir}deg`,
            }}
          >
            <div className={styles['arrow-inner']}>
                <div className="col-2 m-auto mb-2">
                    <Image src={Arrow} alt="arrow" fluid />
                </div>
            </div>
          </div>
          <p>Vind: {direction} ({windDir}°)</p>
        </div>
      );
  };
  