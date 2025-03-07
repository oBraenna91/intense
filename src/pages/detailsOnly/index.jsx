import { IonBackButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import React from 'react';
import AddServiceForm from '../../components/forms/addService';

export default function DetailsOnlyPage() {
    return(
        <IonPage>
            <IonHeader>
                <IonToolbar color="primary">
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/app/home"/>
                    </IonButtons>
                    <IonTitle>Add new service</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <AddServiceForm />
            </IonContent>
        </IonPage>
    )
}