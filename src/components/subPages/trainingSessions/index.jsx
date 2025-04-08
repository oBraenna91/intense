import React, { useState } from 'react';
import { getTrainingSessions } from '../../../hooks/sessions';
import { IonAccordion, IonAccordionGroup, IonButton, IonIcon, IonItem, IonLabel, IonList, IonSelect, IonSelectOption, useIonRouter, useIonViewWillEnter, 
    //IonToggle 
} from '@ionic/react';
import SessionCards from '../../cards/sessions';
import MuscleSelect from '../../lists/muscles';
import { filterOutline } from 'ionicons/icons';
import styles from './styles.module.scss';
import { useAuth } from '../../../contexts/auth';

export default function TrainingSessions() {

  const { user, coach } = useAuth();

  //eslint-disable-next-line
  const userId = user.id;

  const coachId = coach.id;


    const [sessions, setSessions] = useState([]);
    //eslint-disable-next-line
    const [loading, setLoading] = useState(false);
    const router = useIonRouter();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMuscle, setSelectedMuscle] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    const [sortDateOrder, setSortDateOrder] = useState('newest');

      useIonViewWillEnter(() => {
        async function fetchAgain() {
          try {
            const data = await getTrainingSessions(coachId);
            setSessions(data);
          } catch(error) {
            console.error(error);
          }
        }
        fetchAgain();
      },[coachId]);

      const filteredSessions = sessions.filter(session => {
        const searchLower = searchTerm.toLowerCase();
        const titleMatches = session.title.toLowerCase().includes(searchLower);
        const focusMatches = session.main_focus && session.main_focus.toLowerCase().includes(searchLower);
        const muscleMatches = selectedMuscle 
          ? session.main_focus && session.main_focus.toLowerCase() === selectedMuscle.toLowerCase()
          : true;
        return (titleMatches || focusMatches) && muscleMatches;
      });

    const sortedSessions = filteredSessions.sort((a, b) => {
        // Sorter etter opprettelsesdato først
        const dateDiff =
          sortDateOrder === 'newest'
            ? new Date(b.created_at) - new Date(a.created_at)
            : new Date(a.created_at) - new Date(b.created_at);
      
        // Hvis datoene er like, sorter etter tittel
        if (dateDiff !== 0) return dateDiff;
        return sortOrder === 'asc'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      });
      

      // const handleSessionCreated = (newSession) => {
      //   setSessions(prevSessions => [newSession, ...prevSessions]);
      //   if (swiperInstance) {
      //     swiperInstance.slideTo(0);
      //   }
      // };

      const redirectToCreateSession = () => {
        router.push('/app/create-session', 'forward');
      }

    //   const redirectToSession = (session) => {
    //     router.push(`/app/session/${session.id}`, 'forward');
    //   }

    return(
        <div style={{ background: 'var(--ion-color-light)' }}>
            <div className="d-flex justify-content-center"><h2>Dine treningsøkter</h2></div>
            {loading && (
              <div>Laster...</div>
            )}
            <IonAccordionGroup>
            <IonAccordion value="filters">
              <IonItem slot="header" lines="none" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', '--background': 'var(--ion-color-light)', }}>
                <IonLabel>Filtre</IonLabel>
                <IonIcon icon={filterOutline} />
              </IonItem>
              <div className="ion-padding" slot="content" style={{ background: 'var(--ion-color-light)' }}>
                <IonItem style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', '--background': 'var(--ion-color-light)', }}>
                  <IonLabel>Filtrer på hovedfokus</IonLabel>
                  <MuscleSelect selectedMuscle={selectedMuscle} setSelectedMuscle={setSelectedMuscle} />
                </IonItem>
                <IonItem
                     style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', '--background': 'var(--ion-color-light)', }}>
                  <IonLabel>Sorter alfabetisk</IonLabel>
                  <IonSelect
                    slot="end"
                    value={sortOrder}
                    onIonChange={e => setSortOrder(e.detail.value)}
                    interface="alert"
                    interfaceOptions={{ cssClass: 'custom-alert', cancelText: 'Avbryt', okText: 'OK' }}
                  >
                    <IonSelectOption value="asc">A - Å</IonSelectOption>
                    <IonSelectOption value="desc">Å - A</IonSelectOption>
                  </IonSelect>
                </IonItem>
                <IonItem style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', '--background': 'var(--ion-color-light)', }}>
                  <IonLabel>Sorter etter opprettet dato</IonLabel>
                  <IonSelect
                    slot="end"
                    value={sortDateOrder}
                    onIonChange={e => setSortDateOrder(e.detail.value)}
                    interface="alert"
                    interfaceOptions={{ cssClass: 'custom-alert', cancelText: 'Avbryt', okText: 'OK' }}
                  >
                    <IonSelectOption value="newest">Nyeste først</IonSelectOption>
                    <IonSelectOption value="oldest">Eldste først</IonSelectOption>
                  </IonSelect>
                </IonItem>
              </div>
            </IonAccordion>
          </IonAccordionGroup>
          <div className="col-12 d-flex justify-content-center my-2">
            <input
              className="intense-input col-10 rounded-3"
              placeholder="Søk etter økt..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="col-12 d-flex justify-content-center rounded-4">
          <IonButton className="col-10 reg-shadow rounded-4" onClick={redirectToCreateSession}
          style={{ boxShadow: '0px 0px 5px rgba(0,0,0,0.2)' }}>
              Lag ny økt
            </IonButton>
          </div>
          <div style={{ padding: '16px', background: 'var(--ion-color-light)' }}>
            <IonList className="custom-ion-list">
              {sortedSessions.length > 0 ? (
                sortedSessions.map((session, index) => (
                  <SessionCards key={index} session={session} />
                ))
              ): (
                  <div className={`${styles.card}`}>
                      <div className={`${styles.overlay}`}></div>
                      <div className={styles.textDiv}>
                          <div className={styles.title}>Du har ingen økter foreløpig!</div>
                          <div className={styles.focus}></div>
                      </div>
                  </div>
              )
            }
            </IonList>
          </div>
        </div>
    )
}