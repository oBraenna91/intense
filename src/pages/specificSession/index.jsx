import { IonButton,  IonContent, IonIcon,  IonPage, IonSpinner, useIonRouter, IonRefresher, IonRefresherContent, } from '@ionic/react';
import React from 'react';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import { useFetchSession } from '../../hooks/sessions';
import styles from './styles.module.scss';
import { chevronBackOutline } from 'ionicons/icons';
import { deleteSession } from '../../hooks/sessions';
//import SlideToConfirm from '../../components/sliders/slideToConfirm';



export default function SpecificSessionPage() {
    const { sessionId } = useParams();
    const { session, loading, refetch } = useFetchSession(sessionId);
    const router = useIonRouter(); 
    //const [isEditMode, setIsEditMode] = useState(false);

    const orderCounts = {};
        session?.workout_session_exercises.forEach(ex => {
        orderCounts[ex.order] = (orderCounts[ex.order] || 0) + 1;
    });

    const deleteSessionHandler = async (sessionId) => {
        const confirmed = window.confirm("Er du sikker på at du vil slette økten?");
        if (!confirmed) return;
        
        try {
          await deleteSession(sessionId);
          // For eksempel: vis en melding eller naviger bort etter sletting
        } catch (error) {
          console.error("Feil ved sletting:", error.message);
          // Håndter feilen (for eksempel vis en feilmelding til brukeren)
        }
      };

    const redirectToEdit = (sessionId) => {
        router.push(`/app/session/${sessionId}/edit`, 'forward');
    }

    const hasSuperset = Object.values(orderCounts).some(count => count > 1);

    if (loading) {
        return(<><IonSpinner /></>)
    }

    return(
        <IonPage style={{ '--padding-top': 'env(safe-area-inset-top)'  }}>
            {/* <IonHeader>
                <IonToolbar className="trans-toolbar">
                    <IonButtons slot="start">
                    <IonButton 
                        fill="clear" 
                        style={{ position: 'fixed', top: '20px', left: '0px', zIndex: 1000, color: 'white' }}
                    onClick={() => router.push('/app/training', 'back')}
                    >
                        <IonIcon icon={arrowBackOutline} />
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader> */}
            <IonContent fullscreen >
            <IonRefresher slot="fixed" onIonRefresh={(e) => {
          refetch().then(() => e.detail.complete());
        }}>
          <IonRefresherContent
            pullingText="Dra for å oppdatere..."
            refreshingText="Oppdaterer..."
          />
        </IonRefresher>
                <IonButton 
                fill="clear" 
                style={{ position: 'fixed', top: '50px', left: '0px', zIndex: 1000, color: 'white' }}
             onClick={() => router.push('/app/training', 'back')}
            >
            <IonIcon icon={chevronBackOutline} /> Tilbake
            </IonButton>
                {session.cover_image_url && (
                    <div>
                        <div className={`${styles.imageContainer}`} style={{ backgroundImage: `url(${session.cover_image_url})` }}>
                            <div className={styles.overlay}></div>
                        </div>
                        <div className={`${styles.infoContainer}`}>
                            <div className={`${styles.title}`}>{session.title}</div>
                            <div className={`${styles.focus}`}>{session.main_focus}</div>
                        </div>
                        <div className={styles.content}>
                        {hasSuperset && (
                            <div className={`${styles.legend} col-12 d-flex justify-content-center`}>
                                {/* Eksempel med en liten sirkel i samme farge som supersetCard */}
                                <span className={styles.legendCircle} />
                                <span>Supersett</span>
                            </div>
                        )}
                            {session.workout_session_exercises.map((exercise, index) => {
                                 const isSuperset = orderCounts[exercise.order] > 1; 
                                 const nextExercise = session.workout_session_exercises[index + 1];
                                 const hasSameOrderAsNext = nextExercise && exercise.order === nextExercise.order;
                                 const prevExercise = session.workout_session_exercises[index - 1];
                                 const wasPreviousInSuperset = prevExercise && orderCounts[prevExercise.order] > 1;
                                 const endedSuperset =
                                   wasPreviousInSuperset &&
                                   prevExercise.order !== exercise.order;
                                return (
                                    <div
                                        key={exercise.id}
                                        className={[
                                            styles.exerciseCard,
                                            isSuperset ? styles.supersetCard : '',
                                            endedSuperset ? styles.afterSuperset : ''
                                        ].join(' ')}
                                        style={{
                                            marginBottom: isSuperset && hasSameOrderAsNext ? '0' : '16px'
                                        }}
                                        >
                                        <div className="col-2">
                                            <img
                                                src={exercise.exercise.image_url}
                                                alt={exercise.exercise.name}
                                                className={styles.exerciseImage}
                                            />
                                        </div>
                                        <div className="col-8 ms-2">
                                            <div className={styles.exerciseDetails}>
                                                <div className={styles.exerciseName}>{exercise.exercise.name}</div>
                                                <div className={`${styles.setInfo} sets-container`}>
                                                {exercise.workout_session_exercise_sets.map((s, idx) => (
                                                    <span key={idx}>
                                                    {s.planned_reps} reps
                                                    {idx < exercise.workout_session_exercise_sets.length - 1 ? ', ' : ''}
                                                    </span>
                                                ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-2">
                                            <div className={styles.setCount}>
                                                x{exercise.workout_session_exercise_sets.length}
                                            </div>
                                        </div>
                                    </div>
                                  );
                                })}
                        </div>
                    </div>
                )}
                <div className=" d-flex flex-column align-items-center col-12">
                    <IonButton className="col-10" onClick={() => redirectToEdit(sessionId)}>Rediger denne økten</IonButton>
                    <IonButton className="col-10" style={{ '--background' : 'lightcoral' }} onClick={() => deleteSessionHandler(sessionId)}>Slett økt</IonButton>
                    {/* <SlideToConfirm label="Dra for å slette økten" onConfirm={() => deleteSessionHandler(sessionId)}/> */}
                </div>
            </IonContent>
        </IonPage>
    )
}