import React from 'react';
import styles from './styles.module.scss';
//import { useIonRouter } from '@ionic/react';

export default function ClientProgramCards({ program }) {
    
    const { title, workout_cover_images, duration, main_focus, is_recurring } = program;
    //const router = useIonRouter();
    

    // const redirectToSpecific = () => {
    //     router.push(`/app/client/program/${program.id}`, 'forward');
    // }

    return ( 
        <div className={`${styles.card}`}
        style={{ backgroundImage: `url(${workout_cover_images.image_url})` }}
        //onClick={redirectToSpecific}
        >
            <div className={`${styles.overlay}`}></div>
            <div className={styles.textDiv}>
                <div className={styles.title}>{title}</div>
                <div className={styles.focus}>{main_focus}</div>
                <div className={styles.duration}>
                    {is_recurring ? 'Gjentakende' : `${duration} uker`}
                </div>
            </div>
        </div>
    )
}