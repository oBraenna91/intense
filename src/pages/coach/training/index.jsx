import React, { useState, useRef } from 'react';
import { IonSegment, IonSegmentButton, IonLabel, IonPage, IonContent, IonHeader, IonToolbar, useIonViewWillEnter } from '@ionic/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import ExerciseList from '../../../components/lists/exercises';
import { useAuth } from '../../../contexts/auth';
import TrainingSessions from '../../../components/subPages/trainingSessions';
import ProgramsList from '../../../components/lists/programs';

const TrainingTabs = () => {
  const { user, profile, coach } = useAuth();
  const [selectedTab, setSelectedTab] = useState('programs');
  const swiperRef = useRef(null);

  const slideOpts = {
    initialSlide: 0,
    speed: 400,
    touchRatio: 0,       
    simulateTouch: false,
    observer: true,            
    observeParents: true 
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
      }, 100);
    }
  });

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
                        <IonLabel>Program</IonLabel>
                    </IonSegmentButton>
                    <IonSegmentButton value="sessions">
                        <IonLabel>Økter</IonLabel>
                    </IonSegmentButton>
                    <IonSegmentButton value="bank">
                        <IonLabel>Øvelser</IonLabel>
                    </IonSegmentButton>
                    </IonSegment>
                </div>
            </IonToolbar>
        </IonHeader>
      <IonContent fullscreen style={{ '--background': 'var(--ion-color-light)' }}>
        <Swiper
          {...slideOpts}
          onSwiper={(swiper) => { swiperRef.current = swiper; }}
          autoHeight={true}
        >
          <SwiperSlide>
            <div style={{ background: 'var(--ion-color-light)' }}>
              <ProgramsList />
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div style={{ background: 'var(--ion-color-light)' }}>
              {user?.id && coach?.id ? (
                <TrainingSessions />
              ) : (
                <p>Laster økter...</p>
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

export default TrainingTabs;