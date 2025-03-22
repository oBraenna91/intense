import React, { useState, useRef } from 'react';
import { IonSegment, IonSegmentButton, IonLabel, IonPage, IonContent, IonHeader, IonToolbar, useIonViewWillEnter } from '@ionic/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import ExerciseList from '../../components/lists/exercises';
import { useAuth } from '../../contexts/auth';
import TrainingSessions from '../../components/subPages/trainingSessions';
import ProgramsList from '../../components/lists/programs';

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
    <IonPage>
        <IonHeader>
            <IonToolbar className="white-toolbar">
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
      <IonContent fullscreen >
        <Swiper
          {...slideOpts}
          onSwiper={(swiper) => { swiperRef.current = swiper; }}
          autoHeight={true}
        >
          <SwiperSlide>
            <div>
              <ProgramsList />
              {/* <ProgramBuilder /> */}
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div>
              <TrainingSessions userId={user.id} coachId={coach?.id}/>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div>
              <ExerciseList userId={user.id} userRole={profile.role} />
            </div>
          </SwiperSlide>
        </Swiper>
      </IonContent>
    </IonPage>
  );
};

export default TrainingTabs;

