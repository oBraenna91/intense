import { IonButton,  IonContent, IonIcon,  IonPage, IonSpinner, useIonRouter} from '@ionic/react';
import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom/cjs/react-router-dom.min';
import styles from './styles.module.scss';
import { chevronBackOutline } from 'ionicons/icons';
import { deleteSession, getSpecificSession } from '../../hooks/sessions';
//import SlideToConfirm from '../../components/sliders/slideToConfirm';
import { SwipeableButton } from "react-swipeable-button";



export default function SpecificSessionPage() {
    const { sessionId } = useParams();
    //const { session, loading } = useFetchSession(sessionId);
    const [session, setSession] = useState(null);
    const router = useIonRouter(); 
    const [loading, setLoading] = useState(false);
    //const [isEditMode, setIsEditMode] = useState(false);
    const swipeButtonRef = useRef();

    const location = useLocation();
    useEffect(() => {
        if (location.state && location.state.updatedSession) {
            setSession(location.state.updatedSession);
        } else {
            async function loadSession() {
                setLoading(true);
                try {
                const data = await getSpecificSession(sessionId);
                setSession(data);  
                } catch (error) {
                console.error(error);
                } finally {
                setLoading(false);
                }
            }
            loadSession();
        }
    }, [sessionId, location.state]);


    const exercises = session?.workout_session_exercises || session?.exercises || [];
    const orderCounts = {};
    exercises.forEach(ex => {
        orderCounts[ex.order] = (orderCounts[ex.order] || 0) + 1;
    });


    const deleteSessionHandler = async (sessionId) => {
        const confirmed = window.confirm("Er du sikker på at du vil slette økten?");
        if (!confirmed) {
            if (swipeButtonRef.current) {
                swipeButtonRef.current.buttonReset();
              }
              return;
        }
        try {
          await deleteSession(sessionId);
          alert('Økten er slettet ❌')
          router.push('/app/training', 'back');
        } catch (error) {
          console.error("Feil ved sletting:", error.message);
        }
      };

    const redirectToEdit = (sessionId) => {
        router.push(`/app/session/${sessionId}/edit`, 'forward');
    }

    //const hasSuperset = Object.values(orderCounts).some(count => count > 1);

    if (loading) {
        return (
          <IonPage>
            <IonContent>
              <IonSpinner />
            </IonContent>
          </IonPage>
        );
      }

    if(session) {
    return(
        <IonPage style={{ '--padding-top': 'env(safe-area-inset-top)'  }}>
            <IonContent fullscreen >
                <IonButton 
                fill="clear" 
                style={{ position: 'fixed', top: '50px', left: '0px', zIndex: 1000, color: 'white' }}
             onClick={() => router.push('/app/training', 'back')}
            >
            <IonIcon icon={chevronBackOutline} /> Tilbake
            </IonButton>
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
                                    <div className={styles.exerciseName}>{name}</div>
                                    <div className={`${styles.setInfo} sets-container`}>
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
                <div className="reg-pad">
                    <h2>Pause mellom sett:</h2>
                    <div>{session.pause_timer} sek</div>
                </div>
                <div className="reg-pad">
                    <h2>Beskrivelse</h2>
                    <div>
                        {session.description}
                    </div>
                </div>
                <div className=" d-flex flex-column align-items-center col-12">
                    <IonButton className="col-10" onClick={() => redirectToEdit(sessionId)}>Rediger denne økten</IonButton>
                    {/* <IonButton className="col-10" style={{ '--background' : 'lightcoral' }} onClick={() => deleteSessionHandler(sessionId)}>Slett økt</IonButton> */}
                    {/* <SlideToConfirm label="Dra for å slette økten" onConfirm={() => deleteSessionHandler(sessionId)}/> */}
                    <div className="col-10 d-flex flex-column justify-content-center mt-2 mb-5">
                        <SwipeableButton
                            ref={swipeButtonRef}
                            onSuccess={() => deleteSessionHandler(sessionId)}
                            text="Sveip for å slette"
                            text_unlocked="Slett økt"
                            sliderColor="lightcoral"
                            autoWidth="true"
                        />
                    </div>
                </div>
            </div>
            </IonContent>
        </IonPage>
    )
    }
}