import React, { useState, useRef, useEffect } from 'react';
import { IonSegment, IonSegmentButton, IonLabel, IonPage, IonContent, IonHeader, IonToolbar, useIonViewWillEnter } from '@ionic/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import ExerciseList from '../../../components/lists/exercises';
import { useAuth } from '../../../contexts/auth';
import ClientProgramOverView from '../../../components/subPages/clientProgram';
import ClientProgramCards from '../../../components/cards/programs/clientProgramCard';
import { fetchProgramAndAssignments } from '../../../hooks/programs';

const ClientTrainingTabs = () => {
    //eslint-disable-next-line
  const { user, profile, client } = useAuth();
  const [selectedTab, setSelectedTab] = useState('programs');
  const swiperRef = useRef(null);
  //eslint-disable-next-line
  const [isLoading, setIsLoading] = useState(false);
  const [program, setProgram] = useState(null);

  const slideOpts = {
    initialSlide: 0,
    speed: 400,
    touchRatio: 0,       
    simulateTouch: false,
    observer: true,            
    observeParents: true,
    autoHeight: true, // Legg til denne
    updateOnWindowResize: true
  };

  const goToSlide = (index) => {
    if (swiperRef.current && swiperRef.current.slideTo) {
      swiperRef.current.slideTo(index);
    }
  };

  useIonViewWillEnter(() => {
    if (swiperRef.current) {
      setTimeout(() => {
        swiperRef.current.update();
        swiperRef.current.updateAutoHeight();
      }, 100);
    }
  });

  // useEffect(() => {
  //         async function getProgram() {
  //             setIsLoading(true);
  //             try{
  //                 const response = await fetchProgramAndAssignments(client.id);
  //                 //console.log(response);
  //                 setProgram(response);
  //             } catch(error) {
  //                 console.error(error);
  //             } finally {
  //                 setIsLoading(false);
  //             }
  //         }
  //         if (client && client.id) {
  //           getProgram();
  //         }
  //     }, [client]);

  useEffect(() => {
    async function getPrograms(){
      setIsLoading(true);
      try {
        const response= await fetchProgramAndAssignments(client.id);
        setProgram(response);
        if (swiperRef.current) {
          setTimeout(() => {
            swiperRef.current.update();
            swiperRef.current.updateAutoHeight();
          }, 100);
        }
      } catch(error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    getPrograms();
  }, [client.id])


  const handleSegmentChange = (e) => {
    const value = e.detail.value;
    setSelectedTab(value);
    if (value === 'programs') goToSlide(0);
    else if (value === 'sessions') goToSlide(1);
    else if (value === 'bank') goToSlide(2);
  };

  return (
    <IonPage style={{ backgroundColor: 'var(--ion-color-light)' }}>
        <IonHeader>
            <IonToolbar className="white-toolbar"
              style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}
            >
                <div className="d-flex flex-column">
                    <h1 style={{padding: '16px'}}>Treningssenter</h1>
                    <IonSegment mode="md" value={selectedTab} onIonChange={handleSegmentChange}>
                    <IonSegmentButton value="programs">
                        <IonLabel>I dag</IonLabel>
                    </IonSegmentButton>
                    <IonSegmentButton value="sessions">
                        <IonLabel>Program</IonLabel>
                    </IonSegmentButton>
                    <IonSegmentButton value="bank">
                        <IonLabel>Øvelser</IonLabel>
                    </IonSegmentButton>
                    </IonSegment>
                </div>
            </IonToolbar>
        </IonHeader>
      <IonContent fullscreen style={{ '--background': 'var(--ion-color-light)' }}>
        {isLoading && (
          <div>Laster</div>
        )}
        <Swiper
          {...slideOpts}
          onSwiper={(swiper) => { swiperRef.current = swiper; }}
          autoHeight={true}
        >
          <SwiperSlide>
            <div style={{ background: 'var(--ion-color-light)' }}>
              <ClientProgramOverView program={program} />
            </div>
          </SwiperSlide>
          <SwiperSlide>
             <h2 className="text-center">Ditt program</h2>
             <div className="ion-padding" style={{ background: 'var(--ion-color-light)' }}>
             {program?.program ? (
      <>
        <ClientProgramCards program={program.program} />
        <div className="">
          {program.program.description}
        </div>
      </>
    ) : (
      <div>Laster program...</div>
    )}
             </div>
          </SwiperSlide>
          <SwiperSlide>
            <div style={{ background: 'var(--ion-color-light)' }}>
              <ExerciseList userId={user.id} userRole={profile.role} />
            </div>
          </SwiperSlide>
        </Swiper>
      </IonContent>
    </IonPage>
  );
};

export default ClientTrainingTabs;

