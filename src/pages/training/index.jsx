// import React from 'react';
// import { IonSegment, IonSegmentButton, IonLabel, IonPage, IonContent, IonSegmentView, IonSegmentContent } from '@ionic/react';
// import ExerciseList from '../../components/lists/exercises';
// import { useAuth } from '../../contexts/auth';

// const TrainingTabs = () => {

//     const { user, profile } = useAuth();

//   return (
//     <IonPage>
//         <IonContent fullscreen style={{ '--padding-top': 'env(safe-area-inset-top)'  }}>
//             <IonSegment mode="md">
//                 <IonSegmentButton value="first" content-id="first">
//                     <IonLabel>First</IonLabel>
//                 </IonSegmentButton>
//                 <IonSegmentButton value="second" content-id="second">
//                     <IonLabel>second</IonLabel>
//                 </IonSegmentButton>
//                 <IonSegmentButton value="third" content-id="third">
//                     <IonLabel>third</IonLabel>
//                 </IonSegmentButton>
//             </IonSegment>
//             <IonSegmentView>
//                 <IonSegmentContent id="first">First</IonSegmentContent>
//                 <IonSegmentContent id="second">second</IonSegmentContent>
//                 <IonSegmentContent id="third"><ExerciseList userId={user.id} userRole={profile.role}/></IonSegmentContent>
//             </IonSegmentView>
//         </IonContent>
//     </IonPage>
//   );
// };

// export default TrainingTabs;

import React, { useState, useRef } from 'react';
import { IonSegment, IonSegmentButton, IonLabel, IonPage, IonContent } from '@ionic/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import ExerciseList from '../../components/lists/exercises';
import { useAuth } from '../../contexts/auth';
import TrainingSessions from '../../components/subPages/trainingSessions';

const TrainingTabs = () => {
  const { user, profile } = useAuth();
  const [selectedTab, setSelectedTab] = useState('programs');
  const swiperRef = useRef(null); // Bruker useRef for å lagre swiper-instansen

  const slideOpts = {
    initialSlide: 0,
    speed: 400,
    touchRatio: 0,       
    simulateTouch: false
  };

  const goToSlide = (index) => {
    if (swiperRef.current && swiperRef.current.slideTo) {
      swiperRef.current.slideTo(index);
    }
  };

  const handleSegmentChange = (e) => {
    const value = e.detail.value;
    setSelectedTab(value);
    if (value === 'programs') goToSlide(0);
    else if (value === 'sessions') goToSlide(1);
    else if (value === 'bank') goToSlide(2);
  };

  return (
    <IonPage>
      <IonContent fullscreen style={{ '--padding-top': 'env(safe-area-inset-top)'  }}>
        <h1>Trening</h1>
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

        <Swiper
          {...slideOpts}
          onSwiper={(swiper) => { swiperRef.current = swiper; }}
        >
          <SwiperSlide>
            <div>Innhold for Treningsøkter</div>
          </SwiperSlide>
          <SwiperSlide>
            <div>
                <TrainingSessions userId={user.id}/>
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

