import { IonTitle, IonToolbar, IonPage, IonHeader, IonContent } from '@ionic/react';
import React from 'react';
import GamesList from '../../components/lists/games';
import useUserIsAdmin from '../../hooks/useIsAdmin';

export default function GamesPage() {

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
                    <IonTitle>Games</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="main-container">
                <div className="">
                    <GamesList isAdmin={isAdmin} />
                </div>
            </IonContent>
        </IonPage>
    )
}