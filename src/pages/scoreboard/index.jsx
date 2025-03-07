import { IonTitle, IonToolbar, IonPage, IonHeader, IonContent } from '@ionic/react';
import React from 'react';

export default function Scoreboard() {
    return(
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Live resultater!</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                Her kommer scoreboard!
            </IonContent>
        </IonPage>
    )
}