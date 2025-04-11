import { IonContent, IonPage } from '@ionic/react';
import React, { useEffect } from 'react';
import { useAuth } from '../../contexts/auth';
import { LocalNotifications } from '@capacitor/local-notifications';

export default function HomPage() {
    const { profile } = useAuth();

    useEffect(() => {
        LocalNotifications.requestPermissions().then((result) => {
          if (result.display === 'granted') {
            console.log('Varslings-tillatelse gitt!');
          } else {
            console.log('Brukeren avslo varslings-tillatelse.');
          }
        });
      }, []);

    return(
        <IonPage>
            <IonContent fullscreen style={{ '--padding-top': 'env(safe-area-inset-top)'  }}>
                <div className="my-5">
                    <h1>TEST HOME</h1>
                    <div>du er {profile.role}</div>
                </div>
            </IonContent>
        </IonPage>
    )
}