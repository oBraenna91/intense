import React from 'react';
import CircularSlider from '@fseehawer/react-circular-slider';

const PauseCircularSlider = ({ value = 60, onChange }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', color:"#000" }}>
      <CircularSlider
        label="Pause-tid (sek)"
        labelColor="#000"
        width={200}
        min={0}
        max={120}
        dataIndex={value} 
        knobColor="#000" 
        progressColorFrom="#6ef25a"
        progressColorTo="#00bfbd"
        onChange={onChange}
        trackColor='#e3e3e3'
        trackSize={24}
        progressSize={24}
        renderLabelValue={
            // <div style={{ color: 'black', fontSize: '2rem' }}>
            //   {value} sek
            // </div>
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: 'black',
                fontSize: '2.2rem'
              }}>
                {value} sek
              </div>
          }
      />
    </div>
  );
};

export default PauseCircularSlider;
