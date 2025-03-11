import { IonContent, IonPage } from "@ionic/react";
import LogoutButton from "../../components/logout-button";
import React from 'react';


export default function LogoutPage() {
    return(
        <IonPage>
            <IonContent>
                <div className="my-5">
                    <LogoutButton />
                </div>
            </IonContent>
        </IonPage>
    )
}