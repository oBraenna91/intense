import React from 'react';
import { IonContent, IonPage, IonHeader, IonToolbar, IonTitle, IonBackButton, IonButtons } from '@ionic/react';
import SignUpForm from '../../components/forms/signUpForm';

export default function SignUpPage() {
    return(
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/login" />
                    </IonButtons>
                    <IonTitle>Register</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <SignUpForm />
            </IonContent>
        </IonPage>
    )
}