import { IonButton,  IonContent, IonIcon,  IonPage, IonSpinner, useIonRouter, IonModal } from '@ionic/react';
import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom/cjs/react-router-dom.min';
import styles from './styles.module.scss';
import { chevronBackOutline, stopwatchOutline, timerOutline } from 'ionicons/icons';
import { getSpecificSession } from '../../../hooks/sessions';
import { SwipeableButton } from "react-swipeable-button";
import WorkoutTracker from '../../../components/workoutTracker/tracker';



export default function ClientSpecificSessionPage() {
    const { sessionId } = useParams();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const weekId = queryParams.get('weekId');
    const dayOfWeek = queryParams.get('day');
    const programInfo = {
        weekId,
        dayOfWeek
    }
    const [session, setSession] = useState(null);
    const router = useIonRouter(); 
    const [loading, setLoading] = useState(false);
    const swipeButtonRef = useRef();
    const [showTrackerModal, setShowTrackerModal] = useState(false);

    useEffect(() => {
        const storedWorkout = localStorage.getItem('current-workout');
        if (storedWorkout) {
          try {
            const parsedWorkout = JSON.parse(storedWorkout);
            if (parsedWorkout.sessionId !== sessionId) {
              localStorage.removeItem('current-workout');
              console.log('Fjernet lagret økt fordi sessionId ikke stemte.');
            }
          } catch (error) {
            console.error('Feil ved parsing av localStorage:', error);
          }
        }
      }, [sessionId]);

    useEffect(() => {
        async function loadSession() {
          setLoading(true);
          try {
            const data = await getSpecificSession(sessionId);
            const extendedData = location.state && location.state.programInfo 
              ? { ...data, programInfo: location.state.programInfo }
              : data;
            setSession(extendedData);  
          } catch (error) {
            console.error(error);
          } finally {
            setLoading(false);
          }
        }
      
        if (location.state && location.state.updatedSession) {
          setSession(location.state.updatedSession);
        } else {
          loadSession();
        }
      }, [sessionId, location.state]);


    const exercises = session?.workout_session_exercises || session?.exercises || [];
    const orderCounts = {};
    exercises.forEach(ex => {
        orderCounts[ex.order] = (orderCounts[ex.order] || 0) + 1;
    });

    if(session) {
    return(
        <IonPage style={{ '--padding-top': 'env(safe-area-inset-top)'  }}>
            <IonContent fullscreen >
                <IonButton 
                fill="clear" 
                style={{ position: 'absolute', top: '50px', left: '0px', zIndex: 1000, color: 'white' }}
             onClick={() => router.push('/app/client/training', 'back')}
            >
            <IonIcon icon={chevronBackOutline} /> Tilbake
            </IonButton>
            {loading && (
                <div>
                    <IonSpinner/>
                    Laster...
                </div>
            )}
            <div className={styles.whiteBackground}>
            {session && (
                    <div>
                        <div className={`${styles.imageContainer}`} style={{ backgroundImage: `url(${session.cover_image.image_url})` }}>
                            <div className={styles.overlay}></div>
                        </div>
                        <div className={`${styles.infoContainer}`}>
                            <div className={`${styles.title}`}>{session.title}</div>
                            <div className={`${styles.focus}`}>{session.main_focus}</div>
                        </div>
                        <div className={styles.content}>
                                {exercises.map((exercise, index) => {
                            const isSuperset = orderCounts[exercise.order] > 1;
                            const nextExercise = exercises[index + 1];
                            const hasSameOrderAsNext = nextExercise && exercise.order === nextExercise.order;
                            const prevExercise = exercises[index - 1];
                            const wasPreviousInSuperset = prevExercise && orderCounts[prevExercise.order] > 1;
                            const endedSuperset = wasPreviousInSuperset && prevExercise.order !== exercise.order;
                            
                            const imageUrl = exercise.exercise ? exercise.exercise.image_url : exercise.image_url;
                            const name = exercise.exercise ? exercise.exercise.name : exercise.name;
                            const sets = exercise.workout_session_exercise_sets || exercise.sets || [];
                            
                            return (
                                <div
                                key={exercise.id}
                                className={[
                                    styles.exerciseCard,
                                    isSuperset ? styles.supersetCard : '',
                                    endedSuperset ? styles.afterSuperset : ''
                                ].join(' ')}
                                style={{ marginBottom: isSuperset && hasSameOrderAsNext ? '0' : '16px' }}
                                >
                                    <div className="col-2">
                                        <img src={imageUrl} alt={name} className={styles.exerciseImage} />
                                    </div>
                                    <div className="col-8 ms-2">
                                        <div className={styles.exerciseDetails}>
                                        <div className={`${styles.exerciseName} overshoot `}>{name}</div>
                                        <div className={`${styles.setInfo} sets-container overshoot`}>
                                            {sets.map((s, idx) => (
                                            <span key={idx}>
                                                {s.planned_reps} reps{idx < sets.length - 1 ? ', ' : ''}
                                            </span>
                                            ))}
                                        </div>
                                        </div>
                                    </div>
                                    <div className="col-2">
                                        <div className={styles.setCount}>x{sets.length}</div>
                                    </div>
                                </div>
                            );
                            })}
                        </div>
                    </div>
                )}
                <div className={`reg-pad`}>
                    <div className={`col-12 d-flex flex-column align-items-center justify-content-center ${styles.background} reg-shadow rounded-3 p-2 pb-4`}>
                        <h2 className="text-center">Info om økta</h2>
                        {session && (
                            <div className="d-flex col-11 m-auto justify-content-between">
                                <div className={`d-flex flex-column align-items-center ${styles.iconContainer}`}>
                                <IonIcon icon={stopwatchOutline} style={{ fontSize: '24px' }} />
                                <div className={styles.iconText}>{session.estimated_duration}</div>
                                </div>
                                <div className={`d-flex flex-column align-items-center ${styles.iconContainer}`}>
                                <IonIcon icon={timerOutline} style={{ fontSize: '24px' }} />
                                <div className={styles.iconText}>{session.pause_timer} sek</div>
                                </div>
                                <div className={`d-flex flex-column align-items-center ${styles.iconContainer}`}>
                                <div style={{ fontSize: '24px' }}>💪🏽</div>
                                <div className={styles.iconText}>{session.difficulty}</div>
                                </div>
                            </div>
                            )}
                    </div>
                    {session && (
                        <>
                        <h4 className="text-center mt-5">Beskrivelse:</h4>
                        <div>
                            {session.description}
                        </div>
                        </>
                    )}
                </div>
                <div className=" d-flex flex-column align-items-center col-12">
                    <div className="col-10 d-flex flex-column justify-content-center mt-2 mb-5">
                        <SwipeableButton
                            ref={swipeButtonRef}
                            onSuccess={() => setShowTrackerModal(true)}
                            text="Sveip for å starte økta"
                            text_unlocked="Start økt"
                            sliderColor="lightgreen"
                            autoWidth="true"
                        />
                    </div>
                </div>
            </div>
            <IonModal 
                isOpen={showTrackerModal} 
                onDidDismiss={() => setShowTrackerModal(false)}
                className="straight-modal"
                swipeToClose={false}
            >
                <WorkoutTracker
                    session={session}
                    programInfo={programInfo}
                    onClose={() => setShowTrackerModal(false)}
                />
            </IonModal>
            </IonContent>
        </IonPage>
    )
    }
}