import { IonContent, IonPage } from '@ionic/react';
import React from 'react';

export default function HomPage() {
    return(
        <IonPage>
            <IonContent fullscreen style={{ '--padding-top': 'env(safe-area-inset-top)'  }}>
                Hei
            </IonContent>
        </IonPage>
    )
}