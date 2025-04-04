import React from 'react';
import styles from './styles.module.scss';
import { IonIcon, useIonRouter } from '@ionic/react';
import { checkmarkCircleOutline } from 'ionicons/icons';

export default function ClientSessionCards({ session, onClick }) {


  const { title, workout_cover_images, main_focus, 
        id, programInfo, isCompleted
} = session;
  const router = useIonRouter();

  const redirectToSessionPage = () => {
    if(!isCompleted) {
    const params = new URLSearchParams({
      weekId: programInfo.currentWeekRecord.id,
      day: programInfo.dayOfWeek
    }).toString();
    
    router.push(`/app/client/session/${id}?${params}`, 'forward');
    }
  };

  return (
    <div 
      className={`${styles.card}`} 
      style={{ backgroundImage: `url(${workout_cover_images[0]})` }}
      onClick={redirectToSessionPage}
    >
      <div className={`${styles.overlay} ${isCompleted ? styles.completed : ''}`}></div>
      <div className={`${styles.textDiv} ${isCompleted ? styles.completedText : ''}  `}>
        <div className={styles.title}>{title}</div>
        <div className={styles.focus}>{main_focus}</div>
      </div>
      {isCompleted && (
          <div className={styles.checkMark}>
            <IonIcon icon={checkmarkCircleOutline} />
          </div>
        )}
    </div>
  );
}