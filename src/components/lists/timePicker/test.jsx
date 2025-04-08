import React from 'react';
import { CircularInput, CircularTrack, CircularProgress, CircularThumb } from 'react-circular-input';

const PauseCircularInput = ({ seconds, onChange, maxSeconds = 120 }) => {
  
  const normalizedValue = seconds / maxSeconds;

  const handleChange = (value) => {
    const newSeconds = Math.round(value * maxSeconds);
    onChange(newSeconds);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <CircularInput value={normalizedValue} onChange={handleChange} radius={80}>
        <CircularTrack stroke="#e3e3e3" strokeWidth={24} />
        <CircularProgress stroke="#6ef25a" strokeWidth={24} />
        <CircularThumb fill="gray" r={18} />
      </CircularInput>
      <div style={{ marginTop: 16, fontSize: '2em', color: '#000' }}>
        {seconds} sek
      </div>
    </div>
  );
};

export default PauseCircularInput;

