import { IonContent, IonPage } from '@ionic/react';
import React from 'react';
import ExerciseList from '../../components/lists/exercises';
import { useAuth } from '../../contexts/auth';

export default function HomPage() {
    const { user, profile } = useAuth();
    console.log(profile.role);

    return(
        <IonPage>
            <IonContent fullscreen style={{ '--padding-top': 'env(safe-area-inset-top)'  }}>
                <div className="my-5">
                    <h1>TEST HOME</h1>
                </div>
            </IonContent>
        </IonPage>
    )
}