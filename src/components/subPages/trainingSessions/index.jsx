import React, { useState, useEffect } from 'react';
import WorkoutSessionBuilder from '../../forms/coaches/sessions';
import { getTrainingSessions } from '../../../hooks/sessions';
import { IonAccordion, IonAccordionGroup, IonButton, IonIcon, IonItem, IonLabel, IonList, IonModal, IonSelect, IonSelectOption, useIonRouter, useIonViewWillEnter, 
    //IonToggle 
} from '@ionic/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import SessionCards from '../../cards/sessions';
import MuscleSelect from '../../lists/muscles';
import { filterOutline } from 'ionicons/icons';

export default function TrainingSessions({ userId, coachId }) {

    const [sessions, setSessions] = useState([]);
    const [swiperInstance, setSwiperInstance] = useState(null);
    const [loading, setLoading] = useState(false);
    const router = useIonRouter();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMuscle, setSelectedMuscle] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    //const [showMineOnly, setShowMineOnly] = useState(false);
    const [sortDateOrder, setSortDateOrder] = useState('newest');
    const [createSessionModal, setCreateSessionModal] = useState(false);

    useEffect(() => {
        fetchSessions();
        //eslint-disable-next-line
      }, [userId]);
    
      const fetchSessions = async () => {
        setLoading(true);
        try {
          const data = await getTrainingSessions(coachId);
          console.log("Hentede sessions:", data);
          setSessions(data);
        } catch (error) {
          console.error('Feil ved henting av treningsøkter:', error.message);
        } finally {
            setLoading(false);
        }
      };

      useIonViewWillEnter(() => {
        fetchSessions();
      });

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
      

      const handleSessionCreated = (newSession) => {
        setSessions(prevSessions => [newSession, ...prevSessions]);
        if (swiperInstance) {
          swiperInstance.slideTo(0);
        }
      };

      const redirectToCreateSession = () => {
        router.push('/app/create-session', 'forward');
      }

    //   const redirectToSession = (session) => {
    //     router.push(`/app/session/${session.id}`, 'forward');
    //   }

      if(loading) {
        return(<>Laster...</>)
      }
    return(
        <>
        <Swiper onSwiper={setSwiperInstance} style={{ height: '100%' }}>
        <SwiperSlide>
            <div className="d-flex justify-content-center"><h2>Dine treningsøkter</h2></div>
            <IonAccordionGroup>
            <IonAccordion value="filters">
              <IonItem slot="header" lines="none" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <IonLabel>Filtre</IonLabel>
                <IonIcon icon={filterOutline} />
              </IonItem>
              <div className="ion-padding" slot="content">
                  {/* <IonItem style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <IonLabel>Vis kun mine økter</IonLabel>
                    <IonToggle slot="end" checked={showMineOnly} onIonChange={e => setShowMineOnly(e.detail.checked)} />
                  </IonItem> */}
                <IonItem style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <IonLabel>Filtrer på hovedfokus</IonLabel>
                  <MuscleSelect selectedMuscle={selectedMuscle} setSelectedMuscle={setSelectedMuscle} />
                </IonItem>
                <IonItem
                     style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
                <IonItem style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
          <div className="col-12 d-flex justify-content-center">
          <IonButton className="col-10" onClick={redirectToCreateSession}>
              Lag ny økt
            </IonButton>
          </div>
          <div style={{ padding: '16px' }}>
            <IonList>
              {sortedSessions.map((session, index) => (
                <SessionCards key={index} session={session} />
              ))}
            </IonList>
          </div>
        </SwiperSlide>
        <IonModal
            isOpen={createSessionModal}
            onDidDismiss={() => setCreateSessionModal(false)}
            breakpoints={[0, 1]} 
            initialBreakpoint={1} 
            cssClass="straight-modal"
        >
            <div className="modal-content">
                <WorkoutSessionBuilder userId={userId} onSessionCreated={handleSessionCreated}  onBack={() => swiperInstance?.slideTo(0)} />
            </div>
        </IonModal>
      </Swiper>
        </>
    )
}