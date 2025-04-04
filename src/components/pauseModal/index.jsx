import React from 'react';
import { IonModal, IonButton } from '@ionic/react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

export default function PauseModal({ isOpen, pauseCountdown, sessionPauseTimer, onClose }) {
  // Beregn prosent basert på nedtelling
  const percentage = (pauseCountdown / sessionPauseTimer) * 100;

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <div className="d-flex flex-column align-items-center justify-content-center" style={{ padding: '2rem',marginTop: '15vh', textAlign: 'center' }}>
        <h2>Pause</h2>
        <div style={{ width: 150, height: 150, margin: '0 auto' }}>
          <CircularProgressbar
            value={percentage}
            text={`${pauseCountdown}s`}
            styles={buildStyles({
              textSize: '16px',
              pathTransitionDuration: 1,
              //pathColor: `rgba(62, 152, 199, ${pauseCountdown / sessionPauseTimer})`,
              pathColor: '#6ef25a',
              textColor: '#333',
              trailColor: '#d6d6d6'
            })}
          />
        </div>
        <IonButton className="col-12 mt-5" onClick={onClose} style={{ marginTop: '1rem' }}>
          Avbryt pause
        </IonButton>
      </div>
    </IonModal>
  );
}
