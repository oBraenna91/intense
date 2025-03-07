import React from 'react';
import { IonPage, IonContent, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle } from '@ionic/react';
import ResetPasswordForm from '../../components/forms/resetPassword';

export default function ResetPasswordPage() {
    return(
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/login" />
                    </IonButtons>
                    <IonTitle>Forgot Password</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <ResetPasswordForm />
            </IonContent>
        </IonPage>
    )
}