import React, { useState } from 'react';
import { IonLabel, IonRange } from '@ionic/react';

const SlideToConfirm = ({ onConfirm, label = 'Slide for å bekrefte' }) => {
    const [value, setValue] = useState(8);

    const handleIonChange = (e) => {
      const newVal = e.detail.value;
      setValue(newVal);
      if (newVal >= 100) {
        onConfirm();
        setValue(0);
      }
    };
  
    const handleIonBlur = () => {
      if (value < 100) {
        setValue(0);
      }
    };

  return (
    <div className="col-12 d-flex flex-column align-items-center">
      <IonLabel>{label}</IonLabel>
      <IonRange
      className="col-9"
        min={0}
        max={100}
        step={1}
        value={value}
        pin={true}
        onIonChange={handleIonChange}
        onIonBlur={handleIonBlur}
        style={{
          '--bar-background': '#e0e0e0',       // Bakgrunn for tracken
          '--bar-height': '40px',
          '--bar-padding': '20px',              // Høyden på tracken (gjør den større)
          '--bar-border-radius': '15px',       // Rundede hjørner på tracken
          '--knob-size': '30px',
          '--progress-background': '#6ef25a',  // Farge for fremdriftsdelen
          '--pin-background': '#6ef25a',       
        }}
      />
    </div>
  );
};

export default SlideToConfirm;
