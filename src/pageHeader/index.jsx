import React from 'react';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton } from '@ionic/react';

export default function PageHeader({ title, defaultBackHref }) {
    return (
      <IonHeader>
        <IonToolbar>
          {defaultBackHref !== null && (
            <IonButtons slot="start">
              <IonBackButton defaultHref={defaultBackHref || "/home"} />
            </IonButtons>
          )}
          <IonTitle>{title || "Tittel"}</IonTitle>
        </IonToolbar>
      </IonHeader>
    );
  }