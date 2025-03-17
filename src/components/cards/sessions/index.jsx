import React from 'react';
import styles from './styles.module.scss';
import { useIonRouter } from '@ionic/react';

export default function SessionCards({ session, onClick }) {

  const { title, cover_image_url, main_focus, 
        id 
} = session;
  const router = useIonRouter();

  const redirectToSessionPage = () => {
    router.push(`/app/session/${id}`)
  }

  return (
    <div 
      className={`${styles.card}`} 
      style={{ backgroundImage: `url(${cover_image_url})` }}
      onClick={redirectToSessionPage}
    >
      <div className={styles.overlay}></div>
      <div className={styles.textDiv}>
        <div className={styles.title}>{title}</div>
        <div className={styles.focus}>{main_focus}</div>
      </div>
    </div>
  );
}