import { IonContent, IonPage, IonHeader, IonToolbar, IonTitle } from '@ionic/react';
import React from 'react';
import useUserIsAdmin from '../../hooks/useIsAdmin';
import WeatherWidget from '../../components/weather';
// import ForecastWidget from '../../components/forecast';
// import WeatherAnimation from '../../components/weatherAnimations';
import styles from './styles.module.scss';

export default function HomePage() {

    const isAdmin = useUserIsAdmin();

    if(isAdmin === null) {
        return(
            <div>Laster...</div>
        )
    }

    return(
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>HJEM</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="main-container">
                {/* <div>
                    Hei! Det er så fint at du er her!
                    {isAdmin && (
                        <div>
                            Du er admin!
                        </div>
                    )}
                </div> */}
                <div className='d-flex flex-column align-items-center pt-4'>
                    <div className={`${styles.overskrift} text-center col-11`}>Været i Lovisenbergveien 70 akkurat nå</div>
                    <WeatherWidget />
                </div>
                {/* <div>
                    <ForecastWidget />
                </div> */}
            </IonContent>
        </IonPage>
    )
}