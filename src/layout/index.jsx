import React from 'react';
import { IonPage, IonFooter, IonContent } from '@ionic/react';
import Header from '../components/header';

export default function Layout({ children }) {
  return (
    <IonPage>
      <IonContent>
        {children}
      </IonContent>
      <IonFooter>
        <Header/>
      </IonFooter>
    </IonPage>
  );
}