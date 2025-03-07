import { IonTitle, IonToolbar, IonPage, IonHeader, IonContent } from '@ionic/react';
import React from 'react';

export default function HistoryPage() {
    return(
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Historiske resultater</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                Her kommer historiske resultater!
            </IonContent>
        </IonPage>
    )
}