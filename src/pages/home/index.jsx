import { IonContent, IonPage } from '@ionic/react';
import React from 'react';
import { useAuth } from '../../contexts/auth';

export default function HomPage() {
    const { profile } = useAuth();

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